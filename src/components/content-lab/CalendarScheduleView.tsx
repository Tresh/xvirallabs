import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, GripVertical, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ContentPost {
  id: string;
  day_number: number;
  post_number: number;
  post_category: string;
  draft_content: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  is_posted: boolean;
}

interface CalendarScheduleViewProps {
  posts: ContentPost[];
  onUpdate: () => void;
}

const categoryColors: Record<string, string> = {
  clickbait: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  engagement: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  authority: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  thread: "bg-green-500/20 text-green-400 border-green-500/30",
  sales: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  relatable: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export function CalendarScheduleView({ posts, onUpdate }: CalendarScheduleViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedPost, setDraggedPost] = useState<ContentPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [isScheduling, setIsScheduling] = useState(false);

  const scheduledPosts = posts.filter(p => p.scheduled_date);
  const unscheduledPosts = posts.filter(p => !p.scheduled_date);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start of the calendar to align with Sunday
  const startPadding = monthStart.getDay();
  const paddedDays = Array(startPadding).fill(null).concat(daysInMonth);

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      if (!post.scheduled_date) return false;
      return isSameDay(new Date(post.scheduled_date), date);
    });
  };

  const handleDragStart = (post: ContentPost) => {
    setDraggedPost(post);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (!draggedPost) return;

    setSelectedPost(draggedPost);
    setSelectedDate(date);
    setDraggedPost(null);
  };

  const handleSchedule = async () => {
    if (!selectedPost || !selectedDate) return;

    setIsScheduling(true);
    try {
      const { error } = await supabase
        .from("content_calendar_days")
        .update({
          scheduled_date: format(selectedDate, "yyyy-MM-dd"),
          scheduled_time: selectedTime,
        })
        .eq("id", selectedPost.id);

      if (error) throw error;

      toast({
        title: "Post scheduled!",
        description: `Scheduled for ${format(selectedDate, "MMM d")} at ${selectedTime}`,
      });

      setSelectedPost(null);
      setSelectedDate(null);
      onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Scheduling failed",
        description: "Could not schedule the post. Please try again.",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleUnschedule = async (post: ContentPost) => {
    try {
      const { error } = await supabase
        .from("content_calendar_days")
        .update({
          scheduled_date: null,
          scheduled_time: null,
        })
        .eq("id", post.id);

      if (error) throw error;

      toast({ title: "Post unscheduled" });
      onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to unschedule",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Content Schedule</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[140px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unscheduled Posts Sidebar */}
        <Card className="lg:col-span-1 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GripVertical className="h-4 w-4" />
              Unscheduled ({unscheduledPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {unscheduledPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                All posts scheduled! 🎉
              </p>
            ) : (
              unscheduledPosts.map((post) => (
                <div
                  key={post.id}
                  draggable
                  onDragStart={() => handleDragStart(post)}
                  className={cn(
                    "p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-colors hover:border-primary/50",
                    categoryColors[post.post_category] || "bg-secondary/50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-50" />
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="text-[10px] mb-1">
                        D{post.day_number} #{post.post_number}
                      </Badge>
                      <p className="text-xs line-clamp-2">
                        {post.draft_content?.substring(0, 80)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card className="lg:col-span-3 bg-card/50">
          <CardContent className="pt-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {paddedDays.map((day, index) => {
                if (!day) {
                  return <div key={`pad-${index}`} className="aspect-square" />;
                }

                const dayPosts = getPostsForDate(day);
                const hasScheduled = dayPosts.length > 0;

                return (
                  <div
                    key={day.toISOString()}
                    onDragOver={(e) => handleDragOver(e, day)}
                    onDrop={(e) => handleDrop(e, day)}
                    className={cn(
                      "aspect-square p-1 rounded-lg border border-border/50 transition-colors min-h-[80px]",
                      isToday(day) && "border-primary bg-primary/5",
                      hasScheduled && "bg-secondary/30",
                      "hover:border-primary/50"
                    )}
                  >
                    <div className="flex flex-col h-full">
                      <span className={cn(
                        "text-xs font-medium",
                        isToday(day) && "text-primary"
                      )}>
                        {format(day, "d")}
                      </span>
                      <div className="flex-1 overflow-y-auto space-y-0.5 mt-1">
                        {dayPosts.slice(0, 3).map((post) => (
                          <div
                            key={post.id}
                            className={cn(
                              "text-[10px] p-1 rounded truncate cursor-pointer group relative",
                              categoryColors[post.post_category] || "bg-secondary"
                            )}
                            title={post.draft_content || ""}
                          >
                            <span className="flex items-center gap-1">
                              {post.scheduled_time && (
                                <Clock className="h-2 w-2" />
                              )}
                              {post.post_category}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnschedule(post);
                              }}
                              className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                        {dayPosts.length > 3 && (
                          <div className="text-[10px] text-muted-foreground">
                            +{dayPosts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Time Dialog */}
      <Dialog open={!!selectedPost && !!selectedDate} onOpenChange={() => { setSelectedPost(null); setSelectedDate(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Post Preview</Label>
              <p className="text-sm mt-1 p-3 rounded-lg bg-secondary/30 line-clamp-3">
                {selectedPost?.draft_content}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Date</Label>
              <p className="font-medium">{selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleSchedule} 
              disabled={isScheduling}
              className="w-full"
            >
              {isScheduling ? "Scheduling..." : "Confirm Schedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
