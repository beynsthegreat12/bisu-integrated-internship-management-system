import { relations } from "drizzle-orm";
import {
  users,
  colleges,
  htes,
  internAssignments,
  attendance,
  accomReports,
  tasks,
  requirements,
  requirementTypes,
  siteVisits,
  evaluations,
  evaluationScores,
  messages,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  college: one(colleges, {
    fields: [users.collegeId],
    references: [colleges.id],
  }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

export const collegesRelations = relations(colleges, ({ many }) => ({
  users: many(users),
  htes: many(htes),
  assignments: many(internAssignments),
}));

export const htesRelations = relations(htes, ({ one, many }) => ({
  supervisor: one(users, {
    fields: [htes.supervisorId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [htes.collegeId],
    references: [colleges.id],
  }),
  assignments: many(internAssignments),
  siteVisits: many(siteVisits),
}));

export const internAssignmentsRelations = relations(internAssignments, ({ one, many }) => ({
  student: one(users, {
    fields: [internAssignments.studentId],
    references: [users.id],
  }),
  hte: one(htes, {
    fields: [internAssignments.hteId],
    references: [htes.id],
  }),
  coordinator: one(users, {
    fields: [internAssignments.coordinatorId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [internAssignments.collegeId],
    references: [colleges.id],
  }),
  attendance: many(attendance),
  reports: many(accomReports),
  tasks: many(tasks),
  requirements: many(requirements),
  evaluations: many(evaluations),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(users, {
    fields: [attendance.studentId],
    references: [users.id],
  }),
  assignment: one(internAssignments, {
    fields: [attendance.assignmentId],
    references: [internAssignments.id],
  }),
}));

export const accomReportsRelations = relations(accomReports, ({ one }) => ({
  student: one(users, {
    fields: [accomReports.studentId],
    references: [users.id],
  }),
  assignment: one(internAssignments, {
    fields: [accomReports.assignmentId],
    references: [internAssignments.id],
  }),
  reviewer: one(users, {
    fields: [accomReports.reviewerId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  student: one(users, {
    fields: [tasks.studentId],
    references: [users.id],
  }),
  supervisor: one(users, {
    fields: [tasks.supervisorId],
    references: [users.id],
  }),
  assignment: one(internAssignments, {
    fields: [tasks.assignmentId],
    references: [internAssignments.id],
  }),
}));

export const requirementsRelations = relations(requirements, ({ one }) => ({
  student: one(users, {
    fields: [requirements.studentId],
    references: [users.id],
  }),
  assignment: one(internAssignments, {
    fields: [requirements.assignmentId],
    references: [internAssignments.id],
  }),
  type: one(requirementTypes, {
    fields: [requirements.typeId],
    references: [requirementTypes.id],
  }),
}));

export const siteVisitsRelations = relations(siteVisits, ({ one }) => ({
  coordinator: one(users, {
    fields: [siteVisits.coordinatorId],
    references: [users.id],
  }),
  student: one(users, {
    fields: [siteVisits.studentId],
    references: [users.id],
  }),
  hte: one(htes, {
    fields: [siteVisits.hteId],
    references: [htes.id],
  }),
}));

export const evaluationsRelations = relations(evaluations, ({ one, many }) => ({
  evaluator: one(users, {
    fields: [evaluations.evaluatorId],
    references: [users.id],
  }),
  assignment: one(internAssignments, {
    fields: [evaluations.assignmentId],
    references: [internAssignments.id],
  }),
  scores: many(evaluationScores),
}));

export const evaluationScoresRelations = relations(evaluationScores, ({ one }) => ({
  evaluation: one(evaluations, {
    fields: [evaluationScores.evaluationId],
    references: [evaluations.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));
