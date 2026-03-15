import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useContentPillars } from "@/hooks/useContentPillars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Check, Loader2, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";

const PILLAR_COLORS = ["#3B8BD4", "#639922", "#BA7517", "#D85A30", "#7F77DD", "#1D9E75"];

interface EditablePillar {
  pillar_name: string;
  pillar_description: string;
  is_active: boolean;
  color: string;
}

export function ContentPillarSetup() {
  const { profile } = useAuth();
  const { pillars, isLoading, isSuggesting, suggestPillars, savePillars } = useContentPillars();
  const [editingPillars, setEditingPillars] = useState<EditablePillar[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!pillars.length) return;

    setEditingPillars(
      pillars.map((pillar, index) => ({
        pillar_name: pillar.pillar_name,
        pillar_description: pillar.pillar_description || "",
        is_active: pillar.is_active,
        color: pillar.color || PILLAR_COLORS[index] || PILLAR_COLORS[0],
      }))
    );
  }, [pillars]);

  const canSuggest = useMemo(() => Boolean(profile?.primary_niche?.trim()), [profile?.primary_niche]);

  const handleSuggest = async () => {
    if (!canSuggest) {
      toast({ title: "Set your primary niche first", description: "Add it in Profile to generate relevant pillars." });
      return;
    }

    const result = await suggestPillars(profile?.primary_niche || "", profile?.brand_tone || "relatable");
    if (result.error || !result.pillars) {
      toast({ title: "Could not suggest pillars", description: result.error || "Try again", variant: "destructive" });
      return;
    }

    const next = result.pillars
      .slice(0, 6)
      .map((pillar: any, index: number) => ({
        pillar_name: String(pillar.name || "").trim(),
        pillar_description: String(pillar.description || "").trim(),
        is_active: true,
        color: PILLAR_COLORS[index] || PILLAR_COLORS[0],
      }))
      .filter((pillar: EditablePillar) => pillar.pillar_name.length > 0);

    setEditingPillars(next);
    toast({ title: "Pillars suggested", description: "Review and save them." });
  };

  const handleAdd = () => {
    if (editingPillars.length >= 6) {
      toast({ title: "Limit reached", description: "You can have up to 6 pillars." });
      return;
    }

    setEditingPillars((prev) => [
      ...prev,
      {
        pillar_name: "",
        pillar_description: "",
        is_active: true,
        color: PILLAR_COLORS[prev.length] || PILLAR_COLORS[0],
      },
    ]);
  };

  const handleSave = async () => {
    const cleaned = editingPillars
      .map((pillar) => ({
        ...pillar,
        pillar_name: pillar.pillar_name.trim(),
        pillar_description: pillar.pillar_description.trim(),
      }))
      .filter((pillar) => pillar.pillar_name.length > 0)
      .slice(0, 6);

    if (!cleaned.length) {
      toast({ title: "Add at least one pillar", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const { error } = await savePillars(cleaned);
    setIsSaving(false);

    if (error) {
      toast({ title: "Failed to save pillars", description: String(error.message || error), variant: "destructive" });
      return;
    }

    toast({ title: "Pillars saved", description: "Your Content OS can now balance output by pillar." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Content Pillars</CardTitle>
        <CardDescription>
          Define 1–6 pillars your daily content should rotate across for better audience balance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSuggest} disabled={!canSuggest || isSuggesting || isLoading}>
            {isSuggesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            Suggest pillars
          </Button>
          <Button variant="ghost" size="sm" onClick={handleAdd} disabled={editingPillars.length >= 6}>
            <Plus className="h-3.5 w-3.5" />
            Add pillar
          </Button>
          <Badge variant="secondary">{editingPillars.length}/6</Badge>
        </div>

        {editingPillars.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
            Start with AI suggestions or add your first pillar manually.
          </div>
        ) : (
          <div className="space-y-3">
            {editingPillars.map((pillar, index) => (
              <div key={`${pillar.pillar_name}-${index}`} className="rounded-lg border border-border bg-card p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pillar.color }} aria-hidden />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={pillar.pillar_name}
                      onChange={(event) => {
                        const next = [...editingPillars];
                        next[index] = { ...next[index], pillar_name: event.target.value };
                        setEditingPillars(next);
                      }}
                      placeholder={`Pillar ${index + 1} name`}
                    />
                    <Input
                      value={pillar.pillar_description}
                      onChange={(event) => {
                        const next = [...editingPillars];
                        next[index] = { ...next[index], pillar_description: event.target.value };
                        setEditingPillars(next);
                      }}
                      placeholder="What kind of content belongs in this pillar?"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingPillars((prev) => prev.filter((_, idx) => idx !== index))}
                    aria-label="Remove pillar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button variant="viral" onClick={handleSave} disabled={isSaving || isLoading || editingPillars.length === 0}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save pillars
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Tip: keep pillars distinct so each daily batch covers different angles.
        </p>
      </CardContent>
    </Card>
  );
}
