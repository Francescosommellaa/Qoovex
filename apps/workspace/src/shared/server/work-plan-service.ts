import "server-only";

import { assertLimitAvailable, getPlanLimit } from "@shared/config/plan-rules";
import type {
  LimitStatus,
  WorkPlanDetailDto,
  WorkPlanInput,
  WorkPlanSummaryDto,
  WorkTaskInput,
  WorkspacePlan,
} from "@shared/lib/workspace-types";
import { findUserSummaryByIdentifier } from "@shared/server/repositories/user-repository";
import {
  addMemberToWorkPlanForCreator,
  completeWorkTaskForMember,
  countCreatedWorkPlansForUser,
  countJoinedWorkPlansForUser,
  createWorkPlanForUser,
  createWorkTaskForCreator,
  findWorkPlanDetailForUser,
  listWorkPlansForUser,
} from "@shared/server/repositories/work-plan-repository";
import { createPersistentNotification } from "@shared/server/notification-service";
import { findRecipeDetailForUser } from "@shared/server/repositories/recipe-repository";
import { WorkspaceValidationError } from "@shared/server/recipe-service";

function normalizeWorkPlanInput(input: WorkPlanInput): WorkPlanInput {
  const title = input.title.trim();
  if (!title) {
    throw new WorkspaceValidationError("Il titolo del piano e obbligatorio.");
  }

  return {
    title,
    description: input.description?.trim() || undefined,
  };
}

function normalizeWorkTaskInput(input: WorkTaskInput): WorkTaskInput {
  const title = input.title.trim();
  if (!title) {
    throw new WorkspaceValidationError("Il titolo del task e obbligatorio.");
  }

  return {
    title,
    description: input.description?.trim() || undefined,
    recipeId: input.recipeId?.trim() || null,
  };
}

function mapWorkPlanSummary(
  plan: Awaited<ReturnType<typeof listWorkPlansForUser>>[number],
  userId: string,
): WorkPlanSummaryDto {
  const taskCount = plan.tasks.length;

  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    creatorId: plan.creatorId,
    creatorName: plan.creator.name,
    taskCount,
    completedTaskCount: plan.tasks.filter((task) => task.completedAt).length,
    memberCount: plan.members.length,
    createdAt: plan.createdAt.toISOString(),
    role: plan.creatorId === userId ? "creator" : "member",
  };
}

function mapWorkPlanDetail(
  plan: NonNullable<Awaited<ReturnType<typeof findWorkPlanDetailForUser>>>,
  userId: string,
  membersLimit: LimitStatus,
): WorkPlanDetailDto {
  return {
    ...mapWorkPlanSummary(plan, userId),
    tasks: plan.tasks.map((task) => ({
      ...task,
      completedAt: task.completedAt?.toISOString() ?? null,
    })),
    members: plan.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      name: member.user.name,
      username: member.user.username,
    })),
    canCreateTask: plan.creatorId === userId,
    canAddMember: plan.creatorId === userId && !membersLimit.reached,
    membersLimit,
  };
}

export async function getWorkPlanCreationLimitStatus(
  userId: string,
  plan: WorkspacePlan,
): Promise<LimitStatus> {
  return getPlanLimit(plan, "creatable_work_plans", await countCreatedWorkPlansForUser(userId));
}

export async function getWorkPlansIndex(userId: string, plan: WorkspacePlan, take = 50) {
  const [workPlans, createdCount, joinedCount] = await Promise.all([
    listWorkPlansForUser(userId, take),
    countCreatedWorkPlansForUser(userId),
    countJoinedWorkPlansForUser(userId),
  ]);

  return {
    workPlans: workPlans.map((workPlan) => mapWorkPlanSummary(workPlan, userId)),
    createdCount,
    joinedCount,
    creationLimit: getPlanLimit(plan, "creatable_work_plans", createdCount),
  };
}

export async function getWorkPlanDetail(
  userId: string,
  plan: WorkspacePlan,
  workPlanId: string,
) {
  const workPlan = await findWorkPlanDetailForUser(workPlanId, userId);
  if (!workPlan) return null;

  const membersLimit = getPlanLimit(plan, "members_per_plan", workPlan.members.length);
  return mapWorkPlanDetail(workPlan, userId, membersLimit);
}

export async function createWorkPlan(userId: string, plan: WorkspacePlan, input: WorkPlanInput) {
  const creationLimit = await getWorkPlanCreationLimitStatus(userId, plan);
  assertLimitAvailable(creationLimit, "Il tuo piano non consente di creare altri piani di lavoro.");
  return await createWorkPlanForUser(userId, normalizeWorkPlanInput(input));
}

export async function addWorkPlanMember(
  creatorId: string,
  plan: WorkspacePlan,
  workPlanId: string,
  identifier: string,
) {
  const workPlan = await findWorkPlanDetailForUser(workPlanId, creatorId);
  if (!workPlan || workPlan.creatorId !== creatorId) {
    throw new WorkspaceValidationError("Solo il creator puo aggiungere membri.");
  }

  const membersLimit = getPlanLimit(plan, "members_per_plan", workPlan.members.length);
  assertLimitAvailable(membersLimit, "Hai raggiunto il limite membri del piano.");

  const user = await findUserSummaryByIdentifier(identifier);
  if (!user) {
    throw new WorkspaceValidationError("Utente non trovato.");
  }

  if (user.id === creatorId) {
    throw new WorkspaceValidationError("Il creator e gia nel piano.");
  }

  return await addMemberToWorkPlanForCreator(workPlanId, creatorId, user.id);
}

async function getRecipeSnapshot(userId: string, recipeId?: string | null) {
  if (!recipeId) return null;

  const recipe = await findRecipeDetailForUser(recipeId, userId);
  if (!recipe) return null;

  return {
    id: recipe.id,
    title: recipe.title,
    servings: recipe.servings,
    ingredients: recipe.ingredients.map((item) => ({
      name: item.ingredient.name,
      quantity: item.quantity,
      unit: item.unit,
      allergens: item.ingredient.allergens,
    })),
    capturedAt: new Date().toISOString(),
  };
}

export async function createWorkTask(
  creatorId: string,
  workPlanId: string,
  input: WorkTaskInput,
) {
  const normalized = normalizeWorkTaskInput(input);
  const recipeSnapshot = await getRecipeSnapshot(creatorId, normalized.recipeId);

  return await createWorkTaskForCreator(workPlanId, creatorId, {
    title: normalized.title,
    description: normalized.description,
    recipeId: recipeSnapshot ? normalized.recipeId : null,
    recipeSnapshot,
  });
}

export async function completeWorkTask(userId: string, workPlanId: string, taskId: string) {
  const result = await completeWorkTaskForMember(workPlanId, taskId, userId);
  if (!result) return null;

  if (result.wasCompleted && result.creatorId !== userId) {
    await createPersistentNotification({
      userId: result.creatorId,
      type: "work_task.completed",
      title: "Task completato",
      body: `${result.task.title} e stato completato in ${result.planTitle}.`,
      data: {
        workPlanId,
        taskId,
      },
    });
  }

  return result;
}
