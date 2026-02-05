import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Plus, ArrowRight, FlaskConical, Sparkles } from "lucide-react";
import { ContentLabOnboarding } from "./ContentLabOnboarding";
import { ContentCalendarView } from "./ContentCalendarView";
import { format } from "date-fns";

interface ContentCalendar {
  id: string;
  name: string;
  calendar_length: number;
  primary_niche: string;
  status: string;
  created_at: string;
}

export function ContentLabTab() {
  const { user } = useAuth();
  const [calendars, setCalendars] = useState<ContentCalendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeCalendarId, setActiveCalendarId] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendars();
  }, [user]);

  const fetchCalendars = async () => {
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
        setCalendars(data as ContentCalendar[]);
        // If there's an active calendar, show it
        const activeCalendar = data.find(c => c.status === "ready");
        if (activeCalendar && !activeCalendarId) {
          setActiveCalendarId(activeCalendar.id);
        }
      }
    } catch (error) {
      console.error("Error fetching calendars:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (calendarId: string) => {
    setShowOnboarding(false);
    setActiveCalendarId(calendarId);
    fetchCalendars();
  };

  const handleNewCalendar = () => {
    setActiveCalendarId(null);
    setShowOnboarding(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Show onboarding if requested or if no calendars exist
  if (showOnboarding || (calendars.length === 0 && !activeCalendarId)) {
    return (
      <div>
        {/* Header for context */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-viral-success/10 to-transparent border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Content Lab</h2>
                <p className="text-sm text-muted-foreground">
                  Build a psychology-driven content calendar that compounds your growth.
                  Every post serves a goal: reach, authority, retention, or conversion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ContentLabOnboarding onComplete={handleOnboardingComplete} />
        
        {calendars.length > 0 && (
          <div className="mt-8">
            <Button variant="ghost" onClick={() => setShowOnboarding(false)}>
              ← Back to calendars
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Show active calendar
  if (activeCalendarId) {
    return (
      <ContentCalendarView 
        calendarId={activeCalendarId}
        onNewCalendar={handleNewCalendar}
      />
    );
  }

  // Show calendar list
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-viral-success/10 to-transparent border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Content Lab</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI-powered content strategy hub
                </p>
              </div>
            </div>
            <Button variant="viral" onClick={handleNewCalendar}>
              <Plus className="h-4 w-4 mr-2" />
              New Calendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar List */}
      <div className="grid gap-4 md:grid-cols-2">
        {calendars.map((calendar) => (
          <Card 
            key={calendar.id} 
            className="bg-card/50 cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => setActiveCalendarId(calendar.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {calendar.name}
                </CardTitle>
                <Badge 
                  variant={calendar.status === "ready" ? "default" : "secondary"}
                  className={calendar.status === "ready" ? "bg-viral-success/20 text-viral-success" : ""}
                >
                  {calendar.status === "ready" ? "Active" : calendar.status}
                </Badge>
              </div>
              <CardDescription>{calendar.primary_niche}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {calendar.calendar_length} days • {format(new Date(calendar.created_at), "MMM d, yyyy")}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state CTA */}
      {calendars.length === 0 && (
        <Card className="bg-card/50 border-dashed">
          <CardContent className="pt-6 text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Create Your First Content Calendar</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tell us about your niche and goals, and we'll generate a psychology-driven content strategy.
            </p>
            <Button variant="viral" onClick={handleNewCalendar}>
              <Plus className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
