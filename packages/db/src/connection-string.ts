const NON_CANONICAL_SSL_MODE_PATTERN =
  /([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/gi;

export function normalizeDatabaseConnectionString(connectionString: string) {
  return connectionString.replace(
    NON_CANONICAL_SSL_MODE_PATTERN,
    "$1verify-full",
  );
}
