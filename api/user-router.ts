import { z } from "zod";
import { createRouter, authedQuery, coordinatorQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq, and, like, or } from "drizzle-orm";

export const userRouter = createRouter({
  list: coordinatorQuery
    .input(
      z.object({
        role: z.string().optional(),
        collegeId: z.number().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      
      if (input?.role) {
        conditions.push(eq(users.role, input.role as any));
      }
      if (input?.collegeId) {
        conditions.push(eq(users.collegeId, input.collegeId));
      }
      if (input?.search) {
        conditions.push(or(
          like(users.name, `%${input.search}%`),
          like(users.email, `%${input.search}%`)
        ));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      
      return db.query.users.findMany({
        where,
        with: {
          college: true,
        },
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.users.findFirst({
        where: eq(users.id, input.id),
        with: {
          college: true,
        },
      });
    }),

  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().optional(),
        phoneNum: z.string().optional(),
        collegeId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(users)
        .set({
          name: input.name,
          phoneNum: input.phoneNum,
          collegeId: input.collegeId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  updateRole: adminQuery
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["student", "coordinator", "supervisor", "sipp_coordinator", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  stats: authedQuery.query(async () => {
    const db = getDb();
    const allUsers = await db.select().from(users);
    
    return {
      total: allUsers.length,
      students: allUsers.filter(u => u.role === "student").length,
      coordinators: allUsers.filter(u => u.role === "coordinator").length,
      supervisors: allUsers.filter(u => u.role === "supervisor").length,
      sippCoordinators: allUsers.filter(u => u.role === "sipp_coordinator").length,
    };
  }),
});
