import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { writeAdminAudit } from "@/lib/admin/audit";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const parsed = credentialsSchema.safeParse(credentials);
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const passwordHash = process.env.ADMIN_PASSWORD_HASH;
        const ip =
          request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request?.headers.get("x-real-ip") ||
          "unknown";

        if (!parsed.success || !adminEmail || !passwordHash) {
          await writeAdminAudit({
            actorEmail: parsed.success ? parsed.data.email.toLowerCase() : "unknown",
            action: "login_failed",
            ipAddress: ip,
            meta: "missing_config_or_invalid_payload",
          });
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const emailOk = email === adminEmail;
        const passwordOk = await bcrypt.compare(parsed.data.password, passwordHash);
        if (!emailOk || !passwordOk) {
          await writeAdminAudit({
            actorEmail: email,
            action: "login_failed",
            ipAddress: ip,
          });
          return null;
        }

        await writeAdminAudit({
          actorEmail: email,
          action: "login_success",
          ipAddress: ip,
        });

        return { id: "admin", email, name: "Silk Room Admin" };
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
