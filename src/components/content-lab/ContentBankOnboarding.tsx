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

const niches = [
  "Tech/SaaS", "AI/ML", "Crypto/Web3", "Web3 Jobs", "Bounties/Airdrops",
  "Zero Dollar Opportunities", "Marketing", "Finance/Investing", "DeFi/Trading",
  "Productivity", "Career/Jobs", "Startup", "Freelancing", "Side Hustles",
  "Design", "Health/Fitness", "Writing", "E-commerce", "Dropshipping",
  "Education", "Personal Development", "Gaming", "NFTs", "Content Creation",
  "Real Estate", "Relationships", "Money Twitter", "Hustle Culture", "Other"
];

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
  const [primaryNiche, setPrimaryNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [audienceLevel, setAudienceLevel] = useState("intermediate");
  const [unhingedMode, setUnhingedMode] = useState(false);

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
      const finalNiche = primaryNiche === "Other" ? customNiche.trim() : primaryNiche;
      
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
        return primaryNiche === "Other" ? customNiche.trim() !== "" : primaryNiche !== "";
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
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              What's your niche?
            </CardTitle>
            <CardDescription>We'll generate content bank ideas tailored to your audience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {niches.map((niche) => (
                <button
                  key={niche}
                  onClick={() => setPrimaryNiche(niche)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all border ${
                    primaryNiche === niche
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 border-border hover:border-primary/50"
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>

            {primaryNiche === "Other" && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Enter your niche
                </Label>
                <Input
                  placeholder="e.g., Sustainability, Mental Health, DIY..."
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  className="bg-secondary/50"
                  autoFocus
                />
              </div>
            )}
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
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Flame className="h-5 w-5 text-orange-500" />
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
                  <span className="text-viral-success">✓</span>
                  {isPaidUser ? "10 posts per day" : "5 posts per day (Free tier)"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-viral-success">✓</span>
                  Multiple content formats & psychology triggers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-viral-success">✓</span>
                  Ready-to-post content (no drafts needed)
                </li>
                {isPaidUser && (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="text-viral-success">✓</span>
                      Up to 30 days of content
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-viral-success">✓</span>
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
