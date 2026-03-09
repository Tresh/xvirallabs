import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, FlaskConical, ArrowRight, Calendar, Flame } from "lucide-react";
import { ContentBankOnboarding } from "./ContentBankOnboarding";
import { BrandPillarsView } from "./BrandPillarsView";
import { MindMapView } from "./MindMapView";
import { TweetWorkspace } from "./TweetWorkspace";
import { format } from "date-fns";

interface ContentBank {
  id: string;
  name: string;
  calendar_length: number;
  primary_niche: string;
  main_goal: string;
  audience_level: string | null;
  unhinged_mode: boolean | null;
  status: string;
  pillars_generated: boolean | null;
  mind_map_generated: boolean | null;
  created_at: string;
}

interface BrandPillar {
  id: string;
  pillar_name: string;
  pillar_order: number;
  purpose: string | null;
  audience_need: string | null;
  psychology_trigger: string | null;
  example_formats: string[] | null;
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
  why_it_works: string | null;
  status: string;
  pillar_id: string | null;
  is_saved_to_vault: boolean;
}

type ViewState = "list" | "onboarding" | "pillars" | "mindmap" | "workspace";

export function ContentLabTab() {
  const { user } = useAuth();
  const [banks, setBanks] = useState<ContentBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewState, setViewState] = useState<ViewState>("list");
  const [activeBank, setActiveBank] = useState<ContentBank | null>(null);
  const [pillars, setPillars] = useState<BrandPillar[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<BrandPillar | null>(null);

  useEffect(() => {
    fetchBanks();
  }, [user]);

  const fetchBanks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_calendars")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "archived")
        .order("created_at", { ascending: false });

      if (data) {
        setBanks(data as unknown as ContentBank[]);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBankDetails = async (bank: ContentBank) => {
    // Fetch pillars
    const { data: pillarData } = await supabase
      .from("brand_pillars")
      .select("*")
      .eq("calendar_id", bank.id)
      .order("pillar_order");

    if (pillarData) {
      setPillars(pillarData as unknown as BrandPillar[]);
    }

    // Fetch ideas
    const { data: ideaData } = await supabase
      .from("content_ideas")
      .select("*")
      .eq("calendar_id", bank.id)
      .order("day_number")
      .order("idea_order");

    if (ideaData) {
      setIdeas(ideaData as unknown as ContentIdea[]);
    }
  };

  const handleBankClick = async (bank: ContentBank) => {
    setActiveBank(bank);
    await fetchBankDetails(bank);

    // Determine which view to show
    if (!bank.pillars_generated) {
      setViewState("pillars");
    } else if (!bank.mind_map_generated) {
      setViewState("mindmap");
    } else {
      setViewState("mindmap");
    }
  };

  const handleOnboardingComplete = async (bankId: string) => {
    await fetchBanks();
    const bank = banks.find(b => b.id === bankId);
    if (bank) {
      handleBankClick(bank);
    } else {
      // Refetch to get the new bank
      const { data } = await supabase
        .from("content_calendars")
        .select("*")
        .eq("id", bankId)
        .single();
      
      if (data) {
        setActiveBank(data as unknown as ContentBank);
        setViewState("pillars");
      }
    }
  };

  const handlePillarsGenerated = (newPillars: BrandPillar[]) => {
    setPillars(newPillars);
    if (activeBank) {
      setActiveBank({ ...activeBank, pillars_generated: true });
    }
  };

  const handleIdeasGenerated = async () => {
    if (activeBank) {
      await fetchBankDetails(activeBank);
      setActiveBank({ ...activeBank, mind_map_generated: true });
    }
  };

  const handleIdeaClick = (idea: ContentIdea, pillar: BrandPillar | null) => {
    setSelectedIdea(idea);
    setSelectedPillar(pillar);
    setViewState("workspace");
  };

  const handleIdeaUpdate = (updatedIdea: ContentIdea) => {
    setSelectedIdea(updatedIdea);
    setIdeas(prev => prev.map(i => i.id === updatedIdea.id ? updatedIdea : i));
  };

  const handleNewBank = () => {
    setActiveBank(null);
    setPillars([]);
    setIdeas([]);
    setViewState("onboarding");
  };

  const handleBackToList = () => {
    setActiveBank(null);
    setPillars([]);
    setIdeas([]);
    setSelectedIdea(null);
    setSelectedPillar(null);
    setViewState("list");
    fetchBanks();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Onboarding View
  if (viewState === "onboarding") {
    return (
      <div>
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-orange-500/10 to-transparent border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Brand Content Planner</h2>
                <p className="text-sm text-muted-foreground">
                  "Plan your brand like a strategist. Generate content like a machine."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ContentBankOnboarding onComplete={handleOnboardingComplete} />
        
        {banks.length > 0 && (
          <div className="mt-8">
            <Button variant="ghost" onClick={handleBackToList}>
              ← Back to content plans
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Brand Pillars View
  if (viewState === "pillars" && activeBank) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleBackToList}>
            ← Back
          </Button>
          <Badge variant="outline">{activeBank.name}</Badge>
        </div>
        <BrandPillarsView
          calendarId={activeBank.id}
          niche={activeBank.primary_niche}
          goal={activeBank.main_goal}
          audienceLevel={activeBank.audience_level || "intermediate"}
          unhingedMode={activeBank.unhinged_mode || false}
          pillars={pillars}
          onPillarsGenerated={handlePillarsGenerated}
          onContinue={() => setViewState("mindmap")}
        />
      </div>
    );
  }

  // Mind Map View
  if (viewState === "mindmap" && activeBank) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleBackToList}>
              ← Back
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewState("pillars")}>
              View Pillars
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{activeBank.name}</Badge>
            {activeBank.unhinged_mode && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/20 pointer-events-none">
                <Flame className="h-3 w-3 mr-1" />
                Unhinged
              </Badge>
            )}
          </div>
        </div>
        <MindMapView
          calendarId={activeBank.id}
          niche={activeBank.primary_niche}
          unhingedMode={activeBank.unhinged_mode || false}
          pillars={pillars}
          ideas={ideas}
          onIdeasGenerated={handleIdeasGenerated}
          onIdeaClick={handleIdeaClick}
        />
      </div>
    );
  }

  // Tweet Workspace View
  if (viewState === "workspace" && activeBank && selectedIdea) {
    return (
      <TweetWorkspace
        idea={selectedIdea}
        pillar={selectedPillar}
        niche={activeBank.primary_niche}
        unhingedMode={activeBank.unhinged_mode || false}
        onBack={() => setViewState("mindmap")}
        onUpdate={handleIdeaUpdate}
      />
    );
  }

  // List View (Default)
  if (banks.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-background to-orange-500/5 border-primary/20">
        <CardContent className="pt-6 text-center py-12">
          <div className="mx-auto p-4 rounded-2xl bg-primary/10 w-fit mb-4">
            <FlaskConical className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Brand Content Planner</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Create your brand content strategy with AI-powered pillars, 
            mind-map planning, and on-demand tweet generation.
          </p>
          <Button variant="viral" size="lg" onClick={handleNewBank}>
            <Plus className="h-5 w-5 mr-2" />
            Create Content Plan
          </Button>
          <p className="text-xs text-muted-foreground mt-4 italic">
            "Plan your brand like a strategist. Generate content like a machine."
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-orange-500/10 to-transparent border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Brand Content Planner</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI-powered content command center
                </p>
              </div>
            </div>
            <Button variant="viral" onClick={handleNewBank}>
              <Plus className="h-4 w-4 mr-2" />
              New Content Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bank List */}
      <div className="grid gap-4 md:grid-cols-2">
        {banks.map((bank) => {
          const progress = bank.mind_map_generated 
            ? "Ready" 
            : bank.pillars_generated 
              ? "Pillars Done" 
              : "New";

          return (
            <Card 
              key={bank.id} 
              className="bg-card/50 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => handleBankClick(bank)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{bank.name}</h3>
                    {bank.unhinged_mode && (
                      <Flame className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <Badge 
                    variant={progress === "Ready" ? "default" : "secondary"}
                    className={progress === "Ready" ? "bg-green-500/20 text-green-400" : ""}
                  >
                    {progress}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {bank.primary_niche} • {bank.main_goal}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{format(new Date(bank.created_at), "MMM d, yyyy")}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
