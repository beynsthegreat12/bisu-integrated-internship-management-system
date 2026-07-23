import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, htes, internAssignments, accomReports, tasks, requirements } from "@db/schema";
import { eq, like, or, and, sql } from "drizzle-orm";

export const searchRouter = createRouter({
  global: authedQuery
    .input(
      z.object({
        q: z.string().min(1),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const q = `%${input.q.toLowerCase()}%`;
      const limit = input.limit || 10;

      const results: {
        type: string;
        label: string;
        description: string;
        link: string;
        icon: string;
      }[] = [];

      // 1. Search Students
      const students = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(
        and(
          or(
            eq(users.role, "student"),
            eq(users.role, "coordinator"),
            eq(users.role, "supervisor"),
            eq(users.role, "sipp_coordinator"),
            eq(users.role, "admin"),
          ),
          or(
            sql`LOWER(${users.name}) LIKE ${q}`,
            sql`LOWER(${users.email}) LIKE ${q}`,
          )
        )
      )
      .limit(limit);

      for (const s of students) {
        results.push({
          type: "user",
          label: s.name || "Unknown",
          description: `${s.email || "No email"} · ${s.role?.replace("_", " ") || "N/A"}`,
          link: `/${s.role === "sipp_coordinator" ? "sipp" : s.role === "coordinator" || s.role === "admin" ? "coordinator" : s.role}/profile`,
          icon: "User",
        });
      }

      // 2. Search HTEs
      const hteList = await db.select()
        .from(htes)
        .where(sql`LOWER(${htes.name}) LIKE ${q}`)
        .limit(limit);

      for (const h of hteList) {
        results.push({
          type: "hte",
          label: h.name,
          description: h.address || "No address",
          link: "/coordinator/htes",
          icon: "Building2",
        });
      }

      // 3. Search Reports
      const reportList = await db.select({
        id: accomReports.id,
        description: accomReports.description,
        status: accomReports.status,
        date: accomReports.date,
      })
      .from(accomReports)
      .where(sql`LOWER(${accomReports.description}) LIKE ${q}`)
      .limit(limit);

      for (const r of reportList) {
        results.push({
          type: "report",
          label: r.description?.substring(0, 60) || "Report",
          description: `${new Date(r.date).toLocaleDateString()} · ${r.status}`,
          link: "/coordinator/reports",
          icon: "FileText",
        });
      }

      // 4. Search Tasks
      const taskList = await db.select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        dueDate: tasks.dueDate,
      })
      .from(tasks)
      .where(sql`LOWER(${tasks.title}) LIKE ${q}`)
      .limit(limit);

      for (const t of taskList) {
        results.push({
          type: "task",
          label: t.title,
          description: `${t.status?.replace("_", " ") || "N/A"}${t.dueDate ? ` · Due: ${new Date(t.dueDate).toLocaleDateString()}` : ""}`,
          link: `/${ctx.user.role}/tasks`,
          icon: "CheckSquare",
        });
      }

      // 5. Search Requirements
      const reqList = await db.select({
        id: requirements.id,
        filePath: requirements.filePath,
        status: requirements.status,
      })
      .from(requirements)
      .where(sql`${requirements.filePath} IS NOT NULL AND LOWER(${requirements.filePath}) LIKE ${q}`)
      .limit(limit);

      for (const r of reqList) {
        results.push({
          type: "requirement",
          label: `Requirement #${r.id}`,
          description: r.status || "N/A",
          link: "/coordinator/requirements",
          icon: "ClipboardList",
        });
      }

      // Limit total results
      return results.slice(0, limit);
    }),
});