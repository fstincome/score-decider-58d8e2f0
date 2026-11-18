import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JuryScore — Notation et classement par jury" },
      {
        name: "description",
        content: "JuryScore : les jurés notent, l'app combine les notes et classe les équipes en direct.",
      },
      { property: "og:title", content: "JuryScore — Notation et classement par jury" },
      {
        property: "og:description",
        content: "Chaque compétition a son lien privé de classement en direct.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-background px-6">
      <div className="max-w-md space-y-5 text-center">
        <Trophy className="mx-auto h-12 w-12 text-[color:var(--gold)]" />
        <h1 className="text-3xl font-bold tracking-tight">JuryScore</h1>
        <p className="text-sm text-muted-foreground">
          Le classement de chaque compétition est accessible uniquement via le lien
          privé partagé par son président.
        </p>
        <Link to="/login">
          <Button size="lg">
            <ClipboardList className="mr-2 h-4 w-4" /> Espace jury / admin
          </Button>
        </Link>
      </div>
    </div>
  );
}
