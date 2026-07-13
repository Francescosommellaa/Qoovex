import "server-only";

import { getAuthUrl } from "./auth/auth-env";

const PRODUCTION_WORKSPACE_URL = "https://app.qoovex.com";
const DEVELOPMENT_WORKSPACE_URL = "http://localhost:3001";

export function buildAbsoluteWorkspaceUrl(path: string, configuredBaseUrl = getAuthUrl()) {
  const fallback = process.env.NODE_ENV === "production" ? PRODUCTION_WORKSPACE_URL : DEVELOPMENT_WORKSPACE_URL;
  let baseUrl: URL;

  try {
    baseUrl = new URL(configuredBaseUrl ?? fallback);
  } catch {
    throw new Error("AUTH_URL deve essere un URL assoluto valido.");
  }

  if (baseUrl.protocol !== "http:" && baseUrl.protocol !== "https:") {
    throw new Error("AUTH_URL deve usare il protocollo http o https.");
  }

  return new URL(path, `${baseUrl.origin}/`).toString();
}
