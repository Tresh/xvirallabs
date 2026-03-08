import { useState } from "react";
import { Flag, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { ContentFlag } from "@/hooks/useAdmin";

interface ContentModerationProps {
  flags: ContentFlag[] | undefined;
  isLoading: boolean;
  onUpdateStatus: (
    flagId: string, 
    status: ContentFlag["status"], 
    notes?: string
  ) => Promise<void>;
}

const StatusBadge = ({ status }: { status: ContentFlag["status"] }) => {
  const styles = {
    pending: "bg-muted text-muted-foreground border-border",
    reviewed: "bg-primary/20 text-primary border-primary/30",
    resolved: "bg-primary/10 text-primary border-primary/20",
    dismissed: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge variant="outline" className={styles[status]}>
      {status}
    </Badge>
  );
};

const ContentTypeBadge = ({ type }: { type: ContentFlag["content_type"] }) => {
  const styles = {
    analysis: "bg-primary/20 text-primary border-primary/30",
    pattern: "bg-viral-purple/20 text-viral-purple border-viral-purple/30",
    idea: "bg-viral-success/20 text-viral-success border-viral-success/30",
  };

  return (
    <Badge variant="outline" className={styles[type]}>
      {type}
    </Badge>
  );
};

export function ContentModeration({ 
  flags, 
  isLoading, 
  onUpdateStatus 
}: ContentModerationProps) {
  const [selectedFlag, setSelectedFlag] = useState<ContentFlag | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const pendingFlags = flags?.filter((f) => f.status === "pending") || [];
  const reviewedFlags = flags?.filter((f) => f.status !== "pending") || [];

  const handleAction = async (
    flagId: string, 
    status: ContentFlag["status"]
  ) => {
    try {
      await onUpdateStatus(flagId, status, reviewNotes);
      toast({
        title: "Flag updated",
        description: `Content flag marked as ${status}`,
      });
      setIsDialogOpen(false);
      setSelectedFlag(null);
      setReviewNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update flag status",
        variant: "destructive",
      });
    }
  };

  const openReviewDialog = (flag: ContentFlag) => {
    setSelectedFlag(flag);
    setReviewNotes(flag.notes || "");
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border rounded-lg">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 border-b last:border-b-0 animate-pulse bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Flags */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-viral-warning" />
          <h3 className="text-lg font-semibold">Pending Review ({pendingFlags.length})</h3>
        </div>

        {pendingFlags.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-viral-success" />
            <p>No pending flags to review!</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <ContentTypeBadge type={flag.content_type} />
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {flag.reason}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(flag.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={flag.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReviewDialog(flag)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-viral-success hover:text-viral-success"
                          onClick={() => handleAction(flag.id, "resolved")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleAction(flag.id, "dismissed")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Review History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Review History ({reviewedFlags.length})</h3>
        </div>

        {reviewedFlags.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            <p>No review history yet</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewedFlags.slice(0, 10).map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <ContentTypeBadge type={flag.content_type} />
                    </TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">
                      {flag.reason}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={flag.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {flag.reviewed_at 
                        ? new Date(flag.reviewed_at).toLocaleDateString()
                        : "—"
                      }
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {flag.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Content Flag</DialogTitle>
            <DialogDescription>
              Review the flagged content and take appropriate action.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFlag && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Content Type</p>
                <ContentTypeBadge type={selectedFlag.content_type} />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Reason for Flag</p>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  {selectedFlag.reason}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Review Notes</p>
                <Textarea
                  placeholder="Add notes about your decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => selectedFlag && handleAction(selectedFlag.id, "dismissed")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Dismiss
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedFlag && handleAction(selectedFlag.id, "reviewed")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Mark Reviewed
            </Button>
            <Button
              onClick={() => selectedFlag && handleAction(selectedFlag.id, "resolved")}
              className="bg-viral-success hover:bg-viral-success/90"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
