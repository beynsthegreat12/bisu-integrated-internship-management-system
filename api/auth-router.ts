import * as cookie from "cookie";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { findUserByEmail, upsertUser } from "./queries/users";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
        expires: new Date(0),
      }),
    );
    return { success: true };
  }),
  login: publicQuery
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const input = val as Record<string, unknown>;
      if (typeof input.email !== "string" || typeof input.password !== "string") {
        throw new Error("Email and password are required");
      }
      return { email: input.email.trim(), password: input.password };
    })
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      // Find user by email
      const user = await findUserByEmail(email);
      if (!user || !user.password) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid email or password",
        });
      }

      // Verify password
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid email or password",
        });
      }

      // Sign session token using the user's unionId
      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: env.appId,
      });

      // Set session cookie
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: cookieOpts.httpOnly,
          path: cookieOpts.path,
          sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none",
          secure: cookieOpts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      // Return user without password
      const { password: _, ...safeUser } = user;
      return { user: safeUser };
    }),

  register: publicQuery
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const input = val as Record<string, unknown>;
      if (typeof input.name !== "string" || typeof input.email !== "string" || typeof input.password !== "string") {
        throw new Error("Name, email, and password are required");
      }
      return {
        name: input.name.trim(),
        email: input.email.trim(),
        password: input.password,
        role: (input.role as string) || "student",
      };
    })
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const unionId = `user-${input.email.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}`;

      await upsertUser({
        unionId,
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role as any,
        lastSignInAt: new Date(),
      });

      return { success: true, message: "Account created successfully" };
    }),
});
