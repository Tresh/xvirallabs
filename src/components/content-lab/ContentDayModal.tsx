import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Copy,
  Sparkles,
  Clock,
  MessageSquare,
  Target,
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Lock,
  RefreshCw,
  Brain,
} from "lucide-react";

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
  primary_niche: string;
}

interface Coaching {
  intent_explanation: string;
  best_posting_time: string;
  reply_strategy: string;
  follow_up_suggestions: string[];
}

interface ContentDayModalProps {
  day: CalendarDay;
  calendar: ContentCalendar;
  isPaidUser: boolean;
  onClose: () => void;
  onDraftGenerated: (day: CalendarDay) => void;
  onStatusChange: (dayId: string, status: string) => void;
}

const goalIcons: Record<string, any> = {
  reach: TrendingUp,
  authority: Target,
  retention: Users,
  education: BookOpen,
  conversion: DollarSign,
};

export function ContentDayModal({ 
  day, 
  calendar, 
  isPaidUser, 
  onClose, 
  onDraftGenerated,
  onStatusChange 
}: ContentDayModalProps) {
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isGeneratingCoaching, setIsGeneratingCoaching] = useState(false);
  const [coaching, setCoaching] = useState<Coaching | null>(null);
  const [editedDraft, setEditedDraft] = useState(day.draft_content || "");

  const GoalIcon = goalIcons[day.content_goal] || Target;

  useEffect(() => {
    setEditedDraft(day.draft_content || "");
    // Fetch existing coaching if available
    fetchCoaching();
  }, [day.id]);

  const fetchCoaching = async () => {
    const { data } = await supabase
      .from("content_coaching")
      .select("*")
      .eq("calendar_day_id", day.id)
      .maybeSingle();

    if (data) {
      setCoaching(data as Coaching);
    }
  };

  const generateDraft = async () => {
    setIsGeneratingDraft(true);
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

      const updatedDay = {
        ...day,
        draft_content: data.draft.draft_content,
        draft_why_it_works: data.draft.why_it_works,
        draft_action_driven: data.draft.action_driven,
        status: "drafted",
      };

      setEditedDraft(data.draft.draft_content);
      onDraftGenerated(updatedDay);

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
      setIsGeneratingDraft(false);
    }
  };

  const generateCoaching = async () => {
    if (!isPaidUser) {
      toast({
        variant: "destructive",
        title: "Pro feature",
        description: "Daily coaching is available for Pro users. Upgrade to unlock!",
      });
      return;
    }

    setIsGeneratingCoaching(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-lab", {
        body: {
          action: "generate_coaching",
          dayId: day.id,
          postBrief: day.post_brief,
          contentGoal: day.content_goal,
          draftContent: editedDraft,
        },
      });

      if (error) throw error;

      setCoaching(data.coaching);

      toast({
        title: "Coaching generated!",
        description: "Your daily tips are ready.",
      });
    } catch (error) {
      console.error("Coaching error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate coaching",
      });
    } finally {
      setIsGeneratingCoaching(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(editedDraft);
    toast({ title: "Copied to clipboard!" });
  };

  const saveDraft = async () => {
    const { error } = await supabase
      .from("content_calendar_days")
      .update({ draft_content: editedDraft })
      .eq("id", day.id);

    if (error) {
      toast({ variant: "destructive", title: "Failed to save" });
    } else {
      toast({ title: "Draft saved!" });
    }
  };

  const markAsPosted = async () => {
    const { error } = await supabase
      .from("content_calendar_days")
      .update({ status: "posted" })
      .eq("id", day.id);

    if (!error) {
      onStatusChange(day.id, "posted");
      toast({ title: "Marked as posted!" });
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold">
              D{day.day_number}
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                Day {day.day_number}
                <Badge variant="outline" className="capitalize ml-2">
                  {day.content_type.replace("_", " ")}
                </Badge>
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <GoalIcon className="h-3 w-3" />
                {day.content_goal} • {day.psychological_trigger}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Post Brief */}
          <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">Post Brief</h4>
            <p className="text-sm bg-secondary/30 p-3 rounded-lg">{day.post_brief}</p>
          </div>

          {/* Draft Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-muted-foreground">Draft Content</h4>
              {editedDraft && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={saveDraft}>
                    Save
                  </Button>
                </div>
              )}
            </div>
            
            {editedDraft ? (
              <Textarea
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                className="min-h-[150px] bg-secondary/30"
                placeholder="Your draft content..."
              />
            ) : (
              <div className="bg-secondary/30 p-6 rounded-lg text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No draft yet. Generate one based on the brief.
                </p>
                <Button 
                  variant="viral" 
                  onClick={generateDraft}
                  disabled={isGeneratingDraft}
                >
                  {isGeneratingDraft ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Why It Works */}
          {day.draft_why_it_works && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Why It Works
                </h5>
                <p className="text-xs text-muted-foreground">{day.draft_why_it_works}</p>
              </div>
              <div className="p-4 rounded-lg bg-viral-success/10 border border-viral-success/30">
                <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                  <Target className="h-4 w-4 text-viral-success" />
                  Action Driven
                </h5>
                <p className="text-xs text-muted-foreground">{day.draft_action_driven}</p>
              </div>
            </div>
          )}

          {/* Daily Coaching */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                Daily Coach
                {!isPaidUser && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Lock className="h-3 w-3" />
                    Pro
                  </Badge>
                )}
              </h4>
              {(isPaidUser && !coaching) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateCoaching}
                  disabled={isGeneratingCoaching || !editedDraft}
                >
                  {isGeneratingCoaching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Get Tips
                    </>
                  )}
                </Button>
              )}
            </div>

            {coaching ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Intent</h5>
                  <p className="text-sm">{coaching.intent_explanation}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <h5 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Best Time
                    </h5>
                    <p className="text-sm">{coaching.best_posting_time}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <h5 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Reply Strategy
                    </h5>
                    <p className="text-sm">{coaching.reply_strategy}</p>
                  </div>
                </div>
                {coaching.follow_up_suggestions?.length > 0 && (
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Follow-up Ideas</h5>
                    <ul className="space-y-1">
                      {coaching.follow_up_suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <p className="text-xs text-muted-foreground">
                  {isPaidUser 
                    ? "Generate a draft first, then get personalized posting tips."
                    : "Upgrade to Pro to unlock daily coaching tips."
                  }
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {editedDraft && day.status !== "posted" && (
              <Button variant="viral" onClick={markAsPosted}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Posted
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
