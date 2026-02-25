"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Tip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg px-2.5 py-1.5 text-[10px] border border-emerald-500/10">
      <p className="text-slate-500 mb-1 font-black uppercase tracking-widest">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center justify-between gap-3 font-bold">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-slate-200">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function VelocityChart({ data }: { data: Array<{ week: string; commits: number }> }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 animate-[spin_10s_linear_infinite]" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Retrieving Temporal Data...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 10, bottom: 20, left: -20 }}>
        <defs>
          <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 9, fill: "#475569", fontWeight: 700 }}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#475569", fontWeight: 700 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(16, 185, 129, 0.2)', strokeWidth: 2 }} />
        <Area
          type="monotone"
          dataKey="commits"
          name="Commits"
          stroke="#10b981"
          strokeWidth={3}
          fill="url(#vGrad)"
          dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#030307" }}
          activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
