const DATABASE_ENV_NAMES = [
  "DATABASE_URL",
  "DATABASE_PRISMA_DATABASE_URL",
  "DATABASE_POSTGRES_URL",
] as const;

const REMOTE_DATABASE_ATTESTATION = "I_ACKNOWLEDGE_REMOTE_DATABASE";

function getConfiguredConnectionString(env: NodeJS.ProcessEnv) {
  for (const name of DATABASE_ENV_NAMES) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  throw new Error(`[qoovex/db] Database connection env missing. Set one of: ${DATABASE_ENV_NAMES.join(", ")}.`);
}

export function isLoopbackDatabaseConnection(connectionString: string) {
  let hostname: string;
  try {
    hostname = new URL(connectionString).hostname.toLowerCase();
  } catch {
    throw new Error("[qoovex/db] Database connection string is invalid.");
  }
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
}

export function isLocalPrismaDevTarget(
  connectionString: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  return env.QOOVEX_DATABASE_ENVIRONMENT?.trim() === "local"
    && isLoopbackDatabaseConnection(connectionString);
}

export function assertVercelDatabaseEnvironmentMarker(env: NodeJS.ProcessEnv = process.env) {
  const vercelEnvironment = env.VERCEL_ENV?.trim();
  const declaredEnvironment = env.QOOVEX_DATABASE_ENVIRONMENT?.trim();
  if ((vercelEnvironment !== "preview" && vercelEnvironment !== "production") || !declaredEnvironment) return;
  if (declaredEnvironment !== vercelEnvironment) {
    throw new Error("[qoovex/db] Database environment marker does not match VERCEL_ENV.");
  }
}

export function assertDatabaseTargetForCommand(command: string, env: NodeJS.ProcessEnv = process.env) {
  const connectionString = getConfiguredConnectionString(env);
  const vercelEnvironment = env.VERCEL_ENV?.trim();
  const declaredEnvironment = env.QOOVEX_DATABASE_ENVIRONMENT?.trim();

  if (vercelEnvironment === "preview" || vercelEnvironment === "production") {
    if (declaredEnvironment !== vercelEnvironment) {
      throw new Error(`[qoovex/db] ${command} refused: QOOVEX_DATABASE_ENVIRONMENT must match VERCEL_ENV.`);
    }
    return;
  }

  if (isLoopbackDatabaseConnection(connectionString)) return;
  if (
    env.QOOVEX_ALLOW_REMOTE_DATABASE === "1" &&
    env.QOOVEX_REMOTE_DATABASE_ATTESTATION === REMOTE_DATABASE_ATTESTATION
  ) return;

  throw new Error(
    `[qoovex/db] ${command} refused: local commands require a loopback database. Remote maintenance needs explicit allow and attestation variables.`,
  );
}
