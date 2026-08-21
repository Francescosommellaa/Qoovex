const E2E_ATTESTATION = "I_ACKNOWLEDGE_FIXTURE_SCOPED_CLEANUP";

export function isAuthenticatedFixtureEnvironment(env: NodeJS.ProcessEnv = process.env) {
  if (env.QOOVEX_E2E_MODE !== "1") return false;
  if (env.QOOVEX_E2E_RUN_ATTESTATION !== E2E_ATTESTATION) return false;
  if (env.NODE_ENV === "production" || env.VERCEL === "1") return false;
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "production") return false;
  if (!new Set(["local", "test"]).has(env.QOOVEX_DATABASE_ENVIRONMENT ?? "")) return false;

  const databaseUrl = env.DATABASE_URL?.trim();
  if (!databaseUrl || env.QOOVEX_E2E_DATABASE_TARGET !== databaseUrl) return false;
  try {
    const parsed = new URL(databaseUrl);
    const databaseName = parsed.pathname.replace(/^\//, "");
    return new Set(["localhost", "127.0.0.1", "::1"]).has(parsed.hostname)
      && (databaseName === "qoovex_ci" || databaseName.endsWith("_ci"));
  } catch {
    return false;
  }
}
