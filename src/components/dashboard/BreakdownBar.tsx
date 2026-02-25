"use client";

const METRICS = [
  { key: "codeQuality", label: "Code Quality", color: "#818cf8" },
  { key: "riskLevel", label: "Risk Level", color: "#22d3ee" },
  { key: "velocity", label: "Velocity", color: "#34d399" },
  { key: "techDebt", label: "Tech Debt", color: "#fbbf24" },
  { key: "coverage", label: "Coverage", color: "#a78bfa" },
] as const;

export function BreakdownBar({ breakdown }: {
  breakdown: { codeQuality: number; riskLevel: number; velocity: number; techDebt: number; coverage: number };
}) {
  return (
    <div className="space-y-3">
      {METRICS.map(({ key, label, color }) => {
        const v = breakdown[key];
        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</span>
              <span className="text-[10px] font-mono font-black" style={{ color }}>{v}%</span>
            </div>
            <div className="h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${v}%`, background: color, boxShadow: `0 0 6px ${color}60`, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
