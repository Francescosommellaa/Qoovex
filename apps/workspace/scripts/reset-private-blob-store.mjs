import { del, list } from "@vercel/blob";

const RESET_ATTESTATION = "RESET_QOOVEX_JOB_SITE_EMPTY_BLOB_STORE_2026_08_03";
const environment = process.env.VERCEL_ENV?.trim();
const databaseEnvironment = process.env.QOOVEX_DATABASE_ENVIRONMENT?.trim();

if (environment !== "preview" && environment !== "production") {
  throw new Error("current Blob reset is allowed only in Preview or Production.");
}
if (databaseEnvironment !== environment) {
  throw new Error("Blob reset refused: database and Vercel environment markers differ.");
}
if (process.env.QOOVEX_JOB_SITE_BLOB_RESET_APPROVED !== RESET_ATTESTATION) {
  throw new Error("Exact current Blob reset attestation is required.");
}
if (!process.env.BLOB_READ_WRITE_TOKEN?.trim() || !process.env.BLOB_STORE_ID?.trim()) {
  throw new Error("Blob target identity is incomplete.");
}

const pathnames = [];
let cursor;
do {
  const page = await list({ cursor, limit: 500 });
  pathnames.push(...page.blobs.map(({ pathname }) => pathname));
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);

for (let index = 0; index < pathnames.length; index += 100) {
  await del(pathnames.slice(index, index + 100));
}

console.log(`current Blob reset completed: ${pathnames.length} object(s) removed.`);
