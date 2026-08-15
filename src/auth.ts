import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { writeAdminAudit } from "@/lib/admin/audit";
import { allowDatabaseLoginAttempt, getLoginRateLimiter } from "@/lib/admin/rate-limit";

const credentialsSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const parsed = credentialsSchema.safeParse(credentials);
        const adminUsername =
          process.env.ADMIN_USERNAME?.trim().toLowerCase() ??
          process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const passwordHash = process.env.ADMIN_PASSWORD_HASH;
        const ip =
          request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request?.headers.get("x-real-ip") ||
          "unknown";

        const limiter = getLoginRateLimiter();
        const allowed = limiter
          ? (await limiter.limit(ip)).success
          : await allowDatabaseLoginAttempt(ip);
        if (!allowed) {
          await writeAdminAudit({
            actorEmail: parsed.success ? parsed.data.username.toLowerCase() : "unknown",
            action: "login_rate_limited",
            ipAddress: ip,
          });
          return null;
        }

        if (!parsed.success || !adminUsername || !passwordHash) {
          await writeAdminAudit({
            actorEmail: parsed.success ? parsed.data.username.toLowerCase() : "unknown",
            action: "login_failed",
            ipAddress: ip,
            meta: "missing_config_or_invalid_payload",
          });
          return null;
        }

        const username = parsed.data.username.toLowerCase();
        const usernameOk = username === adminUsername;
        const passwordOk = await bcrypt.compare(parsed.data.password, passwordHash);
        if (!usernameOk || !passwordOk) {
          await writeAdminAudit({
            actorEmail: username,
            action: "login_failed",
            ipAddress: ip,
          });
          return null;
        }

        await writeAdminAudit({
          actorEmail: username,
          action: "login_success",
          ipAddress: ip,
        });

        return { id: username, email: username, name: "Silk Room Admin" };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 30,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.email = typeof token.email === "string" ? token.email : "";
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
});
