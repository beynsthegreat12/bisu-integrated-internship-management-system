import { z } from "zod";
import { createRouter, authedQuery, studentQuery, coordinatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { attendance, users, internAssignments, htes } from "@db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

export const attendanceRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        studentId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [];

      if (ctx.user.role === "student") {
        conditions.push(eq(attendance.studentId, ctx.user.id));
      } else if (input?.studentId) {
        conditions.push(eq(attendance.studentId, input.studentId));
      }

      if (input?.startDate) {
        conditions.push(sql`${attendance.date} >= ${input.startDate}`);
      }
      if (input?.endDate) {
        conditions.push(sql`${attendance.date} <= ${input.endDate}`);
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      return db.query.attendance.findMany({
        where,
        with: {
          student: true,
        },
        orderBy: (attendance, { desc }) => [desc(attendance.date)],
      });
    }),

  create: authedQuery
    .input(
      z.object({
        assignmentId: z.number().optional(),
        date: z.string(),
        amArrival: z.string().optional(),
        amDeparture: z.string().optional(),
        pmArrival: z.string().optional(),
        pmDeparture: z.string().optional(),
        status: z.enum(["present", "absent", "late", "excused"]).default("present"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Calculate undertime
      let undertimeHours = 0;
      let undertimeMinutes = 0;
      
      if (input.amArrival && input.amDeparture) {
        const amIn = new Date(`2000-01-01T${input.amArrival}`);
        const amOut = new Date(`2000-01-01T${input.amDeparture}`);
        const amDiff = (amOut.getTime() - amIn.getTime()) / 1000 / 60;
        if (amDiff < 240) undertimeMinutes += 240 - amDiff;
      }
      
      if (input.pmArrival && input.pmDeparture) {
        const pmIn = new Date(`2000-01-01T${input.pmArrival}`);
        const pmOut = new Date(`2000-01-01T${input.pmDeparture}`);
        const pmDiff = (pmOut.getTime() - pmIn.getTime()) / 1000 / 60;
        if (pmDiff < 240) undertimeMinutes += 240 - pmDiff;
      }

      undertimeHours = Math.floor(undertimeMinutes / 60);
      undertimeMinutes = undertimeMinutes % 60;

      const result = await db.insert(attendance).values({
        studentId: ctx.user.id,
        assignmentId: input.assignmentId ?? 1,
        date: new Date(input.date),
        amArrival: input.amArrival || null,
        amDeparture: input.amDeparture || null,
        pmArrival: input.pmArrival || null,
        pmDeparture: input.pmDeparture || null,
        undertimeHours,
        undertimeMinutes,
        status: input.status,
        notes: input.notes || null,
      });
      
      return { success: true, id: Number(result[0].insertId) };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(attendance).where(eq(attendance.id, input.id));
      return { success: true };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        amArrival: z.string().optional(),
        amDeparture: z.string().optional(),
        pmArrival: z.string().optional(),
        pmDeparture: z.string().optional(),
        status: z.enum(["present", "absent", "late", "excused"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      
      let undertimeHours = 0;
      let undertimeMinutes = 0;
      
      if (data.amArrival && data.amDeparture) {
        const amIn = new Date(`2000-01-01T${data.amArrival}`);
        const amOut = new Date(`2000-01-01T${data.amDeparture}`);
        const amDiff = (amOut.getTime() - amIn.getTime()) / 1000 / 60;
        if (amDiff < 240) undertimeMinutes += 240 - amDiff;
      }
      
      if (data.pmArrival && data.pmDeparture) {
        const pmIn = new Date(`2000-01-01T${data.pmArrival}`);
        const pmOut = new Date(`2000-01-01T${data.pmDeparture}`);
        const pmDiff = (pmOut.getTime() - pmIn.getTime()) / 1000 / 60;
        if (pmDiff < 240) undertimeMinutes += 240 - pmDiff;
      }

      undertimeHours = Math.floor(undertimeMinutes / 60);
      undertimeMinutes = undertimeMinutes % 60;

      await db.update(attendance)
        .set({
          ...data,
          undertimeHours,
          undertimeMinutes,
        })
        .where(eq(attendance.id, id));
      
      return { success: true };
    }),

  coordinatorList: coordinatorQuery
    .input(
      z.object({
        month: z.string(),
        search: z.string().optional(),
        status: z.string().optional(),
        studentId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const startDate = `${input.month}-01`;
      const [y, m] = input.month.split("-").map(Number);
      const endDate = `${input.month}-${new Date(y, m, 0).getDate()}`;

      // Build conditions
      const conditions = [
        sql`${attendance.date} >= ${startDate}`,
        sql`${attendance.date} <= ${endDate}`,
      ];

      if (input.studentId) {
        conditions.push(eq(attendance.studentId, input.studentId));
      } else if (input.search) {
        const matching = await db.select({ id: users.id })
          .from(users)
          .where(and(
            eq(users.role, "student"),
            sql`LOWER(${users.name}) LIKE ${`%${input.search.toLowerCase()}%`}`
          ));
        const ids = matching.map(u => u.id);
        if (ids.length === 0) return [];
        conditions.push(inArray(attendance.studentId, ids));
      }

      if (input.status && input.status !== "all") {
        conditions.push(eq(attendance.status, input.status as any));
      }

      const records = await db.query.attendance.findMany({
        where: and(...conditions),
        with: { student: true },
        orderBy: [attendance.studentId, attendance.date],
      });

      // Enrich with HTE info
      const enriched = await Promise.all(records.map(async (r) => {
        let hteName = null;
        if (r.student?.id) {
          const a = await db.query.internAssignments.findFirst({
            where: and(eq(internAssignments.studentId, r.student.id), eq(internAssignments.status, "active") as any),
            with: { hte: true },
          });
          hteName = a?.hte?.name || null;
        }
        return { ...r, hteName };
      }));

      return enriched;
    }),

  getCoordinatorStats: coordinatorQuery
    .input(z.object({ month: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const startDate = `${input.month}-01`;
      const [y, m] = input.month.split("-").map(Number);
      const endDate = `${input.month}-${new Date(y, m, 0).getDate()}`;

      const students = await db.select({ id: users.id }).from(users).where(eq(users.role, "student"));
      const studentIds = students.map(s => s.id);

      const records = studentIds.length > 0
        ? await db.query.attendance.findMany({
            where: and(
              inArray(attendance.studentId, studentIds),
              sql`${attendance.date} >= ${startDate}`,
              sql`${attendance.date} <= ${endDate}`
            ),
          })
        : [];

      const studentRecords = new Map<number, typeof records>();
      for (const r of records) {
        const existing = studentRecords.get(r.studentId) || [];
        existing.push(r);
        studentRecords.set(r.studentId, existing);
      }

      const totalLateMinutes = records.reduce((sum, r) => {
        if (r.amArrival) {
          const [h, min] = r.amArrival.split(":").map(Number);
          const late = (h * 60 + min) - 480; // 8:00 AM = 480 min
          return sum + Math.max(0, late);
        }
        return sum;
      }, 0);

      return {
        totalStudents: students.length,
        totalRecords: records.length,
        totalLate: records.filter(r => r.status === "late").length,
        totalAbsent: records.filter(r => r.status === "absent").length,
        totalPresent: records.filter(r => r.status === "present").length,
        lateMinutes: totalLateMinutes,
        studentsWithRecords: studentRecords.size,
      };
    }),

  getStudentAttendance: authedQuery
    .input(z.object({ studentId: z.number(), month: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const startDate = `${input.month}-01`;
      const [y, m] = input.month.split("-").map(Number);
      const endDate = `${input.month}-${new Date(y, m, 0).getDate()}`;

      const records = await db.query.attendance.findMany({
        where: and(
          eq(attendance.studentId, input.studentId),
          sql`${attendance.date} >= ${startDate}`,
          sql`${attendance.date} <= ${endDate}`
        ),
        orderBy: [attendance.date],
      });

      // Get student + assignment info
      const student = await db.query.users.findFirst({
        where: eq(users.id, input.studentId),
        with: { college: true },
      });
      const assignment = await db.query.internAssignments.findFirst({
        where: and(eq(internAssignments.studentId, input.studentId), eq(internAssignments.status, "active") as any),
        with: { hte: true },
      });

      // Compute progress
      const allRecords = await db.query.attendance.findMany({
        where: eq(attendance.studentId, input.studentId),
      });
      const totalMinutes = allRecords.reduce((acc, r) => {
        let mins = 0;
        if (r.amArrival && r.amDeparture) {
          mins += (new Date(`2000-01-01T${r.amDeparture}`).getTime() - new Date(`2000-01-01T${r.amArrival}`).getTime()) / 60000;
        }
        if (r.pmArrival && r.pmDeparture) {
          mins += (new Date(`2000-01-01T${r.pmDeparture}`).getTime() - new Date(`2000-01-01T${r.pmArrival}`).getTime()) / 60000;
        }
        return acc + mins;
      }, 0);
      const completedHours = Math.round((totalMinutes / 60) * 100) / 100;

      return { records, student, assignment, progress: { completedHours, requiredHours: 486, remainingHours: Math.max(0, 486 - completedHours) } };
    }),

  getToday: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      const today = new Date().toISOString().slice(0, 10);
      const record = await db.query.attendance.findFirst({
        where: and(
          eq(attendance.studentId, ctx.user.id),
          sql`${attendance.date} = ${today}`
        ),
      });
      return record || null;
    }),

  getSupervisorRemarks: authedQuery
    .input(z.object({ attendanceId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const record = await db.query.attendance.findFirst({
        where: eq(attendance.id, input.attendanceId),
        with: { student: true },
      });
      return record?.notes || null;
    }),

  getInternshipProgress: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      const studentId = ctx.user.id;
      const REQUIRED_HOURS = 486; // standard PH internship hours

      const records = await db.query.attendance.findMany({
        where: eq(attendance.studentId, studentId),
      });

      const totalMinutes = records.reduce((acc, r) => {
        let mins = 0;
        if (r.amArrival && r.amDeparture) {
          const amIn = new Date(`2000-01-01T${r.amArrival}`);
          const amOut = new Date(`2000-01-01T${r.amDeparture}`);
          mins += (amOut.getTime() - amIn.getTime()) / 1000 / 60;
        }
        if (r.pmArrival && r.pmDeparture) {
          const pmIn = new Date(`2000-01-01T${r.pmArrival}`);
          const pmOut = new Date(`2000-01-01T${r.pmDeparture}`);
          mins += (pmOut.getTime() - pmIn.getTime()) / 1000 / 60;
        }
        return acc + mins;
      }, 0);

      const completedHours = Math.round((totalMinutes / 60) * 100) / 100;
      const remaining = Math.max(0, REQUIRED_HOURS - completedHours);
      const progress = Math.min(100, Math.round((completedHours / REQUIRED_HOURS) * 100));

      return { completedHours, requiredHours: REQUIRED_HOURS, remainingHours: remaining, progress };
    }),

  getSummary: authedQuery
    .input(
      z.object({
        studentId: z.number().optional(),
        month: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const studentId = input.studentId || ctx.user.id;
      const startDate = `${input.month}-01`;
      const [year, month] = input.month.split("-").map(Number);
      const endDate = `${input.month}-${new Date(year, month, 0).getDate()}`;

      const records = await db.query.attendance.findMany({
        where: and(
          eq(attendance.studentId, studentId),
          sql`${attendance.date} >= ${startDate}`,
          sql`${attendance.date} <= ${endDate}`
        ),
      });

      const totalHours = records.reduce((acc, r) => {
        let hours = 0;
        if (r.amArrival && r.amDeparture) {
          const amIn = new Date(`2000-01-01T${r.amArrival}`);
          const amOut = new Date(`2000-01-01T${r.amDeparture}`);
          hours += (amOut.getTime() - amIn.getTime()) / 1000 / 60 / 60;
        }
        if (r.pmArrival && r.pmDeparture) {
          const pmIn = new Date(`2000-01-01T${r.pmArrival}`);
          const pmOut = new Date(`2000-01-01T${r.pmDeparture}`);
          hours += (pmOut.getTime() - pmIn.getTime()) / 1000 / 60 / 60;
        }
        return acc + hours;
      }, 0);

      const totalUndertime = records.reduce((acc, r) => acc + (r.undertimeHours || 0) * 60 + (r.undertimeMinutes || 0), 0);

      return {
        totalDays: records.length,
        presentDays: records.filter(r => r.status === "present").length,
        absentDays: records.filter(r => r.status === "absent").length,
        lateDays: records.filter(r => r.status === "late").length,
        totalHours: Math.round(totalHours * 100) / 100,
        totalUndertimeHours: Math.floor(totalUndertime / 60),
        totalUndertimeMinutes: totalUndertime % 60,
      };
    }),
});
