"use client";

export function Spinner({ size = "md", color = "indigo" }: { size?: "sm" | "md" | "lg"; color?: string }) {
  const s = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-8 h-8 border-[3px]" };
  return (
    <div className={`${s[size]} animate-spin rounded-full border-indigo-500/20 border-t-indigo-400`} />
  );
}

export function SkeletonBlock({ className = "h-4" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function IndexingLoader({ current, progress, total }: {
  current: string; progress: number; total: number;
}) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
  return (
    <div className="space-y-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
      <div className="flex items-center gap-3">
        <Spinner />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-300 truncate">{current}</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Building vector embeddings…</p>
        </div>
        <span className="text-sm font-mono font-bold text-indigo-400 flex-shrink-0">{pct}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-600">
        <span>HuggingFace · all-MiniLM-L6-v2</span>
        <span>{progress} / {total} files</span>
      </div>
    </div>
  );
}
