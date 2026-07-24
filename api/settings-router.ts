import { z } from "zod";
import { createRouter, adminQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { systemSettings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  // Get all settings (admin only)
  getAll: adminQuery.query(async () => {
    const db = getDb();
    const settings = await db.query.systemSettings.findMany();
    return settings;
  }),

  // Get a single setting by key
  getByKey: authedQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const setting = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, input.key),
      });
      return setting;
    }),

  // Get multiple settings by keys
  getMultiple: authedQuery
    .input(z.object({ keys: z.array(z.string()) }))
    .query(async ({ input }) => {
      const db = getDb();
      const results: Record<string, string> = {};
      for (const key of input.keys) {
        const setting = await db.query.systemSettings.findFirst({
          where: eq(systemSettings.key, key),
        });
        if (setting) results[key] = setting.value || "";
      }
      return results;
    }),

  // Update a setting (admin only)
  update: adminQuery
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Upsert: insert if not exists, update if exists
      const existing = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, input.key),
      });

      if (existing) {
        await db.update(systemSettings)
          .set({ value: input.value, updatedAt: new Date() })
          .where(eq(systemSettings.key, input.key));
      } else {
        await db.insert(systemSettings).values({
          key: input.key,
          value: input.value,
        });
      }

      return { success: true };
    }),

  // Batch update settings (admin only)
  batchUpdate: adminQuery
    .input(
      z.object({
        settings: z.array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      for (const s of input.settings) {
        const existing = await db.query.systemSettings.findFirst({
          where: eq(systemSettings.key, s.key),
        });

        if (existing) {
          await db.update(systemSettings)
            .set({ value: s.value, updatedAt: new Date() })
            .where(eq(systemSettings.key, s.key));
        } else {
          await db.insert(systemSettings).values({
            key: s.key,
            value: s.value,
          });
        }
      }

      return { success: true, count: input.settings.length };
    }),
});