const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

type GeminiResponse = {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
};

export async function generateGeminiSummary(
  comments: string,
  apiKey: string,
): Promise<string> {
  if (!apiKey) {
    return "AI Summary unavailable: No API key configured.";
  }

  if (!comments || comments.trim().length === 0) {
    return "No feedback to summarize.";
  }

  const prompt = `
You are an AI assistant for the BISU Internship Management System.
Summarize the following supervisor feedback/evaluation comments concisely.
Highlight key strengths and areas for improvement.
Keep the summary to 2-3 sentences only.

FEEDBACK:
${comments}

SUMMARY:
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Gemini] API error:", errorText);
      return "AI Summary temporarily unavailable.";
    }

    const data = (await response.json()) as GeminiResponse;
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return summary || "No summary generated.";
  } catch (error) {
    console.error("[Gemini] Error:", error);
    return "AI Summary failed due to a network error.";
  }
}