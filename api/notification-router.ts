import { z } from "zod";
import { createRouter, authedQuery, coordinatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const notificationRouter = createRouter({
  // List notifications for current user
  list: authedQuery
    .input(
      z.object({
        unreadOnly: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(notifications.userId, ctx.user.id)];

      if (input?.unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
      }

      const result = await db.query.notifications.findMany({
        where: and(...conditions),
        orderBy: [desc(notifications.createdAt)],
        limit: input?.limit || 50,
      });

      return result;
    }),

  // Get unread count
  getUnreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, false)
      ));
    return { count: Number(result[0]?.count || 0) };
  }),

  // Mark as read
  markAsRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.id));
      return { success: true };
    }),

  // Mark all as read
  markAllAsRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, false)
      ));
    return { success: true };
  }),

  // Create notification (for internal use / coordinator)
  create: coordinatorQuery
    .input(
      z.object({
        userId: z.number(),
        title: z.string(),
        message: z.string().optional(),
        type: z.enum(["info", "success", "warning", "error"]).default("info"),
        link: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(notifications).values({
        userId: input.userId,
        title: input.title,
        message: input.message || null,
        type: input.type,
        link: input.link || null,
      });
      return { success: true };
    }),
});