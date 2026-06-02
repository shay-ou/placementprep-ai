import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h[80vh] text-center px-4">

      <h1 className="text-5xl font-bold text-black mb-4">
        Ace Your Next Interview
      </h1>
      <p className="text-gray-500 text-lg max-w-xl mb-8">
        Upload your resume and job description. Get AI-generated interview questions
        tailored to the role , practice your answers , and receive
        detailed feedback.
      </p>

      <Link
        href="/upload"
        className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">

        Get Started →
      </Link>
    </main>
  );
}