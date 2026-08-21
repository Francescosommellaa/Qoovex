import { describe, expect, it } from "vitest";
import { projectHistoricalTimelineActors } from "./historical-timeline-actor";

const participants = [
  {
    id: "participant-a",
    publicRoleLabel: "Responsabile operativo",
    user: { firstName: "Azienda", lastName: "Test" },
  },
];

describe("projectHistoricalTimelineActors", () => {
  it("projects the public actor fields from a matching historical participant id", () => {
    const [event] = projectHistoricalTimelineActors(
      [{ actorParticipantId: "participant-a", payload: { requestId: "request-a" } }],
      participants,
    );

    expect(event.actorParticipant).toEqual({
      publicRoleLabel: "Responsabile operativo",
      user: { firstName: "Azienda", lastName: "Test" },
    });
    expect(event.actorParticipant).not.toHaveProperty("id");
  });

  it("keeps system events without a participant actor", () => {
    const [event] = projectHistoricalTimelineActors(
      [{ actorParticipantId: null }],
      participants,
    );

    expect(event.actorParticipant).toBeNull();
  });

  it("does not resolve a participant outside the selected JobSite projection", () => {
    const [event] = projectHistoricalTimelineActors(
      [{ actorParticipantId: "participant-other-job-site" }],
      participants,
    );

    expect(event.actorParticipant).toBeNull();
  });
});
