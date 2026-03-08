import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Target,
  Users,
  Rocket,
  DollarSign,
  Sparkles,
  Flame,
  Zap
} from "lucide-react";

interface ContentBankOnboardingProps {
  onComplete: (calendarId: string) => void;
}

const nichePlaceholders = [
  "e.g., Web3 jobs, bounties, and zero-dollar opportunities for beginners",
  "e.g., AI tools for productivity, automation, and side hustles",
  "e.g., Crypto trading, DeFi strategies, and airdrop hunting",
  "e.g., Freelancing, remote work, and building a personal brand",
  "e.g., SaaS marketing, growth hacking, and content strategy",
];

const quickTags = ["Web3", "AI", "Crypto", "Marketing", "Freelancing", "Side Hustles", "Tech", "Finance"];

const goals = [
  { value: "growth", label: "Maximum Growth", icon: Rocket, description: "Followers, reach, virality" },
  { value: "authority", label: "Build Authority", icon: Target, description: "Trust and expertise" },
  { value: "sales", label: "Drive Sales", icon: DollarSign, description: "Revenue and conversions" },
  { value: "all", label: "All of the Above", icon: Zap, description: "Full attack mode" },
];

const audienceLevels = [
  { value: "beginner", label: "Beginner", description: "0-1K followers" },
  { value: "intermediate", label: "Intermediate", description: "1K-10K followers" },
  { value: "advanced", label: "Advanced", description: "10K+ followers" },
];

export function ContentBankOnboarding({ onComplete }: ContentBankOnboardingProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [nicheInput, setNicheInput] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [audienceLevel, setAudienceLevel] = useState("intermediate");
  const [unhingedMode, setUnhingedMode] = useState(false);
  const [placeholder] = useState(() => nichePlaceholders[Math.floor(Math.random() * nichePlaceholders.length)]);

  const isPaidUser = profile?.tier === "pro" || profile?.tier === "elite";

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to create a content bank.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const finalNiche = nicheInput.trim();
      
      // Create the content bank in database
      const { data: calendar, error: calendarError } = await supabase
        .from("content_calendars")
        .insert({
          user_id: user.id,
          name: `${finalNiche} Content Bank`,
          calendar_length: 1, // Start with 1 day
          primary_niche: finalNiche,
          main_goal: mainGoal,
          posting_capacity: "high", // Content banks are high-volume by design
          audience_level: audienceLevel,
          unhinged_mode: unhingedMode,
          status: "generating",
        })
        .select()
        .single();

      if (calendarError) {
        console.error("Calendar creation error:", calendarError);
        throw new Error(calendarError.message || "Failed to create content bank");
      }

      // Generate first day's content bank
      const { error: genError } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_content_bank",
          calendarId: calendar.id,
          primaryNiche: finalNiche,
          audienceLevel,
          mainGoal,
          dayNumber: 1,
          unhingedMode,
        },
      });

      if (genError) {
        console.error("Generation error:", genError);
        throw new Error("Failed to generate content bank");
      }

      toast({
        title: "🔥 Content Bank Created!",
        description: `Day 1 is ready with ${isPaidUser ? "10" : "5"} posts. Let's go viral.`,
      });

      onComplete(calendar.id);
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create content bank",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: 
        return nicheInput.trim().length >= 5;
      case 2: 
        return mainGoal !== "";
      case 3: 
        return true;
      default: 
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-16 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Niche */}
      {step === 1 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Describe your niche
            </CardTitle>
            <CardDescription>
              Be specific! The more detail you give, the better the AI understands your audience.
              You can include multiple niches or sub-niches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                What topics do you create content about?
              </Label>
              <textarea
                placeholder={placeholder}
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                className="w-full min-h-[120px] p-4 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-base"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 Tip: Include your target audience, specific topics, and what makes your content unique
              </p>
            </div>

            {/* Quick suggestions */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Quick add:</Label>
              <div className="flex flex-wrap gap-2">
                {["Web3", "AI", "Crypto", "Marketing", "Freelancing", "Side Hustles", "Tech", "Finance"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setNicheInput(prev => prev ? `${prev}, ${tag}` : tag)}
                    className="px-3 py-1 text-xs rounded-full bg-secondary/50 border border-border hover:border-primary/50 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Goals */}
      {step === 2 && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              What's your primary goal?
            </CardTitle>
            <CardDescription>We'll optimize your content bank for maximum impact</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={mainGoal} onValueChange={setMainGoal} className="space-y-3">
              {goals.map((goal) => (
                <label
                  key={goal.value}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    mainGoal === goal.value
                      ? "bg-primary/10 border-primary"
                      : "bg-secondary/30 border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={goal.value} />
                  <div className="p-2 rounded-lg bg-primary/10">
                    <goal.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{goal.label}</p>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Settings */}
      {step === 3 && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Customize Your Content Bank
            </CardTitle>
            <CardDescription>Fine-tune the AI to match your style</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audience Level */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Your audience level</Label>
              <RadioGroup value={audienceLevel} onValueChange={setAudienceLevel} className="space-y-2">
                {audienceLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
                      audienceLevel === level.value
                        ? "bg-primary/10 border-primary"
                        : "bg-secondary/30 border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={level.value} />
                    <div className="flex-1">
                      <p className="font-medium">{level.label}</p>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Unhinged Mode Toggle */}
            <div className="p-4 rounded-lg border border-border bg-secondary/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Flame className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <Label className="font-medium flex items-center gap-2">
                      Unhinged Mode 🔥
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Bolder, edgier, more controversial. Optimized for replies.
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={unhingedMode} 
                  onCheckedChange={setUnhingedMode}
                />
              </div>
            </div>

            {/* What you'll get */}
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <h4 className="font-medium mb-3">What you'll get:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  {isPaidUser ? "10 posts per day" : "5 posts per day (Free tier)"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Multiple content formats & psychology triggers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Ready-to-post content (no drafts needed)
                </li>
                {isPaidUser && (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      Up to 30 days of content
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      Sales & conversion posts included
                    </li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={isLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button 
            variant="viral" 
            onClick={() => setStep(step + 1)} 
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            variant="viral" 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="min-w-[180px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content Bank
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
