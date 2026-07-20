import { z } from "zod";
import { createRouter, authedQuery, coordinatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { htes } from "@db/schema";
import { eq } from "drizzle-orm";

export const hteRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        collegeId: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.collegeId) {
        return db.query.htes.findMany({
          where: eq(htes.collegeId, input.collegeId),
          with: {
            supervisor: true,
            college: true,
          },
        });
      }
      return db.query.htes.findMany({
        with: {
          supervisor: true,
          college: true,
        },
      });
    }),

  create: coordinatorQuery
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        supervisorId: z.number().optional(),
        collegeId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(htes).values({
        name: input.name,
        address: input.address || null,
        supervisorId: input.supervisorId || null,
        collegeId: input.collegeId,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: coordinatorQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        supervisorId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(htes)
        .set(data)
        .where(eq(htes.id, id));
      return { success: true };
    }),
});
