import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "PlacementPrep AI",
  description: "Your AI Interview Coach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>

        <Navbar />

        {children}

      </body>
    </html>
  );
}