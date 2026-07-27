import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { interviewId } = await req.json();

        // Fetch all questions + answers from Supabase
        const { data: questionRows, error: fetchError } = await supabase
            .from("interview_questions")
            .select("*")
            .eq("interview_id", interviewId)
            .order("sort_order", { ascending: true });

        if (fetchError) throw fetchError;
        if (!questionRows || questionRows.length === 0) {
            return NextResponse.json({ error: "No questions found" }, { status: 404 });
        }

        const qaPairs = questionRows.map((row, i) =>
            `Question ${i + 1}: ${row.question_text}\nAnswer ${i + 1}: ${row.user_answer || "No answer provided"}`
        ).join("\n\n");

        const prompt = `
You are an expert interview coach evaluating a candidate's mock interview answers.

Below are the questions asked and the candidate's answers:

${qaPairs}

For EACH question-answer pair, provide:
- "score": a number from 1-10
- "strength": one specific thing they did well (1 sentence)
- "improvement": one specific thing to improve (1 sentence)

Return ONLY a JSON array with exactly ${questionRows.length} objects, in this exact format:
[
  { "score": 7, "strength": "...", "improvement": "..." }
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
        const feedback: { score: number; strength: string; improvement: string }[] = JSON.parse(cleaned);

        // Save feedback back to each question row in Supabase
        for (let i = 0; i < questionRows.length; i++) {
            await supabase
                .from("interview_questions")
                .update({
                    score: feedback[i].score,
                    strength: feedback[i].strength,
                    improvement: feedback[i].improvement,
                })
                .eq("id", questionRows[i].id);
        }

        return NextResponse.json({
            questions: questionRows.map(r => r.question_text),
            answers: questionRows.map(r => r.user_answer),
            feedback,
        });

    } catch (error) {
        console.error("Feedback error:", error);
        return NextResponse.json(
            { error: "Failed to generate feedback" },
            { status: 500 }
        );
    }
}