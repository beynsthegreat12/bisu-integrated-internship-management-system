import { authRouter } from "./auth-router";
import { userRouter } from "./user-router";
import { attendanceRouter } from "./attendance-router";
import { reportRouter } from "./report-router";
import { taskRouter } from "./task-router";
import { evaluationRouter } from "./evaluation-router";
import { messageRouter } from "./message-router";
import { siteVisitRouter } from "./sitevisit-router";
import { hteRouter } from "./hte-router";
import { assignmentRouter } from "./assignment-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  user: userRouter,
  attendance: attendanceRouter,
  report: reportRouter,
  task: taskRouter,
  evaluation: evaluationRouter,
  message: messageRouter,
  siteVisit: siteVisitRouter,
  hte: hteRouter,
  assignment: assignmentRouter,
});

export type AppRouter = typeof appRouter;
