import { Atom } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
        <div className="relative bg-gradient-to-br from-primary to-viral-success p-2.5 rounded-xl">
          <Atom className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-foreground">
          Viral<span className="text-gradient-primary">Labs</span>
        </span>
        <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
          Twitter/X Analysis
        </span>
      </div>
    </div>
  );
}
