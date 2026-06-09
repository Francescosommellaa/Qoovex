const LEGACY_SSL_MODE_PATTERN =
  /([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/gi;

export function normalizeDatabaseConnectionString(connectionString: string) {
  return connectionString.replace(
    LEGACY_SSL_MODE_PATTERN,
    "$1verify-full",
  );
}
