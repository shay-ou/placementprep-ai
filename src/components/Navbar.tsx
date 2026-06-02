import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-8 py-4 border-b bg-white">

            {/* Logo on the left*/}
            <Link href="/" className="font-bold text-xl text-black">
                PlacementPrep AI
            </Link>

            {/* Link on the right*/}
            <div className="flex gap-6 text-sm text-gray-600">
                <Link href="/upload" className="hover:text-black transitions-colors">
                    Upload
                </Link>
                <Link href="/interview" className="hover:text-black transition-colors">

                    Interview
                </Link>

                <Link href="/results" className="hover:text-black transition-colors">
                    Results
                </Link>

            </div>

        </nav>
    );
}