import { z } from "zod";
import { createRouter, authedQuery, supervisorQuery, coordinatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { evaluations, evaluationScores, users, internAssignments, htes } from "@db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

// ── Evaluation Criteria (based on official BISU form) ──
export const JOB_PERFORMANCE_CRITERIA = [
  // Personal Skills
  { category: "Personal Skills", name: "Personal Discipline", weight: "job_performance" },
  { category: "Personal Skills", name: "Critical Thinking", weight: "job_performance" },
  { category: "Personal Skills", name: "Motivation", weight: "job_performance" },
  { category: "Personal Skills", name: "Problem Solving", weight: "job_performance" },
  { category: "Personal Skills", name: "Planning & Organizing", weight: "job_performance" },
  { category: "Personal Skills", name: "Ethical Thinking", weight: "job_performance" },
  { category: "Personal Skills", name: "Entrepreneurial Thinking", weight: "job_performance" },
  { category: "Personal Skills", name: "Innovation", weight: "job_performance" },
  { category: "Personal Skills", name: "Perseverance", weight: "job_performance" },
  { category: "Personal Skills", name: "Continuous Improvement", weight: "job_performance" },
  // Interpersonal Skills
  { category: "Interpersonal Skills", name: "Teamwork & Collaboration", weight: "job_performance" },
  { category: "Interpersonal Skills", name: "Oral & Written Communication", weight: "job_performance" },
  { category: "Interpersonal Skills", name: "Conflict Resolution", weight: "job_performance" },
  // Technical Understanding
  { category: "Technical Understanding", name: "Computer Concepts Application", weight: "job_performance" },
  { category: "Technical Understanding", name: "Design & Implementation", weight: "job_performance" },
  { category: "Technical Understanding", name: "Technical Standards Recognition", weight: "job_performance" },
  { category: "Technical Understanding", name: "Research in CS", weight: "job_performance" },
  { category: "Technical Understanding", name: "Knowledge Integration", weight: "job_performance" },
]

export const LIFE_SKILLS_CRITERIA = [
  { category: "Cooperativeness", name: "Takes Direction & Guidance", weight: "life_skills" },
  { category: "Human Relations", name: "Proper Decorum", weight: "life_skills" },
  { category: "Leadership", name: "Influences Others", weight: "life_skills" },
  { category: "Decision Making", name: "Sound Judgment", weight: "life_skills" },
  { category: "Planning", name: "Sets Clear Targets", weight: "life_skills" },
  { category: "Adaptability", name: "Prioritizes Multiple Tasks", weight: "life_skills" },
  { category: "Dependability", name: "Executes Work as Instructed", weight: "life_skills" },
  { category: "Dependability", name: "Works with Minimum Supervision", weight: "life_skills" },
  { category: "Communication", name: "Oral Communication", weight: "life_skills" },
  { category: "Communication", name: "Written Communication", weight: "life_skills" },
  { category: "Conduct", name: "Filipino Values & Industry Values", weight: "life_skills" },
  { category: "Conduct", name: "Commitment to Job", weight: "life_skills" },
  { category: "Conduct", name: "Compliance with Guidelines", weight: "life_skills" },
  { category: "Attendance", name: "Punctuality", weight: "life_skills" },
  { category: "Attendance", name: "Regular Attendance", weight: "life_skills" },
]

// Rating conversion: 1-100 scale to equivalent and description
export function getRatingDescription(score: number): { equivalent: string; description: string } {
  if (score >= 99) return { equivalent: "1.0", description: "Excellent" };
  if (score >= 97) return { equivalent: "1.1", description: "Excellent" };
  if (score >= 95) return { equivalent: "1.2", description: "Excellent" };
  if (score >= 93) return { equivalent: "1.3", description: "Very Good" };
  if (score >= 91) return { equivalent: "1.4", description: "Very Good" };
  if (score === 90) return { equivalent: "1.5", description: "Very Good" };
  if (score === 89) return { equivalent: "1.6", description: "Good" };
  if (score === 88) return { equivalent: "1.7", description: "Good" };
  if (score === 87) return { equivalent: "1.8", description: "Good" };
  if (score === 86) return { equivalent: "1.9", description: "Good" };
  if (score >= 80 && score <= 85) {
    const equiv = 1.5 + (85 - score) * 0.1;
    return { equivalent: equiv.toFixed(1), description: "Good" };
  }
  if (score >= 75 && score <= 79) {
    const equiv = 2.5 + (79 - score) * 0.1;
    return { equivalent: equiv.toFixed(1), description: "Fair" };
  }
  return { equivalent: "5.0", description: "Failure" };
}

export const evaluationRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        assignmentId: z.number().optional(),
        studentId: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [];

      if (ctx.user.role === "student") {
        conditions.push(eq(evaluations.assignmentId, -1)); // Empty by default for student
      } else if (input?.assignmentId) {
        conditions.push(eq(evaluations.assignmentId, input.assignmentId));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      return db.query.evaluations.findMany({
        where,
        with: {
          evaluator: true,
          scores: true,
        },
        orderBy: (evals, { desc }) => [desc(evals.createdAt)],
      });
    }),

  getMyEvaluations: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      // Find student's assignment, then get evaluations
      const assignments = await db.query.internAssignments.findMany({
        where: eq(internAssignments.studentId, ctx.user.id),
        with: { hte: true },
      });

      const assignmentIds = assignments.map(a => a.id);
      if (assignmentIds.length === 0) return [];

      const evals = await db.query.evaluations.findMany({
        where: inArray(evaluations.assignmentId, assignmentIds),
        with: {
          evaluator: true,
          scores: true,
        },
        orderBy: (evals, { desc }) => [desc(evals.createdAt)],
      });

      return evals.map(e => ({
        ...e,
        hteName: assignments[0]?.hte?.name || null,
      }));
    }),

  coordinatorList: coordinatorQuery
    .input(
      z.object({
        search: z.string().optional(),
        month: z.string().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      // Get all evaluations with student info via assignments
      const allEvals = await db.query.evaluations.findMany({
        with: {
          evaluator: true,
          scores: true,
        },
        orderBy: (evals, { desc }) => [desc(evals.createdAt)],
      });

      // Enrich with student/HTE info
      const enriched = await Promise.all(allEvals.map(async (e) => {
        const assignment = await db.query.internAssignments.findFirst({
          where: eq(internAssignments.id, e.assignmentId),
          with: { student: true, hte: true, college: true },
        });

        const status = e.overallGrade ? "completed" : "pending";

        // Filter
        if (input?.status && input.status !== "all" && status !== input.status) return null;
        if (input?.search && assignment?.student?.name) {
          if (!assignment.student.name.toLowerCase().includes(input.search.toLowerCase())) return null;
        }

        return {
          ...e,
          student: assignment?.student || null,
          hteName: assignment?.hte?.name || null,
          college: assignment?.college || null,
          status,
        };
      }));

      return enriched.filter(Boolean);
    }),

  getCoordinatorStats: coordinatorQuery.query(async () => {
      const db = getDb();
      const allEvals = await db.query.evaluations.findMany({ with: { scores: true } });
      const total = allEvals.length;
      const completed = allEvals.filter(e => e.overallGrade).length;
      const pending = total - completed;

      const totalScore = allEvals.reduce((sum, e) => sum + (Number(e.overallGrade) || 0), 0);
      const avgScore = total > 0 ? (totalScore / total) : 0;

      return { total, completed, pending, avgScore: Math.round(avgScore * 100) / 100 };
    }),

  create: authedQuery
    .input(
      z.object({
        studentId: z.number(),
        hteRating: z.number().min(1).max(100).optional(),
        coordinatorRating: z.number().min(1).max(100).optional(),
        overallGrade: z.number().optional(),
        comments: z.string().optional(),
        scores: z.array(z.object({
          criteriaName: z.string(),
          category: z.string(),
          rating: z.number().min(1).max(100),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Find or get assignment
      const existingAssignments = await db.query.internAssignments.findMany({
        where: eq(internAssignments.studentId, input.studentId),
        limit: 1,
      });
      const assignmentId = existingAssignments[0]?.id || 1;

      // Calculate auto-computed values
      const jobPerfScores = (input.scores || []).filter(s => s.category !== "life_skills" && s.category !== undefined);
      const lifeSkillScores = (input.scores || []).filter(s => s.category === "life_skills");

      const jobPerfAvg = jobPerfScores.length > 0
        ? jobPerfScores.reduce((sum, s) => sum + s.rating, 0) / jobPerfScores.length
        : input.hteRating || 0;

      const lifeSkillAvg = lifeSkillScores.length > 0
        ? lifeSkillScores.reduce((sum, s) => sum + s.rating, 0) / lifeSkillScores.length
        : 0;

      const overall = (jobPerfAvg * 0.8) + (lifeSkillAvg * 0.2);

      const result = await db.insert(evaluations).values({
        assignmentId,
        evaluatorId: ctx.user.id,
        hteRating: input.hteRating !== undefined ? String(input.hteRating) : null,
        coordinatorRating: input.coordinatorRating !== undefined ? String(input.coordinatorRating) : null,
        overallGrade: String(Math.round(overall * 100) / 100),
        comments: input.comments || null,
      });

      const evalId = Number(result[0].insertId);

      if (input.scores && input.scores.length > 0) {
        await db.insert(evaluationScores).values(
          input.scores.map(s => ({
            evaluationId: evalId,
            criteriaName: s.criteriaName,
            rating: s.rating,
          }))
        );
      }

      return { success: true, id: evalId, overallGrade: Math.round(overall * 100) / 100, jobPerfAvg, lifeSkillAvg };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["approved", "returned"]),
      coordinatorRemarks: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Update evaluation status - stored in comments as status marker
      const existing = await db.query.evaluations.findFirst({
        where: eq(evaluations.id, input.id),
      });
      if (!existing) throw new Error("Evaluation not found");

      const currentComments = existing.comments || "";
      const statusMarker = `[COORDINATOR_STATUS: ${input.status.toUpperCase()}]`;
      const remarksMarker = input.coordinatorRemarks
        ? `[COORDINATOR_REMARKS: ${input.coordinatorRemarks}]`
        : "";

      const newComments = `${statusMarker} ${remarksMarker}\n${currentComments}`;

      await db.update(evaluations)
        .set({ comments: newComments })
        .where(eq(evaluations.id, input.id));

      return { success: true };
    }),

  getStudents: coordinatorQuery.query(async () => {
      const db = getDb();
      const students = await db.query.users.findMany({
        where: eq(users.role, "student"),
        columns: { id: true, name: true, email: true },
      });

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
});