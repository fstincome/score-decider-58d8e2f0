import { ChevronRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Competition } from "@/lib/scoring";

export function RevealSettingsCard({ competition, teamCount }: { competition: Competition; teamCount: number }) {
  const order = competition.reveal_order ?? "best_first";
  const mode = competition.reveal_mode ?? "all";
  const count = competition.reveal_count ?? null;
  const step = competition.reveal_step ?? 0;
  const total = count && count > 0 ? Math.min(count, teamCount) : teamCount;

  const save = async (patch: { reveal_order?: string; reveal_mode?: string; reveal_count?: number | null; reveal_step?: number }) => {
    const { error } = await supabase.from("competitions").update(patch).eq("id", competition.id);
    if (error) toast.error("Erreur : " + error.message);
  };

  const Opt = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <Button size="sm" variant={active ? "default" : "outline"} onClick={onClick}>{children}</Button>
  );

  return (
    <Card className="space-y-4 p-4">
      <div>
        <h2 className="text-sm font-semibold">Proclamation des résultats</h2>
        <p className="text-xs text-muted-foreground">
          Ces réglages s'appliquent au lien du classement une fois la compétition clôturée.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Nombre d'équipes à proclamer</Label>
          <Input
            type="number"
            min={1}
            max={teamCount || undefined}
            placeholder={`Toutes (${teamCount})`}
            value={count ?? ""}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              save({ reveal_count: isNaN(v) || v <= 0 ? null : v, reveal_step: 0 });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Ordre</Label>
          <div className="flex flex-wrap gap-2">
            <Opt active={order === "best_first"} onClick={() => save({ reveal_order: "best_first", reveal_step: 0 })}>Du 1er au dernier</Opt>
            <Opt active={order === "last_first"} onClick={() => save({ reveal_order: "last_first", reveal_step: 0 })}>Du dernier au 1er</Opt>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Affichage</Label>
          <div className="flex flex-wrap gap-2">
            <Opt active={mode === "all"} onClick={() => save({ reveal_mode: "all" })}>En une fois</Opt>
            <Opt active={mode === "one"} onClick={() => save({ reveal_mode: "one", reveal_step: 0 })}>Un par un</Opt>
          </div>
        </div>
      </div>
      {mode === "one" && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 p-3">
          <span className="text-sm">
            Révélées : <strong>{Math.min(step, total)}</strong> / {total}
          </span>
          <Button
            size="sm"
            disabled={!competition.locked || step >= total}
            onClick={() => save({ reveal_step: step + 1 })}
          >
            Révéler la suivante <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => save({ reveal_step: 0 })}>
            <RotateCcw className="mr-1 h-4 w-4" /> Recommencer
          </Button>
          {!competition.locked && (
            <span className="text-xs text-muted-foreground">Clôturez d'abord la compétition pour révéler.</span>
          )}
        </div>
      )}
    </Card>
  );
}
