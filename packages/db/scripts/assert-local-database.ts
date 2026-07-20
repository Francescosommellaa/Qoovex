import "dotenv/config";
import { assertDatabaseTargetForCommand } from "../src/database-target-guard";

assertDatabaseTargetForCommand(process.argv[2] ?? "local database command");
