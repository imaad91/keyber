"use client";

import { useRouter } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { Button } from "@/components/ui/button";
import { examplePersonnages, livreNovacier } from "@/lib/mock";
import type { CharacterVisualId } from "@/lib/characterStyle";
import { setSelectedPersonnageId, useGameStore } from "@/lib/store";

export function Organigramme({ paper = false }: { paper?: boolean }) {
  const router = useRouter();
  const { gameState } = useGameStore();

  const people = livreNovacier.organigramme
    .map((o) => examplePersonnages.find((p) => p.id === o.personnageId))
    .filter(Boolean);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {people.map((p) => {
        if (!p) return null;
        const trust = gameState.relations[p.id] ?? p.relationConfiance;
        const id = p.id as CharacterVisualId;
        return (
          <CharacterCard
            key={p.id}
            id={id}
            trust={trust}
            momentLine={p.phrase}
            roleOverride={p.role}
            paper={paper}
            action={
              <Button
                size="sm"
                variant={paper ? "erp" : "outline"}
                className="w-full"
                onClick={() => {
                  setSelectedPersonnageId(p.id);
                  router.push("/play?action=interview");
                }}
              >
                <MessagesSquare className="h-3.5 w-3.5" />
                Aller interviewer
              </Button>
            }
          />
        );
      })}
    </div>
  );
}
