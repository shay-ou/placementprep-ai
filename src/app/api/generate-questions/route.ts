import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { resume, jobDescription } = await req.json();

        const prompt = `
You are an expert technical interviewer. 

A candidate has applied for a role. Based on their resume and the job description below, generate exactly 5 interview questions.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
- Mix technical questions with behavioural ones
- Make questions specific to their actual experience (mention their projects/skills)
- Questions should get progressively harder
- Return ONLY a JSON array of 5 strings, nothing else
- Example format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const text = response.choices[0]?.message?.content || "";
        const cleaned = text.replace(/```json|```/g, "").trim();
        const questions: string[] = JSON.parse(cleaned);

        // Save interview session to Supabase
        const { data: interview, error: interviewError } = await supabase
            .from("interviews")
            .insert({ resume, job_description: jobDescription })
            .select()
            .single();

        if (interviewError) {
            console.error("Supabase insert error:", interviewError);
            throw interviewError;
        }

        // Save each question linked to this session
        const questionRows = questions.map((q, index) => ({
            interview_id: interview.id,
            question_text: q,
            sort_order: index,
        }));

        const { error: questionsError } = await supabase
            .from("interview_questions")
            .insert(questionRows);

        if (questionsError) {
            console.error("Supabase questions error:", questionsError);
            throw questionsError;
        }

        return NextResponse.json({ questions, interviewId: interview.id });

    } catch (error) {
        console.error("Groq error:", error);
        return NextResponse.json(
            { error: "Failed to generate questions" },
            { status: 500 }
        );
    }
}