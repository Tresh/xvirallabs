import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  Sparkles,
  Twitter,
  Lock
} from "lucide-react";

interface ContentLabOnboardingProps {
  onComplete: (calendarId: string) => void;
}

const niches = [
  "Tech/SaaS", "AI/ML", "Crypto/Web3", "Marketing", "Finance/Investing",
  "Productivity", "Career/Jobs", "Startup", "Design", "Health/Fitness",
  "Writing", "E-commerce", "Education", "Personal Development", "Other"
];

const goals = [
  { value: "followers", label: "Grow Followers", icon: Users, description: "Build a larger audience" },
  { value: "authority", label: "Build Authority", icon: Target, description: "Establish expertise" },
  { value: "sales", label: "Sell Product/Service", icon: DollarSign, description: "Drive revenue" },
  { value: "all", label: "All of the Above", icon: Rocket, description: "Full growth mode" },
];

const monetizations = [
  { value: "coaching", label: "Coaching" },
  { value: "saas", label: "SaaS" },
  { value: "courses", label: "Courses" },
  { value: "services", label: "Services" },
  { value: "none", label: "Not yet" },
];

const capacities = [
  { value: "low", label: "Low", description: "3-4x per week" },
  { value: "medium", label: "Medium", description: "1x per day" },
  { value: "high", label: "High", description: "2-3x per day" },
];

export function ContentLabOnboarding({ onComplete }: ContentLabOnboardingProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [primaryNiche, setPrimaryNiche] = useState("");
  const [subNiches, setSubNiches] = useState<string[]>([]);
  const [audienceSize, setAudienceSize] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [monetizationType, setMonetizationType] = useState("");
  const [postingCapacity, setPostingCapacity] = useState("medium");
  const [inspirationHandles, setInspirationHandles] = useState<string[]>([""]);
  const [calendarLength, setCalendarLength] = useState(30);

  const isPaidUser = profile?.tier === "pro" || profile?.tier === "elite";

  const handleSubNicheToggle = (niche: string) => {
    if (subNiches.includes(niche)) {
      setSubNiches(subNiches.filter(n => n !== niche));
    } else if (subNiches.length < 3) {
      setSubNiches([...subNiches, niche]);
    }
  };

  const addInspirationHandle = () => {
    if (inspirationHandles.length < 5) {
      setInspirationHandles([...inspirationHandles, ""]);
    }
  };

  const updateInspirationHandle = (index: number, value: string) => {
    const updated = [...inspirationHandles];
    updated[index] = value.replace("@", "");
    setInspirationHandles(updated);
  };

  const removeInspirationHandle = (index: number) => {
    setInspirationHandles(inspirationHandles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Create the calendar in database
      const { data: calendar, error: calendarError } = await supabase
        .from("content_calendars")
        .insert({
          user_id: user.id,
          name: `${primaryNiche} Calendar`,
          calendar_length: isPaidUser ? calendarLength : 7,
          primary_niche: primaryNiche,
          sub_niches: subNiches,
          audience_size: audienceSize,
          main_goal: mainGoal,
          monetization_type: monetizationType,
          posting_capacity: postingCapacity,
          status: "generating",
        })
        .select()
        .single();

      if (calendarError || !calendar) {
        throw new Error("Failed to create calendar");
      }

      // Save inspiration handles if Pro user
      const validHandles = inspirationHandles.filter(h => h.trim());
      if (isPaidUser && validHandles.length > 0) {
        await supabase
          .from("content_inspirations")
          .insert(
            validHandles.map(handle => ({
              calendar_id: calendar.id,
              user_id: user.id,
              twitter_handle: handle,
            }))
          );
      }

      // Trigger calendar generation
      const { error: genError } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_calendar",
          calendarId: calendar.id,
          primaryNiche,
          subNiches,
          mainGoal,
          monetizationType,
          postingCapacity,
          calendarLength: isPaidUser ? calendarLength : 7,
          inspirationHandles: isPaidUser ? validHandles : [],
        },
      });

      if (genError) {
        throw new Error("Failed to generate calendar");
      }

      toast({
        title: "Calendar created!",
        description: `Your ${isPaidUser ? calendarLength : 7}-day content calendar is ready.`,
      });

      onComplete(calendar.id);
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create calendar",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return primaryNiche !== "";
      case 2: return mainGoal !== "";
      case 3: return true;
      case 4: return postingCapacity !== "";
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-2 w-12 rounded-full transition-colors ${
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
              What's your primary niche?
            </CardTitle>
            <CardDescription>This helps us personalize your content strategy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

            {primaryNiche && (
              <div>
                <Label className="text-sm text-muted-foreground mb-3 block">
                  Optional: Select up to 3 sub-niches
                </Label>
                <div className="flex flex-wrap gap-2">
                  {niches.filter(n => n !== primaryNiche).map((niche) => (
                    <button
                      key={niche}
                      onClick={() => handleSubNicheToggle(niche)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        subNiches.includes(niche)
                          ? "bg-primary/20 text-primary border-primary/50"
                          : "bg-secondary/30 border-transparent hover:border-border"
                      }`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Current audience size (optional)
              </Label>
              <Input
                placeholder="e.g., 5,000 followers"
                value={audienceSize}
                onChange={(e) => setAudienceSize(e.target.value)}
                className="bg-secondary/50"
              />
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
              What's your main goal?
            </CardTitle>
            <CardDescription>We'll optimize your calendar for this objective</CardDescription>
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

      {/* Step 3: Monetization */}
      {step === 3 && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              How do you monetize (or plan to)?
            </CardTitle>
            <CardDescription>This affects your conversion content strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {monetizations.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMonetizationType(m.value)}
                  className={`p-4 rounded-lg text-sm font-medium transition-all border ${
                    monetizationType === m.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 border-border hover:border-primary/50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Capacity */}
      {step === 4 && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              What's your posting capacity?
            </CardTitle>
            <CardDescription>Be realistic to avoid burnout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={postingCapacity} onValueChange={setPostingCapacity} className="space-y-3">
              {capacities.map((cap) => (
                <label
                  key={cap.value}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    postingCapacity === cap.value
                      ? "bg-primary/10 border-primary"
                      : "bg-secondary/30 border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={cap.value} />
                  <div className="flex-1">
                    <p className="font-medium">{cap.label}</p>
                    <p className="text-sm text-muted-foreground">{cap.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Calendar length
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={7}
                  max={30}
                  value={calendarLength}
                  onChange={(e) => setCalendarLength(Math.min(30, Math.max(7, parseInt(e.target.value) || 7)))}
                  className="w-24 bg-secondary/50"
                  disabled={!isPaidUser}
                />
                <span className="text-sm text-muted-foreground">days</span>
                {!isPaidUser && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Free: 7 days
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Inspirations (Pro only) */}
      {step === 5 && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-primary" />
              Accounts you admire
            </CardTitle>
            <CardDescription>
              We'll extract their DNA to personalize your strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isPaidUser && (
              <div className="p-4 rounded-lg bg-viral-warning/10 border border-viral-warning/30">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="h-4 w-4 text-viral-warning" />
                  <span className="font-medium text-viral-warning">Pro Feature</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Account DNA extraction is available for Pro users. Skip this step or upgrade to unlock personalized inspiration analysis.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {inspirationHandles.map((handle, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-muted-foreground">@</span>
                  <Input
                    placeholder="username"
                    value={handle}
                    onChange={(e) => updateInspirationHandle(index, e.target.value)}
                    className="flex-1 bg-secondary/50"
                    disabled={!isPaidUser}
                  />
                  {inspirationHandles.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInspirationHandle(index)}
                      disabled={!isPaidUser}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {inspirationHandles.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addInspirationHandle}
                disabled={!isPaidUser}
              >
                + Add another
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <Button 
            onClick={() => setStep(step + 1)} 
            disabled={!canProceed()}
            variant="viral"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !canProceed()}
            variant="viral"
            className="min-w-[160px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Calendar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
