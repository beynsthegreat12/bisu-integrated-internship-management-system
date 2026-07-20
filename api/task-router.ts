import { z } from "zod";
import { createRouter, authedQuery, supervisorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tasks } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const taskRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        studentId: z.number().optional(),
        supervisorId: z.number().optional(),
        assignmentId: z.number().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [];

      if (ctx.user.role === "student") {
        conditions.push(eq(tasks.studentId, ctx.user.id));
      } else if (ctx.user.role === "supervisor") {
        conditions.push(eq(tasks.supervisorId, ctx.user.id));
      } else if (input?.studentId) {
        conditions.push(eq(tasks.studentId, input.studentId));
      } else if (input?.supervisorId) {
        conditions.push(eq(tasks.supervisorId, input.supervisorId));
      }

      if (input?.assignmentId) {
        conditions.push(eq(tasks.assignmentId, input.assignmentId));
      }
      if (input?.status) {
        conditions.push(eq(tasks.status, input.status as any));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      return db.query.tasks.findMany({
        where,
        with: {
          student: true,
          supervisor: true,
        },
        orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
      });
    }),

  create: supervisorQuery
    .input(
      z.object({
        studentId: z.number(),
        assignmentId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(tasks).values({
        studentId: input.studentId,
        supervisorId: ctx.user.id,
        assignmentId: input.assignmentId,
        title: input.title,
        description: input.description || null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        status: "pending",
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        status: z.enum(["pending", "in_progress", "completed", "overdue"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
      await db.update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id));
      return { success: true };
    }),

  delete: supervisorQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),
});
