import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { questions, answers } = await req.json();

        // Build a single prompt with all Q&A pairs
        const qaPairs = questions.map((q: string, i: number) =>
            `Question ${i + 1}: ${q}\nAnswer ${i + 1}: ${answers[i]}`
        ).join("\n\n");

        const prompt = `
You are an expert interview coach evaluating a candidate's mock interview answers.

Below are the questions asked and the candidate's answers:

${qaPairs}

For EACH question-answer pair, provide:
- "score": a number from 1-10
- "strength": one specific thing they did well (1 sentence)
- "improvement": one specific thing to improve (1 sentence)

Return ONLY a JSON array with exactly ${questions.length} objects, in this exact format:
[
  { "score": 7, "strength": "...", "improvement": "..." },
  ...
]

No markdown, no extra text, just the JSON array.
`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });

        const text = response.choices[0]?.message?.content || "";
        const cleaned = text.replace(/```json|```/g, "").trim();
        const feedback = JSON.parse(cleaned);

        return NextResponse.json({ feedback });

    } catch (error) {
        console.error("Feedback error:", error);
        return NextResponse.json(
            { error: "Failed to generate feedback" },
            { status: 500 }
        );
    }
}