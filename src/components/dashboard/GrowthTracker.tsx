import { useState } from "react";
import { useGrowthTracker } from "@/hooks/useGrowthTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { TrendingUp, Plus, Users, Eye, Heart, MessageCircle, Loader2, BarChart3, ArrowUp } from "lucide-react";

function StatInput({ label, icon: Icon, value, onChange }: { label: string; icon: any; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" />{label}
      </label>
      <Input
        type="number"
        placeholder="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 text-sm"
      />
    </div>
  );
}

export function GrowthTracker() {
  const { snapshots, isLoading, addSnapshot, getWeeklyStats } = useGrowthTracker();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    follower_count: "",
    following_count: "",
    posts_published: "",
    total_impressions: "",
    total_likes: "",
    total_replies: "",
    notes: "",
  });

  const weeklyStats = getWeeklyStats();

  const handleSave = async () => {
    setIsSaving(true);
    const prev = snapshots[0];
    const currentFollowers = parseInt(form.follower_count) || 0;
    const prevFollowers = prev?.follower_count || 0;

    const { error } = await addSnapshot({
      follower_count: currentFollowers || undefined,
      following_count: parseInt(form.following_count) || undefined,
      posts_published: parseInt(form.posts_published) || 0,
      total_impressions: parseInt(form.total_impressions) || 0,
      total_likes: parseInt(form.total_likes) || 0,
      total_replies: parseInt(form.total_replies) || 0,
      weekly_gain: currentFollowers - prevFollowers,
      notes: form.notes || undefined,
    });

    if (error) {
      toast({ title: "Failed to save", description: String(error), variant: "destructive" });
    } else {
      toast({ title: "Growth snapshot saved! 📈" });
      setForm({ follower_count: "", following_count: "", posts_published: "", total_impressions: "", total_likes: "", total_replies: "", notes: "" });
    }
    setIsSaving(false);
  };

  const formatNumber = (n?: number) => {
    if (!n) return "—";
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Growth Tracker
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Log your stats weekly to track how XViralLabs is growing your account.
        </p>
      </div>

      {/* Weekly summary */}
      {weeklyStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Follower Gain",
              value: weeklyStats.followerGain !== null ? `+${weeklyStats.followerGain}` : "—",
              icon: Users,
              color: "text-primary",
            },
            { label: "Posts Published", value: String(weeklyStats.totalPosts), icon: BarChart3, color: "text-foreground" },
            { label: "Total Impressions", value: formatNumber(weeklyStats.totalImpressions), icon: Eye, color: "text-cyan-400" },
            { label: "Total Likes", value: formatNumber(weeklyStats.totalLikes), icon: Heart, color: "text-pink-400" },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-border">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">This week</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Log new snapshot */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Log Today's Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatInput label="Followers" icon={Users} value={form.follower_count} onChange={v => setForm(f => ({ ...f, follower_count: v }))} />
            <StatInput label="Following" icon={Users} value={form.following_count} onChange={v => setForm(f => ({ ...f, following_count: v }))} />
            <StatInput label="Posts Published" icon={BarChart3} value={form.posts_published} onChange={v => setForm(f => ({ ...f, posts_published: v }))} />
            <StatInput label="Impressions" icon={Eye} value={form.total_impressions} onChange={v => setForm(f => ({ ...f, total_impressions: v }))} />
            <StatInput label="Likes" icon={Heart} value={form.total_likes} onChange={v => setForm(f => ({ ...f, total_likes: v }))} />
            <StatInput label="Replies" icon={MessageCircle} value={form.total_replies} onChange={v => setForm(f => ({ ...f, total_replies: v }))} />
          </div>
          <Input
            placeholder="Notes (optional — e.g. 'thread went viral today')"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="text-sm"
          />
          <Button onClick={handleSave} disabled={isSaving} variant="viral" className="w-full sm:w-auto">
            {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : <><Plus className="h-4 w-4 mr-2" />Save Snapshot</>}
          </Button>
        </CardContent>
      </Card>

      {/* History table */}
      {snapshots.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Date</th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Followers</th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Gain</th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Posts</th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Impressions</th>
                    <th className="pb-2 font-medium text-muted-foreground text-xs">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.slice(0, 14).map(s => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-2.5 text-xs text-muted-foreground">
                        {new Date(s.snapshot_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-2.5 font-medium">{formatNumber(s.follower_count)}</td>
                      <td className="py-2.5">
                        {s.weekly_gain > 0 ? (
                          <span className="text-primary flex items-center gap-1 text-xs">
                            <ArrowUp className="h-3 w-3" />+{s.weekly_gain}
                          </span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="py-2.5 text-xs">{s.posts_published || "—"}</td>
                      <td className="py-2.5 text-xs">{formatNumber(s.total_impressions)}</td>
                      <td className="py-2.5 text-xs">{formatNumber(s.total_likes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && snapshots.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p>No snapshots yet. Log your first stats above to start tracking growth.</p>
        </div>
      )}
    </div>
  );
}
