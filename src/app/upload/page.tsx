"use client"  // needed because we're using useState

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {

    const router = useRouter();

    // These store whatever the user types
    const [resume, setResume] = useState("");
    const [jobDescription, setJobDescription] = useState("");

    function handleSubmit() {
        // Don't proceed if either field is empty
        if (!resume || !jobDescription) {
            alert("Please fill in both fields");
            return;
        }

        // For now just log it — we'll send to AI later
        console.log("Resume:", resume);
        console.log("JD:", jobDescription);

        // Navigate to interview page
        router.push("/interview");
    }

    return (
        <main className="max-w-3xl mx-auto px-4 py-12">

            <h1 className="text-3xl font-bold mb-2">Upload Your Details</h1>
            <p className="text-gray-500 mb-8">
                Paste your resume and the job description below
            </p>

            {/* Resume input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Resume
                </label>
                <textarea
                    className="w-full h-48 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Paste your resume text here..."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                />
            </div>

            {/* Job description input */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                </label>
                <textarea
                    className="w-full h-48 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />
            </div>

            <button
                onClick={handleSubmit}
                className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors w-full"
            >
                Generate Interview Questions →
            </button>

        </main>
    );
}