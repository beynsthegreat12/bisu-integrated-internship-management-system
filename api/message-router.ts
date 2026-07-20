import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages } from "@db/schema";
import { eq, and, or, desc } from "drizzle-orm";

export const messageRouter = createRouter({
  listConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    
    // Get all messages where user is sender or receiver
    const allMessages = await db.query.messages.findMany({
      where: or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      ),
      orderBy: [desc(messages.createdAt)],
    });

    // Group by conversation partner
    const conversations = new Map();
    for (const msg of allMessages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partnerId,
          lastMessage: msg,
          unreadCount: msg.receiverId === userId && !msg.isRead ? 1 : 0,
        });
      } else if (msg.receiverId === userId && !msg.isRead) {
        const conv = conversations.get(partnerId);
        conv.unreadCount++;
      }
    }

    return Array.from(conversations.values());
  }),

  getThread: authedQuery
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const msgs = await db.query.messages.findMany({
        where: or(
          and(
            eq(messages.senderId, ctx.user.id),
            eq(messages.receiverId, input.partnerId)
          ),
          and(
            eq(messages.senderId, input.partnerId),
            eq(messages.receiverId, ctx.user.id)
          )
        ),
        orderBy: [messages.createdAt],
      });
      return msgs;
    }),

  send: authedQuery
    .input(
      z.object({
        receiverId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(messages).values({
        senderId: ctx.user.id,
        receiverId: input.receiverId,
        content: input.content,
        isRead: false,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  markRead: authedQuery
    .input(z.object({ senderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(messages)
        .set({ isRead: true })
        .where(
          and(
            eq(messages.senderId, input.senderId),
            eq(messages.receiverId, ctx.user.id),
            eq(messages.isRead, false)
          )
        );
      return { success: true };
    }),

  getUnreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const unread = await db.query.messages.findMany({
      where: and(
        eq(messages.receiverId, ctx.user.id),
        eq(messages.isRead, false)
      ),
    });
    return unread.length;
  }),
});
