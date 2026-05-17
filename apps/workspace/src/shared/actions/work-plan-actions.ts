"use server";

import { revalidatePath } from "next/cache";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import type { ActionResult, WorkPlanInput, WorkTaskInput } from "@shared/lib/workspace-types";
import {
  addWorkPlanMember,
  completeWorkTask,
  createWorkPlan,
  createWorkTask,
} from "@shared/server/work-plan-service";
import { WorkspaceValidationError } from "@shared/server/recipe-service";

function toActionError<T>(error: unknown, fallback: string): ActionResult<T> {
  if (error instanceof WorkspaceValidationError || error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: fallback };
}

export async function createWorkPlanAction(
  input: WorkPlanInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const workPlan = await createWorkPlan(user.id, user.plan, input);
    revalidatePath("/work-plans");
    revalidatePath("/dashboard");
    return { ok: true, message: "Piano di lavoro creato.", data: workPlan };
  } catch (error) {
    return toActionError(error, "Impossibile creare il piano.");
  }
}

export async function addWorkPlanMemberAction(
  workPlanId: string,
  identifier: string,
): Promise<ActionResult> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const member = await addWorkPlanMember(user.id, user.plan, workPlanId, identifier);
    if (!member) return { ok: false, message: "Membro gia presente o non aggiungibile." };

    revalidatePath(`/work-plans/${workPlanId}`);
    return { ok: true, message: "Membro aggiunto." };
  } catch (error) {
    return toActionError(error, "Impossibile aggiungere il membro.");
  }
}

export async function createWorkTaskAction(
  workPlanId: string,
  input: WorkTaskInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const task = await createWorkTask(user.id, workPlanId, input);
    if (!task) return { ok: false, message: "Solo il creator puo creare task." };

    revalidatePath(`/work-plans/${workPlanId}`);
    revalidatePath("/work-plans");
    revalidatePath("/dashboard");
    return { ok: true, message: "Task creato.", data: task };
  } catch (error) {
    return toActionError(error, "Impossibile creare il task.");
  }
}

export async function completeWorkTaskAction(
  workPlanId: string,
  taskId: string,
): Promise<ActionResult> {
  const user = await bootstrapUser();
  if (!user) return { ok: false, message: "Sessione non valida." };

  try {
    const task = await completeWorkTask(user.id, workPlanId, taskId);
    if (!task) return { ok: false, message: "Task non trovato." };

    revalidatePath(`/work-plans/${workPlanId}`);
    revalidatePath("/work-plans");
    revalidatePath("/dashboard");
    return {
      ok: true,
      message: task.wasCompleted ? "Task completato." : "Task riaperto.",
    };
  } catch (error) {
    return toActionError(error, "Impossibile aggiornare il task.");
  }
}
