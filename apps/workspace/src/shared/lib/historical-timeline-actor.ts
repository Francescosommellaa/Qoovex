export type HistoricalTimelineActor = {
  publicRoleLabel: string | null;
  user: {
    firstName: string | null;
    lastName: string | null;
  };
};

export type HistoricalTimelineActorParticipant = HistoricalTimelineActor & {
  id: string;
};

export function projectHistoricalTimelineActors<
  TEvent extends { actorParticipantId: string | null },
>(events: TEvent[], participants: HistoricalTimelineActorParticipant[]) {
  const participantsById = new Map(
    participants.map(({ id, ...actor }) => [id, actor]),
  );

  return events.map((event) => ({
    ...event,
    actorParticipant: event.actorParticipantId
      ? participantsById.get(event.actorParticipantId) ?? null
      : null,
  }));
}
