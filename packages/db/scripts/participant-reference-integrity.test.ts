import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
const migration = readFileSync(resolve(process.cwd(), "prisma/migrations/20260816010000_job_site_participant_opener_foreign_keys/migration.sql"), "utf8");

for (const [model, relation, inverse] of [
  ["JobSiteRequest", "JobSiteRequestOpener", "openedRequests"],
  ["JobSiteDispute", "JobSiteDisputeOpener", "openedDisputes"],
  ["JobSitePostClosureRequest", "JobSitePostClosureRequestOpener", "openedPostClosureRequests"],
] as const) {
  test(`${model} opener is a required Restrict participant relation`, () => {
    assert.match(schema, new RegExp(`model ${model} \\{[\\s\\S]*?openedByParticipantId\\s+String[\\s\\S]*?openedByParticipant\\s+JobSiteParticipant\\s+@relation\\("${relation}", fields: \\[openedByParticipantId\\], references: \\[id\\], onDelete: Restrict\\)`));
    assert.match(schema, new RegExp(`${inverse}\\s+${model}\\[\\]\\s+@relation\\("${relation}"\\)`));
    assert.match(migration, new RegExp(`ALTER TABLE "${model}" ADD CONSTRAINT "${model}_openedByParticipantId_fkey" FOREIGN KEY \\("openedByParticipantId"\\) REFERENCES "JobSiteParticipant"\\("id"\\) ON DELETE RESTRICT ON UPDATE CASCADE;`));
  });
}
