import type { PrismaClient } from "../generated/prisma/client";

type ParticipantReferenceRow = {
  organizationId: string;
  jobSiteId: string;
  openedByParticipantId: string;
};

type ParticipantReferenceIntegrityResult = {
  jobSiteMismatches: number;
  organizationMismatches: number;
  orphans: number;
  rows: number;
};

async function verifyOpenedByParticipantReference(
  prisma: PrismaClient,
  model: "JobSiteRequest" | "JobSiteDispute" | "JobSitePostClosureRequest",
  rows: ParticipantReferenceRow[],
): Promise<ParticipantReferenceIntegrityResult> {
  const participantIds = [...new Set(rows.map((row) => row.openedByParticipantId))];
  const participants = await prisma.jobSiteParticipant.findMany({
    where: { id: { in: participantIds } },
    select: { id: true, jobSiteId: true, organizationId: true },
  });
  const participantsById = new Map(participants.map((participant) => [participant.id, participant]));
  let orphans = 0;
  let jobSiteMismatches = 0;
  let organizationMismatches = 0;

  for (const row of rows) {
    const participant = participantsById.get(row.openedByParticipantId);
    if (!participant) {
      orphans += 1;
      continue;
    }
    if (participant.jobSiteId !== row.jobSiteId) jobSiteMismatches += 1;
    if (participant.organizationId !== row.organizationId) organizationMismatches += 1;
  }

  const result = { rows: rows.length, orphans, jobSiteMismatches, organizationMismatches };
  console.log(`[participant-reference-integrity] ${model} rows=${result.rows} orphans=${result.orphans} jobSiteMismatch=${result.jobSiteMismatches} organizationMismatch=${result.organizationMismatches}`);
  if (orphans || jobSiteMismatches || organizationMismatches) {
    throw new Error(`${model} contains openedByParticipant integrity violations.`);
  }
  return result;
}

export async function verifyParticipantReferenceIntegrity(prisma: PrismaClient) {
  await verifyOpenedByParticipantReference(
    prisma,
    "JobSiteRequest",
    await prisma.jobSiteRequest.findMany({ select: { organizationId: true, jobSiteId: true, openedByParticipantId: true } }),
  );
  await verifyOpenedByParticipantReference(
    prisma,
    "JobSiteDispute",
    await prisma.jobSiteDispute.findMany({ select: { organizationId: true, jobSiteId: true, openedByParticipantId: true } }),
  );
  await verifyOpenedByParticipantReference(
    prisma,
    "JobSitePostClosureRequest",
    await prisma.jobSitePostClosureRequest.findMany({ select: { organizationId: true, jobSiteId: true, openedByParticipantId: true } }),
  );
}
