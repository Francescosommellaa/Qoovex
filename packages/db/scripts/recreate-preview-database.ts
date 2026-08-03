import { assertDatabaseTargetForCommand } from "../src/database-target-guard";
import { runPrisma } from "./prisma-cli";

if (process.env.QOOVEX_PREVIEW_RECREATE_APPROVED !== "RECREATE_ISOLATED_PREVIEW") {
  throw new Error("Exact Preview recreation approval is required.");
}
if (process.env.VERCEL_ENV !== "preview" || process.env.QOOVEX_DATABASE_ENVIRONMENT !== "preview") {
  throw new Error("Preview recreation requires matching VERCEL_ENV and QOOVEX_DATABASE_ENVIRONMENT markers.");
}

assertDatabaseTargetForCommand("Preview database recreation");
runPrisma(["migrate", "reset", "--force"]);
runPrisma(["generate"]);
console.log("Isolated Preview database recreated from the active migration chain.");
