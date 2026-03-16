import { Video } from "lucide-react";

export function VideoBank() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Video className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Video Bank</h2>
      <p className="text-muted-foreground">Coming soon — your AI-powered video content hub.</p>
    </div>
  );
}
