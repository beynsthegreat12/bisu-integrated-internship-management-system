import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  bigint,
  date,
  time,
  int,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

// Colleges
export const colleges = mysqlTable("colleges", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type College = typeof colleges.$inferSelect;

// HTEs (Host Training Establishments)
export const htes = mysqlTable("htes", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  supervisorId: bigint("supervisor_id", { mode: "number", unsigned: true }).references(() => users.id),
  collegeId: bigint("college_id", { mode: "number", unsigned: true }).references(() => colleges.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Hte = typeof htes.$inferSelect;

// Users (extended from existing)
export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["student", "coordinator", "supervisor", "sipp_coordinator", "admin"]).default("student").notNull(),
  collegeId: bigint("college_id", { mode: "number", unsigned: true }).references(() => colleges.id),
  phoneNum: varchar("phone_num", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Internship Assignments (shortened to intern_assignments)
export const internAssignments = mysqlTable("intern_assignments", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  hteId: bigint("hte_id", { mode: "number", unsigned: true }).notNull().references(() => htes.id),
  coordinatorId: bigint("coordinator_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  collegeId: bigint("college_id", { mode: "number", unsigned: true }).notNull().references(() => colleges.id),
  location: varchar("location", { length: 255 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: mysqlEnum("status", ["active", "completed", "cancelled", "pull_out"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InternAssignment = typeof internAssignments.$inferSelect;

// Attendance (Daily Time Record)
export const attendance = mysqlTable("attendance", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  assignmentId: bigint("assignment_id", { mode: "number", unsigned: true }).notNull().references(() => internAssignments.id),
  date: date("date").notNull(),
  amArrival: time("am_arrival"),
  amDeparture: time("am_departure"),
  pmArrival: time("pm_arrival"),
  pmDeparture: time("pm_departure"),
  undertimeHours: int("undertime_hours").default(0),
  undertimeMinutes: int("undertime_minutes").default(0),
  status: mysqlEnum("status", ["present", "absent", "late", "excused"]).default("present").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Attendance = typeof attendance.$inferSelect;

// Accomplishment Reports (shortened to accom_reports)
export const accomReports = mysqlTable("accom_reports", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  assignmentId: bigint("assignment_id", { mode: "number", unsigned: true }).references(() => internAssignments.id),
  date: date("date").notNull(),
  description: text("description").notNull(),
  remarks: text("remarks"),
  filePath: text("file_path"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewerId: bigint("reviewer_id", { mode: "number", unsigned: true }).references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AccomReport = typeof accomReports.$inferSelect;

// Tasks
export const tasks = mysqlTable("tasks", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  supervisorId: bigint("supervisor_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  assignmentId: bigint("assignment_id", { mode: "number", unsigned: true }).notNull().references(() => internAssignments.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "overdue"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;

// Requirement Types
export const requirementTypes = mysqlTable("requirement_types", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RequirementType = typeof requirementTypes.$inferSelect;

// Requirements
export const requirements = mysqlTable("requirements", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  assignmentId: bigint("assignment_id", { mode: "number", unsigned: true }).notNull().references(() => internAssignments.id),
  typeId: bigint("type_id", { mode: "number", unsigned: true }).notNull().references(() => requirementTypes.id),
  filePath: text("file_path"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Requirement = typeof requirements.$inferSelect;

// Site Visits
export const siteVisits = mysqlTable("site_visits", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  coordinatorId: bigint("coordinator_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  hteId: bigint("hte_id", { mode: "number", unsigned: true }).notNull().references(() => htes.id),
  visitDate: date("visit_date").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SiteVisit = typeof siteVisits.$inferSelect;

// Evaluations
export const evaluations = mysqlTable("evaluations", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  assignmentId: bigint("assignment_id", { mode: "number", unsigned: true }).notNull().references(() => internAssignments.id),
  evaluatorId: bigint("evaluator_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  hteRating: decimal("hte_rating", { precision: 5, scale: 2 }),
  coordinatorRating: decimal("coordinator_rating", { precision: 5, scale: 2 }),
  overallGrade: decimal("overall_grade", { precision: 5, scale: 2 }),
  comments: text("comments"),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Evaluation = typeof evaluations.$inferSelect;

// Evaluation Scores
export const evaluationScores = mysqlTable("eval_scores", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  evaluationId: bigint("eval_id", { mode: "number", unsigned: true }).notNull().references(() => evaluations.id),
  criteriaName: varchar("criteria_name", { length: 255 }).notNull(),
  rating: int("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EvaluationScore = typeof evaluationScores.$inferSelect;

// Messages
export const messages = mysqlTable("messages", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  senderId: bigint("sender_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  receiverId: bigint("receiver_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;

// Password Reset Tokens
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Notifications
export const notifications = mysqlTable("notifications", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["info", "success", "warning", "error"]).default("info").notNull(),
  link: varchar("link", { length: 255 }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// System Settings
export const systemSettings = mysqlTable("system_settings", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SystemSetting = typeof systemSettings.$inferSelect;