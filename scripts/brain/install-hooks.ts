import { execSync } from "node:child_process";

function main(): void {
  execSync("git config core.hooksPath .githooks", { stdio: "inherit" });
  console.log("Configured git hooks path to .githooks");
}

main();
