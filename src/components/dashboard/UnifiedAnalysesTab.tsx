import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Microscope, Dna, Lightbulb, ArrowRight, RefreshCw, SlidersHorizontal } from "lucide-react";
import { AnalysisCard } from "@/components/dashboard/AnalysisCard";
import { PatternCard } from "@/components/dashboard/PatternCard";
import { IdeaCard } from "@/components/dashboard/IdeaCard";
import type { ViralAnalysis, ViralPattern, IdeaVaultItem } from "@/hooks/useViralMemory";

interface UnifiedAnalysesTabProps {
  analyses: ViralAnalysis[];
  patterns: ViralPattern[];
  ideas: IdeaVaultItem[];
  isLoading: boolean;
  onTogglePin: (id: string) => Promise<{ error: Error | null }>;
  onDeleteAnalysis: (id: string) => Promise<{ error: Error | null }>;
  onDeletePattern: (id: string) => Promise<{ error: Error | null }>;
  onIncrementUsage: (id: string) => Promise<{ error: Error | null }>;
  onUpdateIdeaStatus: (id: string, status: IdeaVaultItem["idea_status"]) => Promise<{ error: Error | null }>;
  onDeleteIdea: (id: string) => Promise<{ error: Error | null }>;
  onExpandToLongForm: (content: string, title: string) => void;
  onRefresh: () => void;
}

const modeNames: Record<number, string> = {
  1: "Hook Analysis", 2: "Psychology", 3: "Extract Pattern", 4: "Generate",
  5: "Forecast", 6: "Rewrite", 7: "Thread", 8: "Ideas", 9: "Brand", 10: "Summary",
};

type FilterType = "all" | "analyses" | "patterns" | "ideas";

export function UnifiedAnalysesTab({
  analyses, patterns, ideas, isLoading,
  onTogglePin, onDeleteAnalysis, onDeletePattern, onIncrementUsage,
  onUpdateIdeaStatus, onDeleteIdea, onExpandToLongForm, onRefresh,
}: UnifiedAnalysesTabProps) {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [ideaStatusFilter, setIdeaStatusFilter] = useState<string>("all");

  const totalCount = analyses.length + patterns.length + ideas.length;

  // Filter analyses
  const filteredAnalyses = analyses.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesText = a.original_post.toLowerCase().includes(q) ||
        a.analysis_result.toLowerCase().includes(q) ||
        (a.identified_hook || "").toLowerCase().includes(q) ||
        (a.viral_pattern || "").toLowerCase().includes(q);
      if (!matchesText) return false;
    }
    if (modeFilter !== "all" && a.mode_used !== Number(modeFilter)) return false;
    return true;
  });

  // Filter patterns
  const filteredPatterns = patterns.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesText = p.pattern_name.toLowerCase().includes(q) ||
        p.pattern_template.toLowerCase().includes(q) ||
        (p.hook_framework || "").toLowerCase().includes(q) ||
        p.best_for_niches.some(n => n.toLowerCase().includes(q));
      if (!matchesText) return false;
    }
    return true;
  });

  // Filter ideas
  const filteredIdeas = ideas.filter((i) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesText = i.idea_title.toLowerCase().includes(q) ||
        (i.idea_content || "").toLowerCase().includes(q) ||
        (i.hook_type || "").toLowerCase().includes(q) ||
        (i.emotion_trigger || "").toLowerCase().includes(q);
      if (!matchesText) return false;
    }
    if (ideaStatusFilter !== "all" && i.idea_status !== ideaStatusFilter) return false;
    return true;
  });

  const showAnalyses = filterType === "all" || filterType === "analyses";
  const showPatterns = filterType === "all" || filterType === "patterns";
  const showIdeas = filterType === "all" || filterType === "ideas";

  if (totalCount === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Microscope className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-2">No saved items yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Analyze a viral tweet to start building your library</p>
          <Button variant="viral" onClick={() => window.dispatchEvent(new CustomEvent("switch-tab", { detail: "analyze" }))}>
            Analyze Your First Tweet <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search analyses, patterns, ideas..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs px-3">
                All <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">{totalCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="analyses" className="text-xs px-3">
                <Microscope className="h-3 w-3 mr-1" /> {analyses.length}
              </TabsTrigger>
              <TabsTrigger value="patterns" className="text-xs px-3">
                <Dna className="h-3 w-3 mr-1" /> {patterns.length}
              </TabsTrigger>
              <TabsTrigger value="ideas" className="text-xs px-3">
                <Lightbulb className="h-3 w-3 mr-1" /> {ideas.length}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Contextual filters */}
      <div className="flex gap-2 flex-wrap">
        {(showAnalyses && (filterType === "analyses" || filterType === "all")) && (
          <Select value={modeFilter} onValueChange={setModeFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SlidersHorizontal className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              {Object.entries(modeNames).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {(showIdeas && (filterType === "ideas" || filterType === "all")) && (
          <Select value={ideaStatusFilter} onValueChange={setIdeaStatusFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SlidersHorizontal className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unused">Unused</SelectItem>
              <SelectItem value="drafted">Drafted</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        )}
        {searchQuery && (
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="h-8 text-xs">
            Clear search
          </Button>
        )}
      </div>

      {/* Analyses */}
      {showAnalyses && filteredAnalyses.length > 0 && (
        <div className="space-y-3">
          {filterType === "all" && (
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Microscope className="h-3.5 w-3.5" /> Analyses ({filteredAnalyses.length})
            </h3>
          )}
          {filteredAnalyses
            .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
            .map(analysis => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onTogglePin={onTogglePin}
                onDelete={onDeleteAnalysis}
                onExpandToLongForm={onExpandToLongForm}
              />
            ))}
        </div>
      )}

      {/* Patterns */}
      {showPatterns && filteredPatterns.length > 0 && (
        <div className="space-y-3">
          {filterType === "all" && (
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mt-4">
              <Dna className="h-3.5 w-3.5" /> Patterns ({filteredPatterns.length})
            </h3>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPatterns.map(pattern => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                onDelete={onDeletePattern}
                onIncrementUsage={onIncrementUsage}
                onExpandToLongForm={onExpandToLongForm}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ideas */}
      {showIdeas && filteredIdeas.length > 0 && (
        <div className="space-y-3">
          {filterType === "all" && (
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mt-4">
              <Lightbulb className="h-3.5 w-3.5" /> Ideas ({filteredIdeas.length})
            </h3>
          )}
          {filteredIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onUpdateStatus={onUpdateIdeaStatus}
              onDelete={onDeleteIdea}
              onExpandToLongForm={onExpandToLongForm}
            />
          ))}
        </div>
      )}

      {/* No results */}
      {showAnalyses && filteredAnalyses.length === 0 && showPatterns && filteredPatterns.length === 0 && showIdeas && filteredIdeas.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No results match your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Refresh */}
      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
