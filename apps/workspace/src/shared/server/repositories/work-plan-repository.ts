import "server-only";

import { db, type Prisma } from "@qoovex/db";
import type { WorkPlanInput } from "@shared/lib/workspace-types";

const workPlanSummarySelect = {
  id: true,
  title: true,
  description: true,
  creatorId: true,
  createdAt: true,
  creator: { select: { username: true } },
  members: {
    select: { id: true },
  },
  tasks: {
    select: {
      completedAt: true,
    },
  },
} as const;

const workPlanDetailSelect = {
  ...workPlanSummarySelect,
  members: {
    orderBy: { joinedAt: "asc" },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  },
  tasks: {
    orderBy: { position: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      recipeId: true,
      recipeSnapshot: true,
      completedAt: true,
      completedBy: true,
      position: true,
    },
  },
} as const;

export async function countCreatedWorkPlansForUser(userId: string) {
  return await db.workPlan.count({ where: { creatorId: userId } });
}

export async function countJoinedWorkPlansForUser(userId: string) {
  return await db.workPlanMember.count({
    where: {
      userId,
      workPlan: { creatorId: { not: userId } },
    },
  });
}

export async function listWorkPlansForUser(userId: string, take = 50) {
  return await db.workPlan.findMany({
    where: {
      OR: [{ creatorId: userId }, { members: { some: { userId } } }],
    },
    orderBy: { createdAt: "desc" },
    take,
    select: workPlanSummarySelect,
  });
}

export async function findWorkPlanDetailForUser(workPlanId: string, userId: string) {
  return await db.workPlan.findFirst({
    where: {
      id: workPlanId,
      OR: [{ creatorId: userId }, { members: { some: { userId } } }],
    },
    select: workPlanDetailSelect,
  });
}

export async function createWorkPlanForUser(userId: string, input: WorkPlanInput) {
  return await db.workPlan.create({
    data: {
      title: input.title,
      description: input.description || null,
      creatorId: userId,
      members: {
        create: {
          userId,
        },
      },
    },
    select: { id: true },
  });
}

export async function addMemberToWorkPlanForCreator(
  workPlanId: string,
  creatorId: string,
  userId: string,
) {
  return await db.$transaction(async (tx) => {
    const workPlan = await tx.workPlan.findFirst({
      where: { id: workPlanId, creatorId },
      select: { id: true },
    });
    if (!workPlan) return null;

    return await tx.workPlanMember
      .create({
        data: { workPlanId, userId },
        select: { id: true },
      })
      .catch(() => null);
  });
}

export async function createWorkTaskForCreator(
  workPlanId: string,
  creatorId: string,
  input: {
    title: string;
    description?: string | null;
    recipeId?: string | null;
    recipeSnapshot?: unknown;
  },
) {
  return await db.$transaction(async (tx) => {
    const plan = await tx.workPlan.findFirst({
      where: { id: workPlanId, creatorId },
      select: { id: true, _count: { select: { tasks: true } } },
    });
    if (!plan) return null;

    return await tx.workTask.create({
      data: {
        workPlanId,
        title: input.title,
        description: input.description || null,
        recipeId: input.recipeId || null,
        recipeSnapshot:
          input.recipeSnapshot === undefined
            ? undefined
            : (input.recipeSnapshot as Prisma.InputJsonValue),
        position: plan._count.tasks,
      },
      select: { id: true },
    });
  });
}

export async function completeWorkTaskForMember(
  workPlanId: string,
  taskId: string,
  userId: string,
) {
  return await db.$transaction(async (tx) => {
    const plan = await tx.workPlan.findFirst({
      where: {
        id: workPlanId,
        OR: [{ creatorId: userId }, { members: { some: { userId } } }],
      },
      select: {
        id: true,
        creatorId: true,
        title: true,
        tasks: {
          where: { id: taskId },
          select: { id: true, title: true, completedAt: true },
        },
      },
    });
    const task = plan?.tasks[0];
    if (!plan || !task) return null;

    const completedAt = task.completedAt ? null : new Date();
    const updatedTask = await tx.workTask.update({
      where: { id: taskId },
      data: {
        completedAt,
        completedBy: completedAt ? userId : null,
      },
      select: {
        id: true,
        title: true,
        completedAt: true,
        completedBy: true,
      },
    });

    return {
      task: updatedTask,
      creatorId: plan.creatorId,
      planTitle: plan.title,
      wasCompleted: Boolean(completedAt),
    };
  });
}
