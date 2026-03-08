import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useViralMemory } from "@/hooks/useViralMemory";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, 
  Microscope, 
  Dna, 
  Lightbulb, 
  BarChart3,
  RefreshCw,
  ArrowRight,
  User,
  Loader2,
  TrendingUp,
  CreditCard,
  Calendar
} from "lucide-react";
import { PricingPlans } from "@/components/dashboard/PricingPlans";
import { ContentLabTab } from "@/components/content-lab/ContentLabTab";
import { AnalyzeDialog } from "@/components/dashboard/AnalyzeDialog";
import { AnalysisCard } from "@/components/dashboard/AnalysisCard";
import { PatternCard } from "@/components/dashboard/PatternCard";
import { IdeaCard } from "@/components/dashboard/IdeaCard";
import { ExpandToLongFormDialog } from "@/components/dashboard/ExpandToLongFormDialog";

export default function Dashboard() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
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
    getStats,
    fetchMemory
  } = useViralMemory();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("content-lab");
  
  // Expand to long-form dialog state
  const [expandDialogOpen, setExpandDialogOpen] = useState(false);
  const [expandContent, setExpandContent] = useState("");
  const [expandTitle, setExpandTitle] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="font-bold text-lg">Viral Labs</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <AnalyzeDialog onAnalysisComplete={() => fetchMemory()}>
              <Button variant="viral" size="sm">
                New Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </AnalyzeDialog>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{profile?.email}</span>
              <Badge variant="outline" className="capitalize">{profile?.tier}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Viral Lab</h1>
          <p className="text-muted-foreground">Your personal virality intelligence center</p>
        </div>

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
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Lightbulb className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unusedIdeas}</p>
                  <p className="text-xs text-muted-foreground">Ready Ideas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
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
          <Card className="mb-8 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="content-lab" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Content Lab</span>
            </TabsTrigger>
            <TabsTrigger value="analyses" className="flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              <span className="hidden sm:inline">Analyses</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Dna className="h-4 w-4" />
              <span className="hidden sm:inline">Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="ideas" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Plans</span>
            </TabsTrigger>
          </TabsList>

          {/* Content Lab Tab */}
          <TabsContent value="content-lab">
            <ContentLabTab />
          </TabsContent>

          {/* Analyses Tab */}
          <TabsContent value="analyses">
            {analyses.length === 0 ? (
              <Card className="bg-card/50">
                <CardContent className="pt-6 text-center py-12">
                  <Microscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No analyses yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by analyzing a viral tweet to build your library
                  </p>
                  <AnalyzeDialog onAnalysisComplete={() => fetchMemory()}>
                    <Button variant="viral">
                      Analyze Your First Tweet
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </AnalyzeDialog>
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
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns">
            {patterns.length === 0 ? (
              <Card className="bg-card/50">
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
            )}
          </TabsContent>

          {/* Ideas Tab */}
          <TabsContent value="ideas">
            {ideas.length === 0 ? (
              <Card className="bg-card/50">
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
            )}
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <PricingPlans />
          </TabsContent>
        </Tabs>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={fetchMemory} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </main>

      {/* Expand to Long-Form Dialog */}
      <ExpandToLongFormDialog
        open={expandDialogOpen}
        onOpenChange={setExpandDialogOpen}
        initialContent={expandContent}
        initialTitle={expandTitle}
      />
    </div>
  );
}
