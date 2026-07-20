import { z } from "zod";
import { createRouter, authedQuery, coordinatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { internAssignments } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const assignmentRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        studentId: z.number().optional(),
        coordinatorId: z.number().optional(),
        collegeId: z.number().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [];

      if (ctx.user.role === "student") {
        conditions.push(eq(internAssignments.studentId, ctx.user.id));
      } else if (input?.studentId) {
        conditions.push(eq(internAssignments.studentId, input.studentId));
      }
      if (input?.coordinatorId) {
        conditions.push(eq(internAssignments.coordinatorId, input.coordinatorId));
      }
      if (input?.collegeId) {
        conditions.push(eq(internAssignments.collegeId, input.collegeId));
      }
      if (input?.status) {
        conditions.push(eq(internAssignments.status, input.status as any));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      return db.query.internAssignments.findMany({
        where,
        with: {
          student: true,
          hte: true,
          coordinator: true,
          college: true,
        },
        orderBy: (assignments, { desc }) => [desc(assignments.createdAt)],
      });
    }),

  create: coordinatorQuery
    .input(
      z.object({
        studentId: z.number(),
        hteId: z.number(),
        coordinatorId: z.number(),
        collegeId: z.number(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(internAssignments).values({
        studentId: input.studentId,
        hteId: input.hteId,
        coordinatorId: input.coordinatorId,
        collegeId: input.collegeId,
        location: input.location || null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: "active",
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: coordinatorQuery
    .input(
      z.object({
        id: z.number(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.enum(["active", "completed", "cancelled", "pull_out"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.startDate) updateData.startDate = new Date(data.startDate);
      if (data.endDate) updateData.endDate = new Date(data.endDate);
      await db.update(internAssignments)
        .set(updateData)
        .where(eq(internAssignments.id, id));
      return { success: true };
    }),
  pullOutStudent: coordinatorQuery
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(internAssignments)
        .set({ status: "pull_out" })
        .where(eq(internAssignments.id, input.id));
      // Log reason in the location field temporarily
      if (input.reason) {
        const existing = await db.query.internAssignments.findFirst({
          where: eq(internAssignments.id, input.id),
        });
        if (existing) {
          await db.update(internAssignments)
            .set({ location: `PULL_OUT_REASON: ${input.reason} (${new Date().toLocaleDateString()})` })
            .where(eq(internAssignments.id, input.id));
        }
      }
      return { success: true };
    }),

  pullOutList: coordinatorQuery.query(async () => {
      const db = getDb();
      return db.query.internAssignments.findMany({
        where: eq(internAssignments.status, "pull_out"),
        with: {
          student: true,
          hte: true,
          coordinator: true,
          college: true,
        },
        orderBy: (assignments, { desc }) => [desc(assignments.createdAt)],
      });
    }),

  pullOutCount: coordinatorQuery.query(async () => {
      const db = getDb();
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(internAssignments)
        .where(eq(internAssignments.status, "pull_out"));
      return { count: Number(result[0]?.count || 0) };
    }),
});
