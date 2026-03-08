import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Loader2, 
  Copy, 
  Search,
  FileText,
  MessageSquare
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface ExpandToLongFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent: string;
  initialTitle: string;
}

type OutputFormat = "thread" | "article" | "newsletter";

export function ExpandToLongFormDialog({
  open,
  onOpenChange,
  initialContent,
  initialTitle,
}: ExpandToLongFormDialogProps) {
  const [additionalContext, setAdditionalContext] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("thread");
  const [expandedContent, setExpandedContent] = useState("");
  const [isExpanding, setIsExpanding] = useState(false);

  const handleExpand = async () => {
    setIsExpanding(true);
    setExpandedContent("");

    const formatInstructions = {
      thread: `Convert this into a viral Twitter/X thread (10-15 tweets).
- Start with a powerful hook tweet
- Each tweet should earn the next one
- Include data points, examples, and actionable insights
- End with a strong CTA
- Number format: 1/X, 2/X, etc.`,
      article: `Expand this into a full blog article (1500-2000 words).
- Compelling headline and introduction
- Well-structured sections with subheadings
- Include examples, case studies, and data where relevant
- Actionable takeaways
- Strong conclusion with next steps`,
      newsletter: `Transform this into an engaging newsletter issue.
- Catchy subject line
- Personal opening hook
- Main content with clear value
- Relevant examples and stories
- Call-to-action for readers`
    };

    try {
      const response = await supabase.functions.invoke("content-lab", {
        body: {
          action: "expand_content",
          params: {
            originalContent: initialContent,
            title: initialTitle,
            additionalContext: additionalContext,
            outputFormat: outputFormat,
            formatInstructions: formatInstructions[outputFormat],
          },
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
                setExpandedContent(result);
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      } else if (response.data?.content) {
        setExpandedContent(response.data.content);
      }

      toast({ title: "Content expanded!" });
    } catch (error) {
      console.error("Expansion error:", error);
      toast({ 
        title: "Failed to expand content", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setIsExpanding(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(expandedContent);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Expand to Long-Form Content
          </DialogTitle>
          <DialogDescription>
            Transform your short-form content into a full article, thread, or newsletter with AI research
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Content Preview */}
          <div>
            <Label className="text-sm font-medium">Original Content</Label>
            <div className="mt-2 p-3 bg-secondary/30 rounded-lg text-sm text-muted-foreground max-h-32 overflow-y-auto">
              {initialContent}
            </div>
          </div>

          {/* Output Format Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Output Format</Label>
            <RadioGroup
              value={outputFormat}
              onValueChange={(v) => setOutputFormat(v as OutputFormat)}
              className="grid grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="thread" id="thread" />
                <Label htmlFor="thread" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  Twitter Thread
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="article" id="article" />
                <Label htmlFor="article" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Blog Article
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newsletter" id="newsletter" />
                <Label htmlFor="newsletter" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Newsletter
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Additional Context */}
          <div>
            <Label htmlFor="context" className="text-sm font-medium">
              Additional Context (optional)
            </Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Add any specific points, data, or direction you want included
            </p>
            <Textarea
              id="context"
              placeholder="e.g., Include statistics about remote work productivity, mention the latest trends..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleExpand}
            disabled={isExpanding}
            variant="viral"
            className="w-full"
          >
            {isExpanding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Researching & Expanding...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Research & Expand
              </>
            )}
          </Button>

          {/* Expanded Content Result */}
          {expandedContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Expanded Content</Label>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg prose prose-sm max-w-none max-h-[400px] overflow-y-auto">
                <ReactMarkdown>{expandedContent}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
