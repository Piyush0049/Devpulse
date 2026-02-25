"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import type { FileRisk } from "@/types";

const COLORS = { low: "#10b981", medium: "#f59e0b", high: "#ef4444", critical: "#dc2626" };

const HeatmapCell = (props: {
  x?: number; y?: number; width?: number; height?: number;
  name?: string; riskLevel?: string;
}) => {
  const { x=0, y=0, width=0, height=0, name, riskLevel="low" } = props;
  const c = COLORS[riskLevel as keyof typeof COLORS] || COLORS.low;
  if (width < 18 || height < 18) return null;
  const label = name?.split("/").pop() || "";
  return (
    <g>
      <rect x={x+1} y={y+1} width={width-2} height={height-2} rx={5}
        fill={c} fillOpacity={0.13} stroke={c} strokeOpacity={0.35} strokeWidth={1} />
      {width > 55 && height > 26 && (
        <text x={x+width/2} y={y+height/2} textAnchor="middle" dominantBaseline="middle"
          fill={c} fontSize={9.5} fontWeight={600} fontFamily="Poppins,sans-serif" opacity={0.9}>
          {label.length > 18 ? label.slice(0,16) + "…" : label}
        </text>
      )}
    </g>
  );
};

const HeatmapTip = ({ active, payload }: {
  active?: boolean; payload?: Array<{ payload: FileRisk & { value: number } }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const c = COLORS[d.riskLevel];
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs border border-white/10 max-w-[200px]">
      <p className="text-slate-200 font-semibold truncate mb-1">{d.path}</p>
      <p className="text-slate-400">Score: <span className="font-bold text-slate-200">{d.riskScore}</span></p>
      <p>Level: <span className="font-bold" style={{ color: c }}>{d.riskLevel}</span></p>
      <p className="text-slate-400">Lines: {d.lines}</p>
    </div>
  );
};

export function RiskHeatmap({ risks }: { risks: FileRisk[] }) {
  if (!risks?.length) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-600 text-sm">
        No risk data — connect a repository first
      </div>
    );
  }

  const data = risks.slice(0, 45).map(r => ({
    ...r, name: r.path, value: Math.max(8, r.riskScore),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <Treemap data={data} dataKey="value" aspectRatio={16/9} content={<HeatmapCell />}>
        <Tooltip content={<HeatmapTip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}
