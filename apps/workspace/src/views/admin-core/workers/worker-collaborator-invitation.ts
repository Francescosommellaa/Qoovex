export interface WorkerCollaboratorInvitation extends Record<string, unknown> {
  email: string;
  role: "COLLABORATOR";
  preset: "LIMITED_UPLOAD";
  scopeMode: "ASSIGNED";
  workerId: string;
}

export function buildWorkerCollaboratorInvitation(email: string, workerId: string): WorkerCollaboratorInvitation {
  return {
    email,
    role: "COLLABORATOR",
    preset: "LIMITED_UPLOAD",
    scopeMode: "ASSIGNED",
    workerId,
  };
}
