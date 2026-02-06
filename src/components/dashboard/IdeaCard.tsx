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
  Trash2, 
  ChevronDown,
  Expand
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { IdeaVaultItem } from "@/hooks/useViralMemory";

interface IdeaCardProps {
  idea: IdeaVaultItem;
  onUpdateStatus: (id: string, status: IdeaVaultItem["idea_status"]) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
  onExpandToLongForm?: (content: string, title: string) => void;
}

export function IdeaCard({
  idea, 
  onUpdateStatus, 
  onDelete,
  onExpandToLongForm
}: IdeaCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card/50">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <CollapsibleTrigger className="flex-1 text-left cursor-pointer hover:bg-secondary/30 -m-2 p-2 rounded-lg transition-colors">
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
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
              <h4 className="font-medium mb-1">{idea.idea_title}</h4>
              {idea.idea_content && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {idea.idea_content}
                </p>
              )}
            </CollapsibleTrigger>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={idea.idea_status}
                onChange={(e) => onUpdateStatus(idea.id, e.target.value as IdeaVaultItem["idea_status"])}
                onClick={(e) => e.stopPropagation()}
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
                onClick={async (e) => {
                  e.stopPropagation();
                  await onDelete(idea.id);
                  toast({ title: "Idea deleted" });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          
          <CollapsibleContent className="mt-4 pt-4 border-t border-border">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Full Idea</h4>
                <div className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg whitespace-pre-wrap">
                  {idea.idea_content || idea.idea_title}
                </div>
              </div>

              {idea.emotion_trigger && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Emotion Trigger</h4>
                  <Badge variant="outline">{idea.emotion_trigger}</Badge>
                </div>
              )}

              {idea.hook_type && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Hook Type</h4>
                  <Badge variant="secondary">{idea.hook_type}</Badge>
                </div>
              )}

              {onExpandToLongForm && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onExpandToLongForm(
                    idea.idea_content || idea.idea_title, 
                    idea.idea_title
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
