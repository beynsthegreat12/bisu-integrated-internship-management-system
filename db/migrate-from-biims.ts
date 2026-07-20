/**
 * Migration: Import data from old biims database into new my_app database
 * Run with: npx tsx db/migrate-from-biims.ts
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema, mode: "default" });

// Old DB pool for reading from biims
const oldPool = mysql.createPool({ uri: process.env.DATABASE_URL!.replace(/\/[^/]+$/, "/biims") });
const oldDb = drizzle(oldPool, { schema: schema as any, mode: "default" });

// Track ID mappings (old -> new)
const idMaps: Record<string, Record<number, number>> = {
  users: {},
  colleges: {},
  htes: {},
  assignments: {},
  tasks: {},
  requirementTypes: {},
  reports: {},
};

const statusMap: Record<number, string> = {
  1: "pending",    // Submitted
  2: "pending",    // Late -> pending
  3: "approved",   // Approved
  4: "pending",    // For Revision -> pending  
  5: "present",    // Present
  6: "pending",    // Pending
  7: "in_progress",// In Progress
  8: "completed",  // Completed
};

const oldRoleToNew: Record<number, string> = {
  1: "coordinator",
  2: "student",
  3: "supervisor",
  4: "admin",
  5: "admin", // chairperson -> admin
};

async function migrate() {
  console.log("=== Starting BIIMS Migration ===");

  // 1. Colleges (from old college table)
  console.log("\n📚 Migrating colleges...");
  const oldColleges = await oldPool.query("SELECT * FROM college");
  for (const c of oldColleges[0] as any[]) {
    const colId = Number(c.college_id);
    // Check if already exists by name
    const existing = await db.select().from(schema.colleges).where(eq(schema.colleges.name, c.college_name));
    if (existing.length > 0) {
      idMaps.colleges[colId] = existing[0].id;
      console.log(`  College "${c.college_name}" already exists (id=${existing[0].id})`);
    } else {
      const result = await db.insert(schema.colleges).values({
        name: c.college_name,
        department: null,
      });
      const newId = (result[0] as any).insertId;
      idMaps.colleges[colId] = newId;
      console.log(`  Inserted college "${c.college_name}" (old=${colId} → new=${newId})`);
    }
  }

  // Get departments for college info
  const oldDepartments = await oldPool.query("SELECT * FROM department");
  for (const d of oldDepartments[0] as any[]) {
    const deptId = Number(d.department_id);
    const collegeId = Number(d.college_id);
    if (idMaps.colleges[collegeId]) {
      // Update the college's department field (use first department per college)
      const college = await db.select().from(schema.colleges).where(eq(schema.colleges.id, idMaps.colleges[collegeId]));
      if (college[0] && !college[0].department) {
        await db.update(schema.colleges).set({ department: d.department_name }).where(eq(schema.colleges.id, idMaps.colleges[collegeId]));
      }
    }
  }

  // 2. Users
  console.log("\n👥 Migrating users...");
  const oldUsers = await oldPool.query("SELECT * FROM users");
  for (const u of oldUsers[0] as any[]) {
    const userId = Number(u.user_id);
    const email = u.email || "";
    // Check if user already exists by email
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (existing.length > 0) {
      idMaps.users[userId] = existing[0].id;
      // Update role if needed
      const role = oldRoleToNew[u.role_id] || "student";
      if (existing[0].role !== role) {
        await db.update(schema.users).set({ role: role as any }).where(eq(schema.users.id, existing[0].id));
      }
      console.log(`  User "${u.email}" already exists (id=${existing[0].id})`);
    } else {
      try {
        await db.insert(schema.users).values({
          unionId: "migrated-" + userId,
          name: u.name || u.first_name + " " + u.last_name,
          email: email,
          avatar: null,
          role: (oldRoleToNew[u.role_id] || "student") as any,
          collegeId: idMaps.colleges[Number(u.college_id)] ?? null,
          phoneNum: u.phone_num || null,
          createdAt: u.created_at ? new Date(u.created_at) : new Date(),
          updatedAt: u.updated_at ? new Date(u.updated_at) : new Date(),
          lastSignInAt: u.created_at ? new Date(u.created_at) : new Date(),
        });
        // Get the inserted ID
        const newUser = await db.select().from(schema.users).where(eq(schema.users.unionId, "migrated-" + userId));
        if (newUser[0]) {
          idMaps.users[userId] = newUser[0].id;
          console.log(`  Inserted user "${u.name}" (old=${userId} → new=${newUser[0].id})`);
        }
      } catch (err: any) {
        console.log(`  ⚠️ Failed to insert user ${userId}: ${err.message}`);
      }
    }
  }

  // 3. HTEs
  console.log("\n🏢 Migrating HTEs...");
  const oldHtes = await oldPool.query("SELECT * FROM hte");
  for (const h of oldHtes[0] as any[]) {
    const hteId = Number(h.hte_id);
    const supervisorId = idMaps.users[Number(h.supervisor_user_id)] ?? null;
    await db.insert(schema.htes).values({
      name: h.hte_name,
      address: h.hte_address || null,
      supervisorId: supervisorId,
      collegeId: null,
    });
    const newHte = await db.select().from(schema.htes).where(eq(schema.htes.name, h.hte_name));
    if (newHte[0]) {
      idMaps.htes[hteId] = newHte[0].id;
      console.log(`  Inserted HTE "${h.hte_name}" (old=${hteId} → new=${newHte[0].id})`);
    }
  }

  // 4. Internship Assignments
  console.log("\n📋 Migrating assignments...");
  const oldAssignments = await oldPool.query("SELECT * FROM internship_assignment");
  for (const a of oldAssignments[0] as any[]) {
    const assignId = Number(a.iassignment_id);
    const studentId = idMaps.users[Number(a.student_id)];
    const hteId = idMaps.htes[Number(a.hte_id)];
    const coordinatorId = idMaps.users[Number(a.coordinator_id)] ?? null;
    
    if (studentId && hteId) {
      try {
        await db.insert(schema.internAssignments).values({
          studentId: studentId,
          hteId: hteId,
          coordinatorId: coordinatorId || studentId, // fallback
          collegeId: idMaps.colleges[1] ?? 1, // default college
          location: a.location_scope || null,
          startDate: a.start_date ? new Date(a.start_date) : null,
          endDate: a.end_date ? new Date(a.end_date) : null,
          status: "active" as any,
        });
        const newAssign = await db.select().from(schema.internAssignments).where(
          eq(schema.internAssignments.studentId, studentId)
        );
        const match = newAssign.find(x => x.hteId === hteId);
        if (match) {
          idMaps.assignments[assignId] = match.id;
          console.log(`  Inserted assignment (old=${assignId} → new=${match.id})`);
        }
      } catch (err: any) {
        console.log(`  ⚠️ Failed assignment ${assignId}: ${err.message}`);
      }
    }
  }

  // 5. Tasks
  console.log("\n✅ Migrating tasks...");
  const oldTasks = await oldPool.query("SELECT * FROM tasks");
  for (const t of oldTasks[0] as any[]) {
    const taskId = Number(t.tasks_id);
    const studentId = idMaps.users[Number(t.student_id)];
    const supervisorId = idMaps.users[Number(t.supervisors_id)];
    const assignId = idMaps.assignments[Number(t.assignment_id)];
    
    if (studentId && assignId) {
      const status = statusMap[t.status_id] || "pending";
      try {
        await db.insert(schema.tasks).values({
          studentId: studentId,
          supervisorId: supervisorId || studentId,
          assignmentId: assignId,
          title: t.title,
          description: t.description || null,
          dueDate: t.due_date ? new Date(t.due_date) : null,
          status: status as any,
        });
        const newTask = await db.select().from(schema.tasks).where(eq(schema.tasks.title, t.title));
        if (newTask[0]) {
          idMaps.tasks[taskId] = newTask[0].id;
          console.log(`  Inserted task "${t.title}" (old=${taskId} → new=${newTask[0].id})`);
        }
      } catch (err: any) {
        console.log(`  ⚠️ Failed task ${taskId}: ${err.message}`);
      }
    }
  }

  // 6. Attendance
  console.log("\n🕐 Migrating attendance...");
  const oldAttendance = await oldPool.query("SELECT * FROM attendance");
  for (const a of oldAttendance[0] as any[]) {
    const studentId = idMaps.users[Number(a.student_id)];
    if (!studentId) continue;

    // Find assignment for this student
    const assign = await db.select().from(schema.internAssignments).where(
      eq(schema.internAssignments.studentId, studentId)
    );
    const assignId = assign[0]?.id;
    if (!assignId) continue;

    const status = statusMap[a.status_id] || "present";
    try {
      await db.insert(schema.attendance).values({
        studentId: studentId,
        assignmentId: assignId,
        date: new Date(a.date),
        amArrival: a.am_arrival || null,
        amDeparture: a.am_departure || null,
        pmArrival: a.pm_arrival || null,
        pmDeparture: a.pm_departure || null,
        undertimeHours: a.undertime_hours || 0,
        undertimeMinutes: a.undertime_mins || 0,
        status: status as any,
        notes: a.activity_summary || null,
      });
    } catch (err: any) {
      console.log(`  ⚠️ Failed attendance: ${err.message}`);
    }
  }
  console.log(`  Attendance records migrated`);

  // 7. Accomplishment Reports
  console.log("\n📝 Migrating accomplishment reports...");
  const oldReports = await oldPool.query("SELECT * FROM accomplishment_reports");
  for (const r of oldReports[0] as any[]) {
    const studentId = idMaps.users[Number(r.student_id)];
    if (!studentId) continue;

    const assign = await db.select().from(schema.internAssignments).where(
      eq(schema.internAssignments.studentId, studentId)
    );
    const assignId = assign[0]?.id;
    if (!assignId) continue;

    const status = statusMap[r.status_id] || "pending";
    try {
      await db.insert(schema.accomReports).values({
        studentId: studentId,
        assignmentId: assignId,
        date: new Date(r.date),
        description: r.description || "",
        status: status as any,
      });
    } catch (err: any) {
      console.log(`  ⚠️ Failed report: ${err.message}`);
    }
  }
  console.log(`  Reports migrated`);

  // 8. Evaluations (from hte_feedback table - since old evaluations table only has 3 rows
  // and hte_feedback contains the actual feedback with ai_summary)
  console.log("\n📊 Migrating evaluations...");
  const oldEvals = await oldPool.query("SELECT * FROM evaluations");
  for (const e of oldEvals[0] as any[]) {
    const assignId = idMaps.assignments[Number(e.assignment_id)];
    const evaluatorId = idMaps.users[Number(e.evaluator_id)];
    
    if (assignId && evaluatorId) {
      try {
        await db.insert(schema.evaluations).values({
          assignmentId: assignId,
          evaluatorId: evaluatorId,
          hteRating: String(e.hte_rating_weight || null) as any,
          coordinatorRating: String(e.coordinator_rating_weight || null) as any,
          overallGrade: String(e.overall_final_grade || null) as any,
          comments: e.comments_suggestions || null,
          aiSummary: null,
        });
        console.log(`  Inserted evaluation for assignment ${Number(e.assignment_id)}`);
      } catch (err: any) {
        console.log(`  ⚠️ Failed evaluation: ${err.message}`);
      }
    }
  }

  // Also import hte_feedback as evaluations (they contain ai_summary)
  const oldFeedback = await oldPool.query("SELECT * FROM hte_feedback");
  for (const f of oldFeedback[0] as any[]) {
    const assignId = idMaps.assignments[Number(f.assignment_id)];
    const evaluatorId = idMaps.users[Number(f.user_id)];
    
    if (assignId && evaluatorId && f.ai_summary) {
      try {
        await db.insert(schema.evaluations).values({
          assignmentId: assignId,
          evaluatorId: evaluatorId,
          hteRating: String(f.rating_average || null) as any,
          coordinatorRating: null as any,
          overallGrade: null as any,
          comments: f.overall_comments || null,
          aiSummary: f.ai_summary || null,
        });
        console.log(`  Inserted feedback as evaluation for assignment ${Number(f.assignment_id)}`);
      } catch (err: any) {
        console.log(`  ⚠️ Failed feedback eval: ${err.message}`);
      }
    }
  }

  // 9. Messages
  console.log("\n💬 Migrating messages...");
  const oldMessages = await oldPool.query("SELECT * FROM messages");
  for (const m of oldMessages[0] as any[]) {
    const senderId = idMaps.users[Number(m.sender_id)];
    const receiverId = idMaps.users[Number(m.receiver_id)];
    
    if (senderId && receiverId) {
      try {
        await db.insert(schema.messages).values({
          senderId: senderId,
          receiverId: receiverId,
          content: m.subject ? `${m.subject}\n\n${m.message_text}` : m.message_text,
          isRead: m.is_read === "1" || m.is_read === 1,
        });
      } catch (err: any) {
        console.log(`  ⚠️ Failed message: ${err.message}`);
      }
    }
  }
  console.log(`  Messages migrated`);

  // 10. Site Visits (from schedules)
  console.log("\n🚗 Migrating site visits...");
  const oldSchedules = await oldPool.query("SELECT * FROM schedules");
  for (const s of oldSchedules[0] as any[]) {
    const coordinatorId = idMaps.users[Number(s.coordinator_id)];
    const studentId = idMaps.users[Number(s.student_id)];
    
    if (coordinatorId && studentId) {
      // Find student's assignment
      const assign = await db.select().from(schema.internAssignments).where(
        eq(schema.internAssignments.studentId, studentId)
      );
      const hteId = assign[0]?.hteId;
      if (hteId) {
        try {
          await db.insert(schema.siteVisits).values({
            coordinatorId: coordinatorId,
            studentId: studentId,
            hteId: hteId,
            visitDate: new Date(s.visit_date),
            status: "completed" as any,
          });
        } catch (err: any) {
          console.log(`  ⚠️ Failed site visit: ${err.message}`);
        }
      }
    }
  }
  console.log(`  Site visits migrated`);

  console.log("\n🎉 Migration complete!");
  await pool.end();
  await oldPool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});