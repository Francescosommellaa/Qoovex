import "server-only";

import { db } from "@qoovex/db";
import { AccessError } from "./access-errors";

async function findActive(model: "worker" | "jobSite", organizationId: string, id: string) {
  if (model === "worker") {
    return db.worker.findFirst({ where: { id, organizationId, archivedAt: null }, select: { id: true } });
  }
  return db.jobSite.findFirst({ where: { id, organizationId, archivedAt: null }, select: { id: true } });
}

export async function assertWorker(organizationId: string, workerId: string | null | undefined) {
  if (!workerId) return null;
  const record = await findActive("worker", organizationId, workerId);
  if (!record) throw new AccessError("Lavoratore non trovato.", 404);
  return workerId;
}

export async function assertJobSite(organizationId: string, jobSiteId: string | null | undefined) {
  if (!jobSiteId) return null;
  const record = await findActive("jobSite", organizationId, jobSiteId);
  if (!record) throw new AccessError("Cantiere non trovato.", 404);
  return jobSiteId;
}
