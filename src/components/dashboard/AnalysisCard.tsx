import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Pin, 
  Trash2, 
  Clock, 
  ChevronDown,
  Expand,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import type { ViralAnalysis } from "@/hooks/useViralMemory";
import ReactMarkdown from "react-markdown";

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

interface AnalysisCardProps {
  analysis: ViralAnalysis;
  onTogglePin: (id: string) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
  onExpandToLongForm?: (content: string, title: string) => void;
}

export function AnalysisCard({
  analysis, 
  onTogglePin, 
  onDelete,
  onExpandToLongForm
}: AnalysisCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`${analysis.is_pinned ? 'border-foreground/30' : ''}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <CollapsibleTrigger className="flex-1 min-w-0 text-left cursor-pointer hover:bg-secondary/30 -m-2 p-2 rounded-lg transition-colors">
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
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
            </CollapsibleTrigger>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(analysis.id);
                }}
              >
                <Pin className={`h-4 w-4 ${analysis.is_pinned ? 'text-primary' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={async (e) => {
                  e.stopPropagation();
                  await onDelete(analysis.id);
                  toast({ title: "Analysis deleted" });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          
          <CollapsibleContent className="mt-4 pt-4 border-t border-border">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Original Post</h4>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {analysis.original_post}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Analysis Result</h4>
                <div className="text-sm prose prose-sm max-w-none bg-secondary/50 p-3 rounded-lg">
                  <ReactMarkdown>{analysis.analysis_result}</ReactMarkdown>
                </div>
              </div>

              {analysis.psychology_triggers?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Psychology Triggers</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.psychology_triggers.map((trigger, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.viral_pattern && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Viral Pattern</h4>
                  <p className="text-sm text-muted-foreground">{analysis.viral_pattern}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {analysis.reply_potential && (
                  <Badge variant="secondary">Reply: {analysis.reply_potential}/10</Badge>
                )}
                {analysis.bookmark_potential && (
                  <Badge variant="secondary">Bookmark: {analysis.bookmark_potential}/10</Badge>
                )}
                {analysis.dwell_time_score && (
                  <Badge variant="secondary">Dwell: {analysis.dwell_time_score}</Badge>
                )}
              </div>

              {onExpandToLongForm && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onExpandToLongForm(
                    analysis.analysis_result, 
                    analysis.identified_hook || "Content"
                  )}
                  className="mt-2"
                >
                  <Expand className="h-4 w-4 mr-2" />
                  Expand to Long-Form
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
