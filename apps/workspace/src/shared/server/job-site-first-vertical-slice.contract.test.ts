import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function between(value: string, start: string, end: string) {
  const startIndex = value.indexOf(start);
  const endIndex = value.indexOf(end, startIndex + start.length);
  expect(startIndex, `Missing start marker: ${start}`).toBeGreaterThanOrEqual(0);
  expect(endIndex, `Missing end marker: ${end}`).toBeGreaterThan(startIndex);
  return value.slice(startIndex, endIndex);
}

const jobSiteService = source("src/shared/server/job-site-lifecycle-service.ts");
const accessContext = source("src/shared/server/access-context-service.ts");
const authorization = source("src/shared/server/job-site-authorization-service.ts");
const actionService = source("src/shared/server/job-site-action-service.ts");
const collaboration = source("src/shared/server/job-site-collaboration-service.ts");
const idempotency = source("src/shared/server/job-site-idempotency-service.ts");
const schema = source("../../packages/db/prisma/schema.prisma");
const createRoute = source("src/app/api/job-sites/route.ts");
const invitationRoute = source("src/app/api/job-sites/[jobSiteId]/client-invitations/route.ts");
const clientActionRoute = source("src/app/api/client/job-sites/[jobSiteId]/actions/route.ts");
const clientTimelineRoute = source("src/app/api/client/job-sites/[jobSiteId]/timeline/route.ts");

describe("first vertical slice - verified green guardrails", () => {
  it("derives organization, actor and permission server-side for creation and invitation", () => {
    const create = between(jobSiteService, "export async function createJobSite", "export async function getOrganizationJobSiteDetail");
    expect(createRoute).toContain("createJobSite(await requireCurrentOrganizationId()");
    expect(create).toContain("const context = await requireOrganizationContext(organizationId)");
    expect(create).toContain('requireContextPermission(context, "jobSites:create")');
    expect(create).toContain("userId: context.userId");
    expect(invitationRoute).toContain('permission: "jobSite:participants:manage"');
    expect(invitationRoute).toContain("invitePrimaryClientIdempotent({ actor");
  });

  it("keeps invitation acceptance pending at JobSite level until the initial summary", () => {
    const accept = between(jobSiteService, "export async function acceptPrimaryClientInvitation", "export async function invitePrimaryClientIdempotent");
    expect(accept).toContain('status: "ACCEPTED"');
    expect(accept).toContain('status: "PENDING_INITIAL_CONFIRMATION"');
    expect(actionService).toContain('allowPendingClient: action.action === "INITIAL_AGREEMENT_CONFIRM@1"');
    expect(actionService).toContain('case "INITIAL_AGREEMENT_CONFIRM@1"');
    expect(actionService).toContain('status: "ACTIVE", accessVersion: { increment: 1 }');
    expect(actionService).toContain('activeKey: `${actor.jobSiteId}:${actor.userId}:CLIENT`');
    expect(actionService).toContain('data: { status: "ACTIVE" }');
  });

  it("derives the client invitation page state from the real invitation and participation", () => {
    const preview = between(jobSiteService, "export async function getClientInvitationPageState", "export async function invitePrimaryClientIdempotent");
    expect(preview).toContain('acceptedByParticipant: { select: { userId: true, jobSiteId: true, status: true } }');
    expect(preview).toContain('invitation.status === "REVOKED"');
    expect(preview).toContain('invitation.status === "ACCEPTED"');
    expect(preview).toContain('invitation.expiresAt <= new Date()');
    expect(preview).toContain('identity.email.toLowerCase() !== invitation.emailNormalized');
    expect(preview).toContain('identity.accountRole !== "CLIENT"');
  });

  it("binds client access to the authenticated user and exact JobSite", () => {
    const clientContext = between(accessContext, "export async function requireClientJobSiteContext", "export async function requireClientInitialAgreementContext");
    expect(clientContext).toContain('where: { jobSiteId, userId: user.id, kind: "CLIENT", status: "ACTIVE" }');
    expect(authorization).toContain("const participant = await requireClientJobSiteContext(jobSiteId)");
    expect(authorization).toContain("const participant = await requireClientInitialAgreementContext(jobSiteId)");
    expect(clientActionRoute).toContain('action.action === "INITIAL_AGREEMENT_CONFIRM@1"');
    expect(clientActionRoute).toContain("resolveClientInitialAgreementActor(jobSiteId)");
    expect(clientActionRoute).toContain("resolveClientJobSiteActor(jobSiteId)");
    expect(clientTimelineRoute).toContain("resolveClientJobSiteActor((await params).jobSiteId)");
  });

  it("never returns INTERNAL timeline events to a client and forces client publications to SHARED", () => {
    expect(collaboration).toContain('input.actor.side === "CLIENT" ? { audience: "SHARED" as const } : {}');
    expect(collaboration).toContain('input.actor.side === "CLIENT" && body.audience !== "SHARED"');
    expect(collaboration).toContain("actorUserId: input.actor.userId");
    expect(collaboration).toContain("actorParticipantId: input.actor.participantId");
  });

  it("prevents replay from duplicating participants, invitations or consents", () => {
    expect(idempotency).toContain("organizationId_action_idempotencyKey");
    expect(idempotency).toContain("IDEMPOTENCY_FINGERPRINT_MISMATCH");
    expect(schema).toContain("@@unique([organizationId, action, idempotencyKey])");
    expect(schema).toMatch(/userSideKey\s+String\s+@unique/);
    expect(schema).toMatch(/primaryClientKey\s+String\?\s+@unique/);
    expect(schema).toContain("@@unique([versionId, participantId])");
  });
});

describe("first vertical slice - creator lifecycle", () => {
  it("creates the responsible organization participant already ACTIVE", () => {
    const create = between(jobSiteService, "export async function createJobSite", "export async function getOrganizationJobSiteDetail");
    const participant = between(create, "const participant = await tx.jobSiteParticipant.create", "select: { id: true, accessVersion: true }");
    expect(participant).toContain('status: "ACTIVE"');
    expect(participant).toContain("activatedAt: new Date()");
  });

});

describe("first vertical slice - client lifecycle", () => {
  it("keeps the accepted client participant PENDING until agreement confirmation", () => {
    const accept = between(jobSiteService, "export async function acceptPrimaryClientInvitation", "export async function invitePrimaryClientIdempotent");
    const participant = between(accept, "const participant = await tx.jobSiteParticipant.create", "await tx.jobSiteClientInvitation.updateMany");
    expect(participant).toContain('status: "PENDING"');
    expect(participant).toContain("activeKey: null");
    expect(participant).toContain("activatedAt: null");
  });
});
