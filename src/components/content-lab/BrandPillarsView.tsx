import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Brain, Target, TrendingUp, Heart, DollarSign, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BrandPillar {
  id: string;
  pillar_name: string;
  pillar_order: number;
  purpose: string | null;
  audience_need: string | null;
  psychology_trigger: string | null;
  example_formats: string[] | null;
}

interface BrandPillarsViewProps {
  calendarId: string;
  niche: string;
  goal: string;
  audienceLevel: string;
  unhingedMode: boolean;
  pillars: BrandPillar[];
  onPillarsGenerated: (pillars: BrandPillar[]) => void;
  onContinue: () => void;
}

const pillarIcons: Record<string, any> = {
  "authority": Brain,
  "expertise": Brain,
  "viral": TrendingUp,
  "discovery": TrendingUp,
  "relatability": Heart,
  "identity": Heart,
  "education": Target,
  "conversion": DollarSign,
  "sales": DollarSign,
};

const getPillarIcon = (name: string) => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(pillarIcons)) {
    if (lower.includes(key)) return icon;
  }
  return Sparkles;
};

const pillarColors = [
  "from-primary/20 to-primary/5 border-primary/30",
  "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  "from-orange-500/20 to-orange-500/5 border-orange-500/30",
  "from-green-500/20 to-green-500/5 border-green-500/30",
];

export function BrandPillarsView({
  calendarId,
  niche,
  goal,
  audienceLevel,
  unhingedMode,
  pillars,
  onPillarsGenerated,
  onContinue,
}: BrandPillarsViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePillars = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_pillars",
          calendarId,
          niche,
          goal,
          audienceLevel,
          unhingedMode,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      onPillarsGenerated(data.pillars);
      toast({
        title: "🧠 Brand Pillars Generated!",
        description: `${data.pillars.length} strategic pillars created for your brand.`,
      });
    } catch (error) {
      console.error("Generate pillars error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate pillars",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (pillars.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-background to-orange-500/5 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 rounded-2xl bg-primary/10 w-fit mb-4">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Brand Content Pillars</CardTitle>
          <CardDescription className="text-base max-w-lg mx-auto">
            Before generating content, let's define your brand's strategic pillars. 
            These pillars balance Growth, Trust, Retention, and Monetization.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="outline">🎯 Authority</Badge>
            <Badge variant="outline">💥 Viral Discovery</Badge>
            <Badge variant="outline">🧍 Relatability</Badge>
            <Badge variant="outline">📚 Education</Badge>
            <Badge variant="outline">💰 Conversion</Badge>
          </div>
          <Button 
            variant="viral" 
            size="lg" 
            onClick={generatePillars}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating Pillars...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate My Brand Pillars
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            "Plan your brand like a strategist. Generate content like a machine."
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Your Brand Content Pillars</h2>
        <p className="text-muted-foreground">
          These pillars will guide your content strategy across all days.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar, index) => {
          const Icon = getPillarIcon(pillar.pillar_name);
          const colorClass = pillarColors[index % pillarColors.length];

          return (
            <Card 
              key={pillar.id} 
              className={`bg-gradient-to-br ${colorClass} hover:shadow-lg transition-all`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-background/50">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pillar.pillar_name}</CardTitle>
                    {pillar.psychology_trigger && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        🧠 {pillar.psychology_trigger}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pillar.purpose && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Purpose</p>
                    <p className="text-sm">{pillar.purpose}</p>
                  </div>
                )}
                {pillar.audience_need && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Audience Need</p>
                    <p className="text-sm">{pillar.audience_need}</p>
                  </div>
                )}
                {pillar.example_formats && pillar.example_formats.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Formats</p>
                    <div className="flex flex-wrap gap-1">
                      {pillar.example_formats.slice(0, 3).map((format, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="viral" size="lg" onClick={onContinue}>
          Continue to Mind Map
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
