import type { DefaultSession } from "next-auth";
import type { PlatformRole } from "@qoovex/types";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      platformRole: PlatformRole;
      authSessionId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    passwordUpdatedAt?: string | null;
    authVersion?: number;
    platformRole?: PlatformRole;
    authSessionId?: string;
  }
}
