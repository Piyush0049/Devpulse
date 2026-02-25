"use client";

const COLORS = ["#10b981", "#34d399", "#2dd4bf", "#22d3ee", "#059669", "#047857", "#06b6d4", "#0891b2"];

export function LanguageChart({ languages }: {
  languages: Array<{ name: string; count: number; percentage: number }>;
}) {
  if (!languages?.length) {
    return <div className="h-24 flex items-center justify-center text-slate-600 text-sm">No data</div>;
  }

  return (
    <div className="space-y-2">
      {languages.slice(0, 6).map((lang, i) => (
        <div key={lang.name} className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
          <span className="text-[11px] text-slate-400 w-24 truncate font-medium">{lang.name}</span>
          <div className="flex-1 h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${lang.percentage}%`, background: COLORS[i % COLORS.length], transition: "width 1s ease" }}
            />
          </div>
          <span className="text-[10px] text-slate-600 w-8 text-right font-mono">{lang.percentage}%</span>
        </div>
      ))}
    </div>
  );
}
