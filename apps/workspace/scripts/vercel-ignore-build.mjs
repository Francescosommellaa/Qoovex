const environment = process.env.VERCEL_ENV?.trim();

if (environment === "production") {
  console.log("Production build accepted; domain promotion remains a separate release step.");
  process.exitCode = 1;
} else {
  console.log("Automatic non-Production Workspace builds are disabled; use the isolated Preview rehearsal.");
  process.exitCode = 0;
}
