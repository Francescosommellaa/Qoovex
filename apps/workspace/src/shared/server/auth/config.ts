import "server-only";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@qoovex/db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@shared/server/auth/auth.config";
import { authorizeCredentials } from "@shared/server/auth-credentials-service";
import {
  createUserForAuthAdapter,
  ensureWorkspaceUserProfile,
} from "@shared/server/workspace-user-sync";
import { getRequestIpHash, recordSecurityEvent } from "@shared/server/security-audit-service";

const prismaAdapter = PrismaAdapter(db);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: {
    ...prismaAdapter,
    createUser: (user) => createUserForAuthAdapter(user),
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        identifier: {},
        password: {},
      },
      async authorize(credentials, request) {
        const identifier =
          typeof credentials?.identifier === "string"
            ? credentials.identifier
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!identifier || !password) return null;
        return await authorizeCredentials({
          identifier,
          password,
          ipHash: getRequestIpHash(request.headers),
        });
      },
    }),
  ].filter((provider) => provider !== null),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        const [credential, identity] = await Promise.all([
          db.userCredential.findUnique({ where: { userId: user.id }, select: { passwordUpdatedAt: true } }),
          db.user.findUnique({ where: { id: user.id }, select: { authVersion: true, platformRole: true } }),
        ]);
        token.passwordUpdatedAt = credential?.passwordUpdatedAt.toISOString() ?? null;
        token.authVersion = identity?.authVersion ?? 1;
        token.platformRole = identity?.platformRole ?? "USER";
      } else if (token.sub) {
        const [credential, identity] = await Promise.all([
          db.userCredential.findUnique({ where: { userId: token.sub }, select: { passwordUpdatedAt: true } }),
          db.user.findUnique({ where: { id: token.sub }, select: { authVersion: true, platformRole: true } }),
        ]);
        const currentPasswordUpdatedAt =
          credential?.passwordUpdatedAt.toISOString() ?? null;
        if (
          !identity ||
          (token.passwordUpdatedAt && currentPasswordUpdatedAt !== token.passwordUpdatedAt) ||
          identity.authVersion !== token.authVersion
        ) {
          token.sub = undefined;
        } else {
          token.platformRole = identity.platformRole;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.platformRole = token.platformRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : "USER";
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.id) return false;
      if (account?.provider === "google") {
        const googleProfile = profile as { email_verified?: boolean } | undefined;
        if (googleProfile?.email_verified === false) {
          await recordSecurityEvent({
            userId: user.id,
            email: user.email,
            type: "google_signin_email_unverified",
          });
          return false;
        }
      }

      await ensureWorkspaceUserProfile(user.id);
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await ensureWorkspaceUserProfile(user.id);
    },
  },
});
