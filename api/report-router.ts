import { z } from "zod";
import { createRouter, authedQuery, studentQuery, coordinatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { accomReports, users, colleges, internAssignments, htes } from "@db/schema";
import { eq, and, sql, like, inArray } from "drizzle-orm";

export const reportRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        studentId: z.number().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [];

      if (ctx.user.role === "student") {
        conditions.push(eq(accomReports.studentId, ctx.user.id));
      } else if (input?.studentId) {
        conditions.push(eq(accomReports.studentId, input.studentId));
      }

      if (input?.status) {
        conditions.push(eq(accomReports.status, input.status as any));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      return db.query.accomReports.findMany({
        where,
        with: {
          student: true,
          reviewer: true,
        },
        orderBy: (reports, { desc }) => [desc(reports.createdAt)],
      });
    }),

  coordinatorList: coordinatorQuery
    .input(
      z.object({
        studentId: z.number().optional(),
        status: z.string().optional(),
        month: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();

      let studentIds: number[] | undefined;

      // If search term provided, find matching students
      if (input?.search) {
        const matchingUsers = await db.select({ id: users.id })
          .from(users)
          .where(and(
            eq(users.role, "student"),
            sql`LOWER(${users.name}) LIKE ${`%${input.search.toLowerCase()}%`}`
          ));
        studentIds = matchingUsers.map(u => u.id);
        if (studentIds.length === 0) return [];
      }

      // Build conditions from the acoomReports side
      const conditions = [];

      if (input?.studentId) {
        conditions.push(eq(accomReports.studentId, input.studentId));
      } else if (studentIds) {
        conditions.push(inArray(accomReports.studentId, studentIds));
      }

      if (input?.status) {
        conditions.push(eq(accomReports.status, input.status as any));
      }

      // Month filter
      if (input?.month) {
        conditions.push(sql`DATE_FORMAT(${accomReports.date}, '%Y-%m') = ${input.month}`);
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const reports = await db.query.accomReports.findMany({
        where,
        with: {
          student: true,
          reviewer: true,
        },
        orderBy: (reports, { desc }) => [desc(reports.createdAt)],
      });

      // Enrich with assignment/HTE info
      const enriched = await Promise.all(reports.map(async (r) => {
        let hteName = null;
        if (r.student?.id) {
          const assignment = await db.query.internAssignments.findFirst({
            where: and(
              eq(internAssignments.studentId, r.student.id),
              sql`${internAssignments.status} = 'active'`
            ),
            with: { hte: true },
          });
          hteName = assignment?.hte?.name || null;
        }
        return { ...r, hteName };
      }));

      return enriched;
    }),

  getCoordinatorStats: coordinatorQuery.query(async ({ ctx }) => {
      const db = getDb();

      // Get all students
      const allStudents = await db.select({ id: users.id, name: users.name, collegeId: users.collegeId })
        .from(users)
        .where(eq(users.role, "student"));

      const allStudentIds = allStudents.map(s => s.id);

      // Get active internships with HTE info
      const assignments = await db.query.internAssignments.findMany({
        where: eq(internAssignments.status, "active"),
        with: { hte: true, student: true },
      });

      // Get all reports for these students
      const allReports = allStudentIds.length > 0
        ? await db.query.accomReports.findMany({
            where: inArray(accomReports.studentId, allStudentIds),
          })
        : [];

      const total = allReports.length;
      const pending = allReports.filter(r => r.status === "pending").length;
      const approved = allReports.filter(r => r.status === "approved").length;
      const rejected = allReports.filter(r => r.status === "rejected").length;
      const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
      const totalStudents = allStudentIds.length;
      const activeAssignments = assignments.length;

      return { total, pending, approved, rejected, approvalRate, totalStudents, activeAssignments };
    }),

  getStudents: coordinatorQuery.query(async () => {
      const db = getDb();
      const students = await db.query.users.findMany({
        where: eq(users.role, "student"),
        columns: { id: true, name: true, email: true },
      });

      // Get their college info via assignments
      const enriched = await Promise.all(students.map(async (s) => {
        const assignment = await db.query.internAssignments.findFirst({
          where: and(
            eq(internAssignments.studentId, s.id),
            eq(internAssignments.status, "active")
          ),
          with: { hte: true, college: true },
        });
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          college: assignment?.college?.name || null,
          company: assignment?.hte?.name || null,
          assignmentId: assignment?.id || null,
        };
      }));

      return enriched;
    }),

  getStudentInfo: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      const user = await db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
        with: { college: true },
      });
      const assignment = await db.query.internAssignments.findFirst({
        where: and(
          eq(internAssignments.studentId, ctx.user.id),
          eq(internAssignments.status, "active")
        ),
        with: { hte: true },
      });
      return { user, assignment };
    }),

  create: authedQuery
    .input(
      z.object({
        date: z.string(),
        description: z.string().min(1),
        remarks: z.string().optional(),
        filePath: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(accomReports).values({
        studentId: ctx.user.id,
        date: new Date(input.date),
        description: input.description,
        remarks: input.remarks || null,
        filePath: input.filePath || null,
        status: "pending",
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  review: coordinatorQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
        remarks: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(accomReports)
        .set({
          status: input.status,
          reviewerId: ctx.user.id,
          reviewedAt: new Date(),
        })
        .where(eq(accomReports.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(accomReports).where(eq(accomReports.id, input.id));
      return { success: true };
    }),
});
