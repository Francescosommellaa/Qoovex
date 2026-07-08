import "server-only";

import { requireOrganizationDomainAccess } from "./domain-access-service";

const DATA_CONTROL_ROLES = ["OWNER"] as const;

export async function requireDataControlAccess() {
  return await requireOrganizationDomainAccess("auditLog:read", DATA_CONTROL_ROLES);
}
