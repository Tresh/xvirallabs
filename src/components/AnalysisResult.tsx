import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { Copy, Download, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AnalysisResultProps {
  result: string;
  isAnalyzing: boolean;
  mode: number;
  onReset: () => void;
}

const modeNames: Record<number, string> = {
  1: "Viral Diagnosis",
  2: "Psychology Deconstruction",
  3: "Pattern Extraction",
  4: "Viral Variations",
  5: "Engagement Forecast",
  6: "Virality Rewrite",
  7: "Thread Conversion",
  8: "Idea Engine",
  9: "Brand Alignment",
  10: "Lab Summary",
};

export function AnalysisResult({ result, isAnalyzing, mode, onReset }: AnalysisResultProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    toast({
      title: "Copied!",
      description: "Analysis copied to clipboard",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `viral-labs-${modeNames[mode].toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Analysis saved as markdown file",
    });
  };

  if (!result && !isAnalyzing) return null;

  return (
    <div className="mt-8 max-w-4xl mx-auto animate-fade-in">
      <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {modeNames[mode]} Results
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                MODE {mode}
              </p>
            </div>
          </div>
          
          {!isAnalyzing && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onReset}>
                <RefreshCw className="h-4 w-4" />
                New Analysis
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-foreground mt-6 mb-4 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-foreground mt-5 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full" />
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-muted-foreground leading-relaxed mb-3">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="space-y-2 mb-4">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{children}</span>
                </li>
              ),
              ol: ({ children }) => (
                <ol className="space-y-2 mb-4 list-decimal list-inside">{children}</ol>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="text-primary italic">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-primary pl-4 my-4 italic text-muted-foreground bg-secondary/30 py-2 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="px-2 py-1 bg-secondary rounded text-sm font-mono text-primary">
                  {children}
                </code>
              ),
            }}
          >
            {result}
          </ReactMarkdown>
          
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-primary mt-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-mono">Analyzing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}