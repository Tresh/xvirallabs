import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useViralMemory } from "@/hooks/useViralMemory";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UsageIndicator } from "@/components/analyze/UsageIndicator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { PricingPlans } from "@/components/dashboard/PricingPlans";
import { ContentLabTab } from "@/components/content-lab/ContentLabTab";
import { ExpandToLongFormDialog } from "@/components/dashboard/ExpandToLongFormDialog";
import { DailyFeed } from "@/components/dashboard/DailyFeed";
import { GrowthTracker } from "@/components/dashboard/GrowthTracker";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { UnifiedAnalysesTab } from "@/components/dashboard/UnifiedAnalysesTab";
import { AnalyzeTab } from "@/components/dashboard/AnalyzeTab";
import { ContentOS } from "@/components/dashboard/ContentOS";
import { VideoBank } from "@/components/dashboard/VideoBank";
import { SalesEngine } from "@/components/dashboard/SalesEngine";
import { MemoryTab } from "@/components/dashboard/MemoryTab";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { remaining, isUnlimited, isLoading: usageLoading, dailyLimit } = useDailyUsage();
  const {
    analyses,
    patterns,
    ideas,
    isLoading,
    deleteAnalysis,
    togglePinAnalysis,
    deletePattern,
    incrementPatternUsage,
    updateIdeaStatus,
    deleteIdea,
    fetchMemory,
  } = useViralMemory();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("dashboard-tab") || "daily-feed");
  const [expandDialogOpen, setExpandDialogOpen] = useState(false);
  const [expandContent, setExpandContent] = useState("");
  const [expandTitle, setExpandTitle] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const handler = (e: any) => setActiveTab(e.detail);
    window.addEventListener("switch-tab", handler);
    return () => window.removeEventListener("switch-tab", handler);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("dashboard-tab", activeTab);
  }, [activeTab]);

  const handleExpandToLongForm = (content: string, title: string) => {
    setExpandContent(content);
    setExpandTitle(title);
    setExpandDialogOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading your lab...</span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          memoryCounts={{ analyses: analyses.length, patterns: patterns.length, ideas: ideas.length }}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50 px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              {user && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate max-w-[150px]">{user.email}</span>
                  <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{user.id.slice(0, 8)}</span>
                </div>
              )}
            </div>
            <UsageIndicator
              remaining={remaining}
              isUnlimited={isUnlimited}
              isLoading={usageLoading}
              dailyLimit={dailyLimit}
            />
          </header>

          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {activeTab === "daily-feed" && <DailyFeed />}
            {activeTab === "content-os" && <ContentOS />}
            {activeTab === "video-bank" && <VideoBank />}
            {activeTab === "memory" && <MemoryTab />}
            {activeTab === "analyze" && <AnalyzeTab />}
            {activeTab === "growth" && <GrowthTracker />}
            {activeTab === "content-lab" && <ContentLabTab />}
            {activeTab === "settings" && <SettingsTab />}
            {activeTab === "plans" && <PricingPlans />}
            {activeTab === "analyses" && (
              <UnifiedAnalysesTab
                analyses={analyses}
                patterns={patterns}
                ideas={ideas}
                isLoading={isLoading}
                onTogglePin={togglePinAnalysis}
                onDeleteAnalysis={deleteAnalysis}
                onDeletePattern={deletePattern}
                onIncrementUsage={incrementPatternUsage}
                onUpdateIdeaStatus={updateIdeaStatus}
                onDeleteIdea={deleteIdea}
                onExpandToLongForm={handleExpandToLongForm}
                onRefresh={fetchMemory}
              />
            )}
          </main>
        </div>
      </div>

      <ExpandToLongFormDialog
        open={expandDialogOpen}
        onOpenChange={setExpandDialogOpen}
        initialContent={expandContent}
        initialTitle={expandTitle}
      />
    </SidebarProvider>
  );
}
