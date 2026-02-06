import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ChevronDown, ChevronRight, Zap, MessageSquare, TrendingUp, Target, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface BrandPillar {
  id: string;
  pillar_name: string;
  pillar_order: number;
  purpose: string | null;
}

interface ContentIdea {
  id: string;
  day_number: number;
  idea_order: number;
  idea_title: string;
  idea_type: string;
  intent: string;
  psychology_hint: string | null;
  generated_content: string | null;
  status: string;
  pillar_id: string | null;
}

interface MindMapViewProps {
  calendarId: string;
  niche: string;
  unhingedMode: boolean;
  pillars: BrandPillar[];
  ideas: ContentIdea[];
  onIdeasGenerated: () => void;
  onIdeaClick: (idea: ContentIdea, pillar: BrandPillar | null) => void;
}

const intentIcons: Record<string, any> = {
  reach: TrendingUp,
  replies: MessageSquare,
  bookmarks: Target,
  sales: Zap,
  authority: Brain,
};

const intentColors: Record<string, string> = {
  reach: "text-green-400",
  replies: "text-blue-400",
  bookmarks: "text-purple-400",
  sales: "text-yellow-400",
  authority: "text-primary",
};

export function MindMapView({
  calendarId,
  niche,
  unhingedMode,
  pillars,
  ideas,
  onIdeasGenerated,
  onIdeaClick,
}: MindMapViewProps) {
  const { profile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);

  const isPaidUser = profile?.tier === "pro" || profile?.tier === "elite";
  const maxDays = isPaidUser ? 7 : 3;

  const generateMindMap = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_mind_map",
          calendarId,
          pillars,
          niche,
          daysToGenerate: maxDays,
          unhingedMode,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      onIdeasGenerated();
      toast({
        title: "🗺️ Mind Map Generated!",
        description: `${data.days} days with ${data.totalIdeas} content ideas ready.`,
      });
    } catch (error) {
      console.error("Generate mind map error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate mind map",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Group ideas by day
  const ideasByDay = ideas.reduce((acc, idea) => {
    if (!acc[idea.day_number]) acc[idea.day_number] = [];
    acc[idea.day_number].push(idea);
    return acc;
  }, {} as Record<number, ContentIdea[]>);

  const days = Object.keys(ideasByDay).map(Number).sort((a, b) => a - b);

  const getPillarForIdea = (pillarId: string | null) => {
    return pillars.find(p => p.id === pillarId) || null;
  };

  if (ideas.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 via-background to-purple-500/5 border-blue-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 rounded-2xl bg-blue-500/10 w-fit mb-4">
            <Sparkles className="h-10 w-10 text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Content Mind Map</CardTitle>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Generate a strategic mind map of content ideas across your pillars.
            Each day focuses on one pillar with 5-10 tweet ideas.
          </p>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <div className="mb-6 p-4 rounded-lg bg-secondary/30 max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mb-2">Your {maxDays}-day plan will include:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {pillars.map((pillar, i) => (
                <Badge key={pillar.id} variant="outline" className="text-xs">
                  Day {(i % maxDays) + 1}: {pillar.pillar_name}
                </Badge>
              ))}
            </div>
          </div>
          <Button 
            variant="viral" 
            size="lg" 
            onClick={generateMindMap}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating Mind Map...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate {maxDays}-Day Mind Map
              </>
            )}
          </Button>
          {!isPaidUser && (
            <p className="text-xs text-muted-foreground mt-4">
              🔒 Free: 3 days • Pro: Up to 30 days
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Content Mind Map</h2>
          <p className="text-sm text-muted-foreground">
            Click any idea to generate the full tweet
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {ideas.length} ideas across {days.length} days
        </Badge>
      </div>

      <div className="space-y-3">
        {days.map((dayNum) => {
          const dayIdeas = ideasByDay[dayNum] || [];
          const isExpanded = expandedDays.includes(dayNum);
          const dayPillar = getPillarForIdea(dayIdeas[0]?.pillar_id);
          const generatedCount = dayIdeas.filter(i => i.generated_content).length;

          return (
            <Collapsible key={dayNum} open={isExpanded} onOpenChange={() => toggleDay(dayNum)}>
              <Card className="bg-card/50 overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-lg">
                        D{dayNum}
                      </div>
                      <div>
                        <h3 className="font-semibold">Day {dayNum}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {dayPillar && (
                            <Badge variant="secondary" className="text-xs">
                              {dayPillar.pillar_name}
                            </Badge>
                          )}
                          <span>{dayIdeas.length} ideas</span>
                          {generatedCount > 0 && (
                            <span className="text-green-400">• {generatedCount} generated</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border divide-y divide-border/50">
                    {dayIdeas.sort((a, b) => a.idea_order - b.idea_order).map((idea) => {
                      const IntentIcon = intentIcons[idea.intent] || Target;
                      const intentColor = intentColors[idea.intent] || "text-muted-foreground";
                      const hasContent = !!idea.generated_content;
                      const pillar = getPillarForIdea(idea.pillar_id);

                      return (
                        <button
                          key={idea.id}
                          onClick={() => onIdeaClick(idea, pillar)}
                          className="w-full p-4 text-left hover:bg-secondary/20 transition-colors group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              hasContent 
                                ? "bg-green-500/20 text-green-400" 
                                : "bg-secondary text-muted-foreground"
                            }`}>
                              {hasContent ? "✓" : idea.idea_order}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium group-hover:text-primary transition-colors">
                                  {idea.idea_title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {idea.idea_type.replace("_", " ")}
                                </Badge>
                                <span className={`text-xs flex items-center gap-1 ${intentColor}`}>
                                  <IntentIcon className="h-3 w-3" />
                                  {idea.intent}
                                </span>
                                {idea.psychology_hint && (
                                  <span className="text-xs text-muted-foreground">
                                    🧠 {idea.psychology_hint}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
