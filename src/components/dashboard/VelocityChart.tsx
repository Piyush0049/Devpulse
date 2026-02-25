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
  if (!data?.length) {
    return (
      <div className="h-28 flex items-center justify-center text-slate-600 text-sm">
        No commit history available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={110}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} />
        <Tooltip content={<Tip />} />
        <Area type="monotone" dataKey="commits" name="Commits"
          stroke="#10b981" strokeWidth={2.5} fill="url(#vGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
