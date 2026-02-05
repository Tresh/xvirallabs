import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useViralMemory } from "@/hooks/useViralMemory";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskConical, 
  LogOut, 
  Microscope, 
  Dna, 
  Lightbulb, 
  BarChart3,
  Pin,
  Trash2,
  RefreshCw,
  ArrowRight,
  User,
  Loader2,
  Clock,
  TrendingUp
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const modeNames: Record<number, string> = {
  1: "Diagnosis",
  2: "Psychology",
  3: "Pattern",
  4: "Variations",
  5: "Forecast",
  6: "Rewrite",
  7: "Thread",
  8: "Ideas",
  9: "Brand Fit",
  10: "Summary",
};

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
    updateIdeaStatus,
    deleteIdea,
    getStats,
    fetchMemory
  } = useViralMemory();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analyses");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="font-bold text-lg">Viral Labs</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/#analyze">
              <Button variant="viral" size="sm">
                New Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
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
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Microscope className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
                  <p className="text-xs text-muted-foreground">Analyses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-viral-success/10">
                  <Dna className="h-5 w-5 text-viral-success" />
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
                <div className="p-2 rounded-lg bg-viral-warning/10">
                  <Lightbulb className="h-5 w-5 text-viral-warning" />
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
          <TabsList className="mb-6">
            <TabsTrigger value="analyses" className="flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              Analyses
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Dna className="h-4 w-4" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="ideas" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Idea Vault
            </TabsTrigger>
          </TabsList>

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
                  <Link to="/#analyze">
                    <Button variant="viral">
                      Analyze Your First Tweet
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Pinned first */}
                {analyses
                  .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                  .map((analysis) => (
                    <Card key={analysis.id} className={`bg-card/50 ${analysis.is_pinned ? 'border-primary/50' : ''}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{modeNames[analysis.mode_used]}</Badge>
                              {analysis.is_pinned && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                  <Pin className="h-3 w-3 mr-1" />
                                  Pinned
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(analysis.created_at), "MMM d, yyyy")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {analysis.original_post}
                            </p>
                            {analysis.identified_hook && (
                              <p className="text-xs">
                                <span className="text-muted-foreground">Hook: </span>
                                <span className="text-primary">{analysis.identified_hook}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePinAnalysis(analysis.id)}
                            >
                              <Pin className={`h-4 w-4 ${analysis.is_pinned ? 'text-primary' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                await deleteAnalysis(analysis.id);
                                toast({ title: "Analysis deleted" });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                  <Card key={pattern.id} className="bg-card/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{pattern.pattern_name}</CardTitle>
                        <Badge variant="secondary">{pattern.usage_count} uses</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 font-mono bg-secondary/30 p-3 rounded-lg">
                        {pattern.pattern_template}
                      </p>
                      {pattern.best_for_niches.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {pattern.best_for_niches.map((niche) => (
                            <Badge key={niche} variant="outline" className="text-xs">
                              {niche}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await deletePattern(pattern.id);
                            toast({ title: "Pattern deleted" });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                  <Card key={idea.id} className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant={
                                idea.idea_status === "unused" ? "default" :
                                idea.idea_status === "drafted" ? "secondary" :
                                idea.idea_status === "posted" ? "outline" : "destructive"
                              }
                            >
                              {idea.idea_status}
                            </Badge>
                            {idea.hook_type && (
                              <Badge variant="outline">{idea.hook_type}</Badge>
                            )}
                          </div>
                          <h4 className="font-medium mb-1">{idea.idea_title}</h4>
                          {idea.idea_content && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {idea.idea_content}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={idea.idea_status}
                            onChange={(e) => updateIdeaStatus(idea.id, e.target.value as any)}
                            className="text-xs bg-secondary border-border rounded px-2 py-1"
                          >
                            <option value="unused">Unused</option>
                            <option value="drafted">Drafted</option>
                            <option value="posted">Posted</option>
                            <option value="archived">Archived</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              await deleteIdea(idea.id);
                              toast({ title: "Idea deleted" });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
    </div>
  );
}
