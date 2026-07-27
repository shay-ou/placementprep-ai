"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function InterviewPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<string[]>([]);
    const [questionIds, setQuestionIds] = useState<string[]>([]);
    const [interviewId, setInterviewId] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function generateQuestions() {
            const resume = localStorage.getItem("resume");
            const jobDescription = localStorage.getItem("jobDescription");

            if (!resume || !jobDescription) {
                router.push("/upload");
                return;
            }

            try {
                const response = await fetch("/api/generate-questions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resume, jobDescription }),
                });

                const data = await response.json();

                if (data.error) {
                    setError("Failed to generate questions. Please try again.");
                    return;
                }

                setQuestions(data.questions);
                setInterviewId(data.interviewId);
                localStorage.setItem("interviewId", data.interviewId);

                const { data: savedQuestions } = await supabase
                    .from("interview_questions")
                    .select("id")
                    .eq("interview_id", data.interviewId)
                    .order("sort_order", { ascending: true });

                if (savedQuestions) {
                    setQuestionIds(savedQuestions.map((q) => q.id));
                }

            } catch (err) {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        generateQuestions();
    }, []);

    async function handleNext() {
        if (!answer.trim()) {
            alert("Please write an answer first");
            return;
        }

        await supabase
            .from("interview_questions")
            .update({ user_answer: answer })
            .eq("id", questionIds[currentIndex]);

        setAnswer("");

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            await supabase
                .from("interviews")
                .update({ status: "completed" })
                .eq("id", interviewId);

            router.push("/results");
        }
    }

    if (loading) {
        return (
            <main className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Generating your questions...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={() => router.push("/upload")} className="text-sm underline">
                    Go back and try again
                </button>
            </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto px-4 py-12">
            <p className="text-sm text-gray-400 mb-2">
                Question {currentIndex + 1} of {questions.length}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
                <div
                    className="bg-black h-1.5 rounded-full transition-all"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>
            <h2 className="text-xl font-semibold mb-6">
                {questions[currentIndex]}
            </h2>
            <textarea
                className="w-full h-40 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black mb-6"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
            />
            <button
                onClick={handleNext}
                className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors w-full"
            >
                {currentIndex + 1 === questions.length ? "See Results →" : "Next Question →"}
            </button>
        </main>
    );
}