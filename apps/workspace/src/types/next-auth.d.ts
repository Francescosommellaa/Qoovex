import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      platformRole: "USER" | "SUPER_ADMIN";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    passwordUpdatedAt?: string | null;
    authVersion?: number;
    platformRole?: "USER" | "SUPER_ADMIN";
  }
}
