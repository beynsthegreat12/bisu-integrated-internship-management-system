import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { accomReports } from "@db/schema";
import { eq } from "drizzle-orm";

export const uploadRouter = createRouter({
  // Generate a presigned URL or just save file path
  saveFilePath: authedQuery
    .input(
      z.object({
        reportId: z.number().optional(),
        filePath: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // If reportId is provided, update the report's filePath
      if (input.reportId) {
        await db.update(accomReports)
          .set({ filePath: input.filePath })
          .where(eq(accomReports.id, input.reportId));
      }

      return { success: true, filePath: input.filePath };
    }),
});