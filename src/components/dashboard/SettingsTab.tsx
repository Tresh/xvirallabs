import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Zap, Palette, Bell, Shield, Save, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SaveStatus = "idle" | "saving" | "saved";

export function SettingsTab() {
  const { user, profile, updateProfile } = useAuth();
  const { remaining, isUnlimited, dailyLimit } = useDailyUsage();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [twitterHandle, setTwitterHandle] = useState(profile?.twitter_handle || "");
  const [primaryNiche, setPrimaryNiche] = useState(profile?.primary_niche || "");
  const [brandTone, setBrandTone] = useState<string>(profile?.brand_tone || "authoritative");
  const [growthGoal, setGrowthGoal] = useState<string>(profile?.growth_goal || "followers");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setTwitterHandle(profile.twitter_handle || "");
      setPrimaryNiche(profile.primary_niche || "");
      setBrandTone(profile.brand_tone || "authoritative");
      setGrowthGoal(profile.growth_goal || "followers");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaveStatus("saving");
    const { error } = await updateProfile({
      display_name: displayName || null,
      twitter_handle: twitterHandle || null,
      primary_niche: primaryNiche || null,
      brand_tone: brandTone,
      growth_goal: growthGoal,
    });

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
      setSaveStatus("idle");
    } else {
      toast({ title: "Settings saved" });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account & Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
            </div>
            <Badge variant="secondary" className="capitalize">{profile?.tier || "free"}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Daily Analysis Credits</p>
              <p className="text-xs text-muted-foreground">
                {isUnlimited ? "Unlimited analyses with your plan" : `${remaining} of ${dailyLimit} remaining today`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-primary">
                {isUnlimited ? "∞" : remaining}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" /> Profile
          </CardTitle>
          <CardDescription>How the AI personalizes content for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterHandle">Twitter Handle</Label>
              <Input id="twitterHandle" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@handle" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Primary Niche</Label>
            <Input id="niche" value={primaryNiche} onChange={(e) => setPrimaryNiche(e.target.value)} placeholder="e.g. AI, Fitness, Finance" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Brand Tone</Label>
              <Select value={brandTone} onValueChange={(v: string) => setBrandTone(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="witty">Witty</SelectItem>
                  <SelectItem value="provocative">Provocative</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Growth Goal</Label>
              <Select value={growthGoal} onValueChange={(v: string) => setGrowthGoal(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="followers">Grow Followers</SelectItem>
                  <SelectItem value="engagement">Boost Engagement</SelectItem>
                  <SelectItem value="monetization">Monetization</SelectItem>
                  <SelectItem value="authority">Build Authority</SelectItem>
                  <SelectItem value="community">Community Building</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} disabled={saveStatus === "saving"} variant="viral" className="gap-2 shadow-lg">
          {saveStatus === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : saveStatus === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
