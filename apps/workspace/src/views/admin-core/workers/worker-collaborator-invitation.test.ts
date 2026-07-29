import { describe, expect, it } from "vitest";
import { buildWorkerCollaboratorInvitation } from "./worker-collaborator-invitation";

describe("buildWorkerCollaboratorInvitation", () => {
  it("creates a Collaborator invitation linked to the operational worker profile", () => {
    expect(buildWorkerCollaboratorInvitation("mario@example.com", "worker-1")).toEqual({
      email: "mario@example.com",
      role: "COLLABORATOR",
      preset: "LIMITED_UPLOAD",
      scopeMode: "ASSIGNED",
      workerId: "worker-1",
    });
  });
});
