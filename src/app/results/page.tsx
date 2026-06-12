"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Feedback {
    score: number;
    strength: string;
    improvement: string;
}

export default function ResultsPage() {
    const router = useRouter();

    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function getFeedback() {
            const storedQuestions = localStorage.getItem("questions");
            const storedAnswers = localStorage.getItem("answers");

            if (!storedQuestions || !storedAnswers) {
                router.push("/upload");
                return;
            }

            const parsedQuestions = JSON.parse(storedQuestions);
            const parsedAnswers = JSON.parse(storedAnswers);

            setQuestions(parsedQuestions);
            setAnswers(parsedAnswers);

            try {
                const response = await fetch("/api/generate-feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questions: parsedQuestions,
                        answers: parsedAnswers
                    }),
                });

                const data = await response.json();

                if (data.error) {
                    setError("Failed to generate feedback. Please try again.");
                    return;
                }

                setFeedback(data.feedback);
            } catch (err) {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        getFeedback();
    }, []);

    function handleRestart() {
        localStorage.removeItem("resume");
        localStorage.removeItem("jobDescription");
        localStorage.removeItem("questions");
        localStorage.removeItem("answers");
        router.push("/upload");
    }

    if (loading) {
        return (
            <main className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Evaluating your answers...</p>
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

    // Calculate overall average score
    const avgScore = feedback.length > 0
        ? (feedback.reduce((sum, f) => sum + f.score, 0) / feedback.length).toFixed(1)
        : "0";

    return (
        <main className="max-w-3xl mx-auto px-4 py-12">

            <h1 className="text-3xl font-bold mb-2">Your Results</h1>
            <p className="text-gray-500 mb-8">
                Overall Score: <span className="font-semibold text-black">{avgScore} / 10</span>
            </p>

            <div className="space-y-6 mb-8">
                {questions.map((question, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-6">

                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-sm flex-1 mr-4">
                                Q{i + 1}: {question}
                            </h3>
                            <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-medium shrink-0">
                                {feedback[i]?.score}/10
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 italic">
                            "{answers[i]}"
                        </p>

                        <div className="space-y-2 text-sm">
                            <p className="text-green-700">
                                <span className="font-medium">✓ Strength: </span>
                                {feedback[i]?.strength}
                            </p>
                            <p className="text-orange-700">
                                <span className="font-medium">→ Improve: </span>
                                {feedback[i]?.improvement}
                            </p>
                        </div>

                    </div>
                ))}
            </div>

            <button
                onClick={handleRestart}
                className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors w-full"
            >
                Start New Interview
            </button>

        </main>
    );
}