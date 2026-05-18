import "server-only";

import { cache } from "react";
import { bootstrapUser } from "@shared/actions/bootstrap-user";

export const getCurrentWorkspaceUser = cache(async () => {
  return await bootstrapUser();
});
