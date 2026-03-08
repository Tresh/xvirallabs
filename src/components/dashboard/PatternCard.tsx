import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Trash2, 
  ChevronDown,
  Sparkles,
  Loader2,
  Copy,
  Expand
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ViralPattern } from "@/hooks/useViralMemory";

interface PatternCardProps {
  pattern: ViralPattern;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
  onIncrementUsage: (id: string) => Promise<{ error: Error | null }>;
  onExpandToLongForm?: (content: string, title: string) => void;
}

export function PatternCard({
  pattern, 
  onDelete,
  onIncrementUsage,
  onExpandToLongForm
}: PatternCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateContent = async () => {
    if (!topic.trim()) {
      toast({ title: "Please enter a topic", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const response = await supabase.functions.invoke("analyze-viral", {
        body: {
          content: `Use this viral pattern template to generate content about: "${topic}"

Pattern: ${pattern.pattern_name}
Template: ${pattern.pattern_template}
${pattern.hook_framework ? `Hook Framework: ${pattern.hook_framework}` : ""}

Generate 3 high-performing tweets using this exact pattern structure, adapted for the topic.`,
          mode: 4, // Variations mode
          niche: topic,
        },
      });

      if (response.error) throw response.error;

      // Handle streaming response
      const reader = response.data?.getReader?.();
      if (reader) {
        const decoder = new TextDecoder();
        let result = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                result += content;
                setGeneratedContent(result);
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      } else if (typeof response.data === "string") {
        setGeneratedContent(response.data);
      }

      // Increment usage count
      await onIncrementUsage(pattern.id);
      toast({ title: "Content generated!" });
    } catch (error) {
      console.error("Generation error:", error);
      toast({ 
        title: "Failed to generate content", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full text-left cursor-pointer hover:bg-secondary/30 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{pattern.pattern_name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{pattern.usage_count} uses</Badge>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3 font-mono bg-secondary/30 p-3 rounded-lg line-clamp-2">
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
          
          <CollapsibleContent className="mt-4 pt-4 border-t border-border">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Full Pattern Template</h4>
                <pre className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg whitespace-pre-wrap">
                  {pattern.pattern_template}
                </pre>
              </div>

              {pattern.hook_framework && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Hook Framework</h4>
                  <p className="text-sm text-muted-foreground">{pattern.hook_framework}</p>
                </div>
              )}

              {/* Generate Content Section */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Generate Content Using This Pattern
                </h4>
                
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Enter your topic (e.g., AI productivity, fitness tips)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateContent()}
                  />
                  <Button 
                    onClick={handleGenerateContent}
                    disabled={isGenerating || !topic.trim()}
                    variant="viral"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate
                  </Button>
                </div>

                {generatedContent && (
                  <div className="space-y-2">
                    <Textarea
                      value={generatedContent}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      {onExpandToLongForm && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onExpandToLongForm(generatedContent, topic)}
                        >
                          <Expand className="h-4 w-4 mr-2" />
                          Expand to Long-Form
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await onDelete(pattern.id);
                    toast({ title: "Pattern deleted" });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
