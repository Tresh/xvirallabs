import { useState, useCallback } from "react";

interface AnalysisState {
  isAnalyzing: boolean;
  result: string;
  error: string | null;
}

export function useViralAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    result: "",
    error: null,
  });

  const analyze = useCallback(async (content: string, mode: number, niche?: string) => {
    setState({ isAnalyzing: true, result: "", error: null });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-viral`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ content, mode, niche }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResult = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResult += content;
              setState((prev) => ({ ...prev, result: fullResult }));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setState((prev) => ({ ...prev, isAnalyzing: false }));
    } catch (error) {
      setState({
        isAnalyzing: false,
        result: "",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isAnalyzing: false, result: "", error: null });
  }, []);

  return {
    ...state,
    analyze,
    reset,
  };
}