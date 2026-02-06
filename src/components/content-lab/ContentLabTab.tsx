import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Plus, ArrowRight, FlaskConical, Sparkles, Flame } from "lucide-react";
import { ContentBankOnboarding } from "./ContentBankOnboarding";
import { ContentBankView } from "./ContentBankView";
import { format } from "date-fns";

interface ContentBank {
  id: string;
  name: string;
  calendar_length: number;
  primary_niche: string;
  main_goal: string;
  unhinged_mode: boolean | null;
  status: string;
  created_at: string;
}

export function ContentLabTab() {
  const { user } = useAuth();
  const [banks, setBanks] = useState<ContentBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeBankId, setActiveBankId] = useState<string | null>(null);

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
        // If there's an active bank, show it
        const activeBank = data.find(c => c.status === "ready");
        if (activeBank && !activeBankId) {
          setActiveBankId(activeBank.id);
        }
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (bankId: string) => {
    setShowOnboarding(false);
    setActiveBankId(bankId);
    fetchBanks();
  };

  const handleNewBank = () => {
    setActiveBankId(null);
    setShowOnboarding(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Show onboarding if requested or if no banks exist
  if (showOnboarding || (banks.length === 0 && !activeBankId)) {
    return (
      <div>
        {/* Header for context */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-orange-500/10 to-transparent border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Content Lab</h2>
                <p className="text-sm text-muted-foreground">
                  We don't give you a content calendar. We give you a <strong>daily content bank</strong> so you never run out of posts.
                  10+ psychology-driven posts per day, across formats and triggers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ContentBankOnboarding onComplete={handleOnboardingComplete} />
        
        {banks.length > 0 && (
          <div className="mt-8">
            <Button variant="ghost" onClick={() => setShowOnboarding(false)}>
              ← Back to content banks
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Show active bank
  if (activeBankId) {
    return (
      <ContentBankView 
        calendarId={activeBankId}
        onNewBank={handleNewBank}
      />
    );
  }

  // Show bank list
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
                <h2 className="text-xl font-bold mb-1">Content Lab</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI-powered daily content bank
                </p>
              </div>
            </div>
            <Button variant="viral" onClick={handleNewBank}>
              <Plus className="h-4 w-4 mr-2" />
              New Content Bank
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bank List */}
      <div className="grid gap-4 md:grid-cols-2">
        {banks.map((bank) => (
          <Card 
            key={bank.id} 
            className="bg-card/50 cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => setActiveBankId(bank.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {bank.name}
                  {bank.unhinged_mode && (
                    <Flame className="h-4 w-4 text-orange-500" />
                  )}
                </CardTitle>
                <Badge 
                  variant={bank.status === "ready" ? "default" : "secondary"}
                  className={bank.status === "ready" ? "bg-viral-success/20 text-viral-success" : ""}
                >
                  {bank.status === "ready" ? "Active" : bank.status}
                </Badge>
              </div>
              <CardDescription>{bank.primary_niche} • {bank.main_goal}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {bank.calendar_length} days • {format(new Date(bank.created_at), "MMM d, yyyy")}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state CTA */}
      {banks.length === 0 && (
        <Card className="bg-card/50 border-dashed">
          <CardContent className="pt-6 text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Create Your First Content Bank</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get 10+ psychology-driven posts per day. Never run out of content ideas.
            </p>
            <Button variant="viral" onClick={handleNewBank}>
              <Plus className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
