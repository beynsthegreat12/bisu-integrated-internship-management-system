import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { evaluations } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateGeminiSummary } from "./gemini/index";

export const geminiRouter = createRouter({
  // Generate AI summary for an evaluation's comments
  summarizeFeedback: authedQuery
    .input(
      z.object({
        evaluationId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get evaluation
      const evaluation = await db.query.evaluations.findFirst({
        where: eq(evaluations.id, input.evaluationId),
      });

      if (!evaluation) {
        throw new Error("Evaluation not found");
      }

      const comments = evaluation.comments || "";

      // Use GEMINI_API_KEY from env
      const apiKey = process.env.GEMINI_API_KEY || "";

      const summary = await generateGeminiSummary(comments, apiKey);

      // Save summary to evaluation
      await db.update(evaluations)
        .set({ aiSummary: summary })
        .where(eq(evaluations.id, input.evaluationId));

      return { success: true, summary };
    }),

  // Auto-summarize all evaluations without AI summary
  autoSummarize: authedQuery.mutation(async () => {
    const db = getDb();
    const apiKey = process.env.GEMINI_API_KEY || "";

    if (!apiKey) {
      return { success: false, message: "No Gemini API key configured" };
    }

    const pendingEvals = await db.query.evaluations.findMany({
      where: eq(evaluations.aiSummary, null as any),
    });

    let summarized = 0;
    for (const ev of pendingEvals) {
      if (ev.comments) {
        try {
          const summary = await generateGeminiSummary(ev.comments, apiKey);
          await db.update(evaluations)
            .set({ aiSummary: summary })
            .where(eq(evaluations.id, ev.id));
          summarized++;
        } catch {
          console.error(`Failed to summarize evaluation #${ev.id}`);
        }
      }
    }

    return { success: true, summarized, total: pendingEvals.length };
  }),
});