import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, passwordResetTokens } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const passwordRouter = createRouter({
  // Step 1: Request password reset - generates a token
  forgotPassword: publicQuery
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) {
        // Don't reveal if email exists or not
        return {
          success: true,
          message: "If that email is registered, a reset token has been generated.",
        };
      }

      // Generate a simple reset token (in production, use crypto.randomBytes)
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Invalidate old tokens for this user
      await db.update(passwordResetTokens)
        .set({ used: true })
        .where(and(
          eq(passwordResetTokens.userId, user.id),
          eq(passwordResetTokens.used, false)
        ));

      // Save new token
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      // In a real app, send email here.
      // For now, we return the token in the response (dev mode only)
      return {
        success: true,
        message: "If that email is registered, a reset token has been generated.",
        // Dev-only: return token so user can reset without email
        ...(process.env.NODE_ENV !== "production" ? { devToken: token } : {}),
      };
    }),

  // Step 2: Verify token and reset password
  resetPassword: publicQuery
    .input(
      z.object({
        token: z.string().min(1),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Find valid token
      const resetToken = await db.query.passwordResetTokens.findFirst({
        where: and(
          eq(passwordResetTokens.token, input.token),
          eq(passwordResetTokens.used, false)
        ),
      });

      if (!resetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired reset token.",
        });
      }

      // Check if expired
      if (new Date() > new Date(resetToken.expiresAt)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired. Please request a new one.",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      // Update user password
      await db.update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, resetToken.userId));

      // Mark token as used
      await db.update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, resetToken.id));

      return {
        success: true,
        message: "Password has been reset successfully. You can now login with your new password.",
      };
    }),

  // Step 3: Verify if token is valid (for checking before showing reset form)
  verifyToken: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();

      const resetToken = await db.query.passwordResetTokens.findFirst({
        where: and(
          eq(passwordResetTokens.token, input.token),
          eq(passwordResetTokens.used, false)
        ),
      });

      if (!resetToken) {
        return { valid: false };
      }

      if (new Date() > new Date(resetToken.expiresAt)) {
        return { valid: false, expired: true };
      }

      return { valid: true };
    }),
});