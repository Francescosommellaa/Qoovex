import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { getAuthSecret, getAuthUrl } from "@shared/server/auth/auth-env";

function getGoogleProvider() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  return Google({
    clientId,
    clientSecret,
    allowDangerousEmailAccountLinking: false,
  });
}

/**
 * Config condivisa e compatibile con `src/proxy.ts`.
 * Adapter, Resend e Prisma vivono solo in `config.ts`.
 */
export const authConfig = {
  secret: getAuthSecret(),
  providers: [getGoogleProvider()].filter((provider) => provider !== null),
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in/verify",
    error: "/sign-in",
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const authEnv = {
  secret: getAuthSecret(),
  url: getAuthUrl(),
};
