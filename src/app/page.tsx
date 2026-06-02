import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="p-10">

      <h1 className="text-4xl font-bold">
        PlacementPrep AI
      </h1>

      <p className="mt-4 text-muted-foreground">
        Upload your resume and prepare smarter.
      </p>

      <Button className="mt-6">
        Get Started
      </Button>

    </main>
  );
}