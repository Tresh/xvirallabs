import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Calendar,
  Target,
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Sparkles,
  Clock,
  MessageSquare,
  Lock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { ContentDayModal } from "./ContentDayModal";

interface CalendarDay {
  id: string;
  day_number: number;
  date: string | null;
  content_goal: string;
  content_type: string;
  psychological_trigger: string | null;
  post_brief: string;
  draft_content: string | null;
  draft_why_it_works: string | null;
  draft_action_driven: string | null;
  status: string;
}

interface ContentCalendar {
  id: string;
  name: string;
  calendar_length: number;
  primary_niche: string;
  sub_niches: string[];
  main_goal: string;
  posting_capacity: string;
  status: string;
  created_at: string;
}

interface ContentCalendarViewProps {
  calendarId: string;
  onNewCalendar: () => void;
}

const goalIcons: Record<string, any> = {
  reach: TrendingUp,
  authority: Target,
  retention: Users,
  education: BookOpen,
  conversion: DollarSign,
};

const goalColors: Record<string, string> = {
  reach: "bg-viral-success/20 text-viral-success border-viral-success/30",
  authority: "bg-primary/20 text-primary border-primary/30",
  retention: "bg-viral-warning/20 text-viral-warning border-viral-warning/30",
  education: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  conversion: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function ContentCalendarView({ calendarId, onNewCalendar }: ContentCalendarViewProps) {
  const { user, profile } = useAuth();
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [generatingDrafts, setGeneratingDrafts] = useState<Set<string>>(new Set());

  const isPaidUser = profile?.tier === "pro" || profile?.tier === "elite";

  useEffect(() => {
    fetchCalendar();
  }, [calendarId]);

  const fetchCalendar = async () => {
    setIsLoading(true);
    try {
      const [calRes, daysRes] = await Promise.all([
        supabase
          .from("content_calendars")
          .select("*")
          .eq("id", calendarId)
          .single(),
        supabase
          .from("content_calendar_days")
          .select("*")
          .eq("calendar_id", calendarId)
          .order("day_number"),
      ]);

      if (calRes.data) {
        setCalendar(calRes.data as ContentCalendar);
      }
      if (daysRes.data) {
        setDays(daysRes.data as CalendarDay[]);
      }
    } catch (error) {
      console.error("Error fetching calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDraft = async (day: CalendarDay) => {
    if (!calendar) return;

    // Check free user limits
    if (!isPaidUser) {
      const draftedCount = days.filter(d => d.draft_content).length;
      if (draftedCount >= 5) {
        toast({
          variant: "destructive",
          title: "Draft limit reached",
          description: "Free users can generate up to 5 drafts. Upgrade to Pro for unlimited!",
        });
        return;
      }
    }

    setGeneratingDrafts(prev => new Set([...prev, day.id]));

    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_draft",
          dayId: day.id,
          postBrief: day.post_brief,
          contentGoal: day.content_goal,
          contentType: day.content_type,
          niche: calendar.primary_niche,
        },
      });

      if (error) throw error;

      // Update local state
      setDays(prev => prev.map(d => 
        d.id === day.id 
          ? { 
              ...d, 
              draft_content: data.draft.draft_content,
              draft_why_it_works: data.draft.why_it_works,
              draft_action_driven: data.draft.action_driven,
              status: "drafted"
            } 
          : d
      ));

      toast({
        title: "Draft generated!",
        description: "Your content is ready to review.",
      });
    } catch (error) {
      console.error("Draft generation error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate draft",
      });
    } finally {
      setGeneratingDrafts(prev => {
        const next = new Set(prev);
        next.delete(day.id);
        return next;
      });
    }
  };

  const generateAllDrafts = async () => {
    const pendingDays = days.filter(d => !d.draft_content);
    for (const day of pendingDays) {
      await generateDraft(day);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!calendar) {
    return (
      <Card className="bg-card/50">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">Calendar not found</p>
          <Button variant="outline" className="mt-4" onClick={onNewCalendar}>
            Create New Calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const draftedCount = days.filter(d => d.draft_content).length;
  const completedCount = days.filter(d => d.status === "posted").length;

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">{calendar.name}</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{calendar.primary_niche}</Badge>
                <span>•</span>
                <span>{calendar.calendar_length} days</span>
                <span>•</span>
                <span>{draftedCount}/{days.length} drafted</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPaidUser && draftedCount < days.length && (
                <Button 
                  variant="viral" 
                  size="sm"
                  onClick={generateAllDrafts}
                  disabled={generatingDrafts.size > 0}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate All Drafts
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onNewCalendar}>
                New Calendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Calendar Progress</span>
          <span className="font-medium">{completedCount}/{days.length} posted</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(completedCount / days.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Calendar Days */}
      <div className="grid gap-3">
        {days.map((day, index) => {
          const GoalIcon = goalIcons[day.content_goal] || Target;
          const isGenerating = generatingDrafts.has(day.id);
          const hasDraft = !!day.draft_content;
          const isLocked = !isPaidUser && index >= 5 && !hasDraft;

          return (
            <Card 
              key={day.id} 
              className={`bg-card/50 transition-all hover:border-primary/50 cursor-pointer ${
                day.status === "posted" ? "opacity-60" : ""
              } ${isLocked ? "opacity-50" : ""}`}
              onClick={() => !isLocked && setSelectedDay(day)}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Day Number */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                    day.status === "posted" ? "bg-viral-success/20 text-viral-success" : "bg-secondary text-foreground"
                  }`}>
                    {day.status === "posted" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span>D{day.day_number}</span>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${goalColors[day.content_goal]} border`}>
                        <GoalIcon className="h-3 w-3 mr-1" />
                        {day.content_goal}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {day.content_type.replace("_", " ")}
                      </Badge>
                      {day.psychological_trigger && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          • {day.psychological_trigger}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {day.post_brief}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Pro
                      </Badge>
                    ) : hasDraft ? (
                      <Badge variant="secondary" className="bg-viral-success/20 text-viral-success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Drafted
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateDraft(day);
                        }}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-1" />
                            Draft
                          </>
                        )}
                      </Button>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Day Modal */}
      {selectedDay && (
        <ContentDayModal
          day={selectedDay}
          calendar={calendar}
          isPaidUser={isPaidUser}
          onClose={() => setSelectedDay(null)}
          onDraftGenerated={(updatedDay) => {
            setDays(prev => prev.map(d => d.id === updatedDay.id ? updatedDay : d));
          }}
          onStatusChange={(dayId, status) => {
            setDays(prev => prev.map(d => d.id === dayId ? { ...d, status } : d));
          }}
        />
      )}
    </div>
  );
}
