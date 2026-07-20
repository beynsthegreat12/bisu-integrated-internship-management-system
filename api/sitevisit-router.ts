import { z } from "zod";
import { createRouter, authedQuery, coordinatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { siteVisits } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const siteVisitRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        coordinatorId: z.number().optional(),
        studentId: z.number().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [];

      if (ctx.user.role === "coordinator") {
        conditions.push(eq(siteVisits.coordinatorId, ctx.user.id));
      } else if (input?.coordinatorId) {
        conditions.push(eq(siteVisits.coordinatorId, input.coordinatorId));
      }
      if (input?.studentId) {
        conditions.push(eq(siteVisits.studentId, input.studentId));
      }
      if (input?.status) {
        conditions.push(eq(siteVisits.status, input.status as any));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      return db.query.siteVisits.findMany({
        where,
        with: {
          coordinator: true,
          student: true,
          hte: true,
        },
        orderBy: (visits, { desc }) => [desc(visits.visitDate)],
      });
    }),

  create: coordinatorQuery
    .input(
      z.object({
        studentId: z.number(),
        hteId: z.number(),
        visitDate: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(siteVisits).values({
        coordinatorId: ctx.user.id,
        studentId: input.studentId,
        hteId: input.hteId,
        visitDate: new Date(input.visitDate),
        notes: input.notes || null,
        status: "scheduled",
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: coordinatorQuery
    .input(
      z.object({
        id: z.number(),
        visitDate: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.visitDate) updateData.visitDate = new Date(data.visitDate);
      await db.update(siteVisits)
        .set(updateData)
        .where(eq(siteVisits.id, id));
      return { success: true };
    }),
});
