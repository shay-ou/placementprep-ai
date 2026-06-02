"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

// Hardcoded for now — AI will generate these later
const FAKE_QUESTIONS = [
    "Tell me about yourself and your experience with full stack development.",
    "Describe a challenging project you worked on. What was your role?",
    "How do you approach debugging a complex issue in production?",
];

export default function InterviewPage() {

    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [allAnswers, setAllAnswers] = useState<string[]>([]);

    function handleNext() {
        if (!answer.trim()) {
            alert("Please write an answer first");
            return;
        }

        // Save this answer
        const updatedAnswers = [...allAnswers, answer];
        setAllAnswers(updatedAnswers);
        setAnswer(""); // clear textarea

        if (currentIndex + 1 < FAKE_QUESTIONS.length) {
            // Move to next question
            setCurrentIndex(currentIndex + 1);
        } else {
            // All questions done → go to results
            router.push("/results");
        }
    }

    return (
        <main className="max-w-2xl mx-auto px-4 py-12">

            {/* Progress indicator */}
            <p className="text-sm text-gray-400 mb-2">
                Question {currentIndex + 1} of {FAKE_QUESTIONS.length}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
                <div
                    className="bg-black h-1.5 rounded-full transition-all"
                    style={{ width: `${((currentIndex + 1) / FAKE_QUESTIONS.length) * 100}%` }}
                />
            </div>

            {/* Question */}
            <h2 className="text-xl font-semibold mb-6">
                {FAKE_QUESTIONS[currentIndex]}
            </h2>

            {/* Answer input */}
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
                {currentIndex + 1 === FAKE_QUESTIONS.length ? "See Results →" : "Next Question →"}
            </button>

        </main>
    );
}