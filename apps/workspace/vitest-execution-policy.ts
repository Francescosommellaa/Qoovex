export function shouldSerializeWorkspaceTestFiles(environment: Readonly<Record<string, string | undefined>>) {
  return environment.CI === "true"
    || environment.QOOVEX_E2E_MODE === "1"
    || environment.QOOVEX_POSTGRES_INTEGRATION_PHASE === "run";
}
