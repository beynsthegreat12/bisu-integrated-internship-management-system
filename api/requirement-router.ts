import { z } from "zod";
import { createRouter, authedQuery, studentQuery, coordinatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { requirements, requirementTypes } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const requirementRouter = createRouter({
  // List all requirement types
  listTypes: authedQuery.query(async () => {
    const db = getDb();
    return db.query.requirementTypes.findMany();
  }),

  // List student's submitted requirements
  list: authedQuery
    .input(
      z.object({
        studentId: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const studentId = input?.studentId || ctx.user.id;

      const reqs = await db.query.requirements.findMany({
        where: eq(requirements.studentId, studentId),
        with: {
          type: true,
        },
        orderBy: (reqs, { desc }) => [desc(reqs.createdAt)],
      });

      return reqs;
    }),

  // Get all students with their requirements status (for coordinator view)
  coordinatorList: coordinatorQuery.query(async () => {
    const db = getDb();
    const { users } = await import("@db/schema");

    const allStudents = await db.query.users.findMany({
      where: eq(users.role, "student"),
      columns: { id: true, name: true, email: true },
    });

    const enriched = await Promise.all(allStudents.map(async (s) => {
      const reqs = await db.query.requirements.findMany({
        where: eq(requirements.studentId, s.id),
        with: { type: true },
      });

      const total = reqs.length;
      const approved = reqs.filter(r => r.status === "approved").length;
      const pending = reqs.filter(r => r.status === "pending").length;
      const rejected = reqs.filter(r => r.status === "rejected").length;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        totalRequirements: total,
        approved,
        pending,
        rejected,
        requirements: reqs,
      };
    }));

    return enriched;
  }),

  // Submit a requirement (student)
  submit: studentQuery
    .input(
      z.object({
        typeId: z.number(),
        filePath: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Check if already submitted
      const existing = await db.query.requirements.findFirst({
        where: and(
          eq(requirements.studentId, ctx.user.id),
          eq(requirements.typeId, input.typeId)
        ),
      });

      if (existing) {
        // Update existing
        await db.update(requirements)
          .set({
            filePath: input.filePath || existing.filePath,
            status: "pending",
          })
          .where(eq(requirements.id, existing.id));
        return { success: true, id: existing.id, action: "updated" };
      }

      const result = await db.insert(requirements).values({
        studentId: ctx.user.id,
        assignmentId: 1,
        typeId: input.typeId,
        filePath: input.filePath || null,
        status: "pending",
      });

      return { success: true, id: Number(result[0].insertId), action: "created" };
    }),

  // Review a requirement (coordinator)
  review: coordinatorQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(requirements)
        .set({ status: input.status })
        .where(eq(requirements.id, input.id));
      return { success: true };
    }),

  // Delete a requirement
  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(requirements).where(eq(requirements.id, input.id));
      return { success: true };
    }),
});