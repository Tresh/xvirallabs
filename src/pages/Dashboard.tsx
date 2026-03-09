import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useViralMemory } from "@/hooks/useViralMemory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Microscope, 
  Dna, 
  Lightbulb, 
  BarChart3,
  RefreshCw,
  ArrowRight,
  Loader2,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { PricingPlans } from "@/components/dashboard/PricingPlans";
import { ContentLabTab } from "@/components/content-lab/ContentLabTab";
import { MemoryTab } from "@/components/dashboard/MemoryTab";
import { AnalysisCard } from "@/components/dashboard/AnalysisCard";
import { PatternCard } from "@/components/dashboard/PatternCard";
import { IdeaCard } from "@/components/dashboard/IdeaCard";
import { ExpandToLongFormDialog } from "@/components/dashboard/ExpandToLongFormDialog";

export default function Dashboard() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const { 
    analyses, patterns, ideas, isLoading, 
    deleteAnalysis, togglePinAnalysis, deletePattern,
    incrementPatternUsage, updateIdeaStatus, deleteIdea,
    getStats, fetchMemory
  } = useViralMemory();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("content-lab");
  const [expandDialogOpen, setExpandDialogOpen] = useState(false);
  const [expandContent, setExpandContent] = useState("");
  const [expandTitle, setExpandTitle] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleExpandToLongForm = (content: string, title: string) => {
    setExpandContent(content);
    setExpandTitle(title);
    setExpandDialogOpen(true);
  };

  const stats = getStats();

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
          onSignOut={handleSignOut}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50 px-4">
            <SidebarTrigger />
            <Link to="/analyze">
              <Button variant="viral" size="sm" className="gap-2">
                New Analysis
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </header>

          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Microscope className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
                      <p className="text-xs text-muted-foreground">Analyses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Dna className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalPatterns}</p>
                      <p className="text-xs text-muted-foreground">Patterns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Lightbulb className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.unusedIdeas}</p>
                      <p className="text-xs text-muted-foreground">Ready Ideas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <TrendingUp className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.avgReplyPotential}/10</p>
                      <p className="text-xs text-muted-foreground">Avg Reply Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Card */}
            {stats.mostUsedHook && (
              <Card className="mb-8 border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-secondary">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Your Viral DNA</h3>
                      <p className="text-sm text-muted-foreground">
                        Your most analyzed hook type is <span className="text-primary font-medium">{stats.mostUsedHook}</span>.
                        {stats.avgBookmarkPotential > 7 
                          ? " You're attracted to highly bookmarkable content!"
                          : " Consider studying more posts with high bookmark potential."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab Content */}
            {activeTab === "content-lab" && <ContentLabTab />}

            {activeTab === "analyses" && (
              analyses.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Microscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No analyses yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start by analyzing a viral tweet to build your library
                    </p>
                    <Link to="/analyze">
                      <Button variant="viral">
                        Analyze Your First Tweet
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {analyses
                    .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                    .map((analysis) => (
                      <AnalysisCard
                        key={analysis.id}
                        analysis={analysis}
                        onTogglePin={togglePinAnalysis}
                        onDelete={deleteAnalysis}
                        onExpandToLongForm={handleExpandToLongForm}
                      />
                    ))}
                </div>
              )
            )}

            {activeTab === "patterns" && (
              patterns.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Dna className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No patterns saved</h3>
                    <p className="text-sm text-muted-foreground">
                      Use Mode 3 (Extract Pattern) and save your findings
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {patterns.map((pattern) => (
                    <PatternCard
                      key={pattern.id}
                      pattern={pattern}
                      onDelete={deletePattern}
                      onIncrementUsage={incrementPatternUsage}
                      onExpandToLongForm={handleExpandToLongForm}
                    />
                  ))}
                </div>
              )
            )}

            {activeTab === "ideas" && (
              ideas.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Idea vault is empty</h3>
                    <p className="text-sm text-muted-foreground">
                      Use Mode 8 (Ideas) to generate viral content ideas
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {ideas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onUpdateStatus={updateIdeaStatus}
                      onDelete={deleteIdea}
                      onExpandToLongForm={handleExpandToLongForm}
                    />
                  ))}
                </div>
              )
            )}

            {activeTab === "memory" && <MemoryTab />}

            {activeTab === "plans" && <PricingPlans />}

            {/* Refresh */}
            <div className="mt-8 text-center">
              <Button variant="ghost" onClick={fetchMemory} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
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
