"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { SkeletonBlock } from "@/components/ui/Loader";
import {
  RiSpeedUpFill, RiFileCodeFill, RiMessage3Fill, RiStackFill,
  RiCodeSSlashFill, RiStockFill, RiArrowRightSLine,
  RiInformationFill, RiPulseFill, RiShieldFlashFill, RiLayoutGridFill
} from "react-icons/ri";
import { clsx } from "clsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import type { TechDebtItem } from "@/types";

const TYPE_ICONS: Record<string, React.ElementType> = {
  "long-file": RiFileCodeFill, complexity: RiStackFill, todo: RiMessage3Fill, duplicate: RiCodeSSlashFill, "dead-code": RiCodeSSlashFill,
};

const TYPE_LABELS: Record<string, string> = {
  "long-file": "Structural Mass", complexity: "Cyclomatic Index", todo: "Pending Logic", duplicate: "Redundancy", "dead-code": "Type Entropy",
};

const SEV_STYLES = {
  high: { cls: "border-red-500/20 bg-red-500/5 text-red-50", icon: "text-red-400", bg: "bg-red-500/10" },
  medium: { cls: "border-amber-500/20 bg-amber-500/5 text-amber-50", icon: "text-amber-400", bg: "bg-amber-500/10" },
  low: { cls: "border-white/[0.05] bg-white/[0.02] text-slate-300", icon: "text-slate-500", bg: "bg-white/5" },
} as const;

const BAR_COLORS = ["#10b981", "#34d399", "#059669", "#047857", "#06b6d4"];

const CustomTip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-[14px] px-3.5 py-2 text-[10px] border border-white/10 shadow-2xl">
      <p className="text-slate-500 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white font-black">{payload[0].value} <span className="text-slate-600">INCIDENTS</span></p>
    </div>
  );
};

export default function DebtPage() {
  const [items, setItems] = useState<TechDebtItem[]>([]);
  const [summary, setSummary] = useState<{ total: number; high: number; medium: number; low: number; byType: Record<string, number>; debtScore: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");

  useEffect(() => {
    fetch("/api/debt").then(r => r.json()).then(d => {
      setItems(d.items || []);
      setSummary(d.summary || null);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i =>
    (typeFilter === "all" || i.type === typeFilter) &&
    (sevFilter === "all" || i.severity === sevFilter)
  );

  const chartData = summary
    ? Object.entries(summary.byType).filter(([, v]) => v > 0).map(([t, c], i) => ({ type: TYPE_LABELS[t] || t, count: c, idx: i }))
    : [];

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8 pb-20"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/[0.05]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black tracking-widest text-emerald-400 uppercase">
              <RiInformationFill className="animate-pulse" /> Entropy Audit Active
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">
              Tech <span className="text-emerald-500">Entropy.</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 max-w-lg leading-relaxed tracking-tight">
              Measuring systemic degradation and architectural debt through heuristic pattern recognition.
            </p>
          </div>

          <div className="flex gap-2">
            {[summary?.high, summary?.medium, summary?.low].map((val, i) => (
              <div key={i} className="px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center min-w-[80px]">
                <span className="text-lg font-black text-white leading-none">{val || 0}</span>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">{i === 0 ? "Crit" : i === 1 ? "Warn" : "Info"}</span>
              </div>
            ))}
          </div>
        </header>

        {/* Global Mesh Effect */}
        <div className="fixed inset-0 glow-mesh opacity-10 pointer-events-none" />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Debt Meter */}
          <section className="xl:col-span-4 glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Systemic Debt Index</h3>

            <div className="relative mb-6">
              <svg width="200" height="120" viewBox="0 0 120 70">
                <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" strokeLinecap="round" />
                <motion.path
                  initial={{ strokeDasharray: "0 157" }}
                  animate={{ strokeDasharray: `${(summary?.debtScore || 0 / 100) * 157} 157` }}
                  d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 12px rgba(16,185,129,0.4))" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <span className="text-4xl font-black text-white tabular-nums leading-none tracking-tighter">{summary?.debtScore}</span>
                <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-tighter mt-1">HCP Index</span>
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-500 max-w-[180px] leading-relaxed">
              Global instability metric based on cyclomatic complexity and cross-module redundancy.
            </p>
          </section>

          {/* Type Distribution */}
          <section className="xl:col-span-8 glass-card p-8">
            <div className="flex items-center gap-3 mb-8">
              <RiLayoutGridFill className="text-emerald-500 w-5 h-5" />
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Entropy Distribution</h3>
            </div>
            <div className="h-[180px]">
              {loading ? <SkeletonBlock className="h-full rounded-2xl" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                    <CartesianGrid strokeDasharray="4 8" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="type" tick={{ fontSize: 9, fill: "#475569", fontWeight: 900 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#475569" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((d, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.7} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-6 p-2">
          <div className="flex gap-1 bg-white/[0.02] border border-white/[0.05] p-1 rounded-2xl">
            {["all", "long-file", "complexity", "todo", "dead-code"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={clsx("text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all",
                  typeFilter === t ? "bg-emerald-600 text-white shadow-lg" : "text-slate-600 hover:text-slate-300"
                )}>
                {t === "all" ? "Neural All" : TYPE_LABELS[t] || t}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white/[0.02] border border-white/[0.05] p-1 rounded-2xl">
            {["all", "high", "medium", "low"].map(s => (
              <button key={s} onClick={() => setSevFilter(s)}
                className={clsx("text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all",
                  sevFilter === s ? "bg-emerald-600 text-white shadow-lg" : "text-slate-600 hover:text-slate-300"
                )}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Neural Stream Area */}
        <section className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-20 glass-card animate-pulse" />)
            ) : filtered.length === 0 ? (
              <div className="glass-card py-20 text-center">
                <RiStockFill className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Clean state reached. Entropy nominal.</p>
              </div>
            ) : (
              filtered.map(item => {
                const Icon = TYPE_ICONS[item.type] || RiCodeSSlashFill;
                const s = SEV_STYLES[item.severity];
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={item.id}
                    className={clsx("glass-card group p-5 flex gap-6 transition-all duration-500 hover:translate-x-1", s.cls)}
                  >
                    <div className={clsx("w-12 h-12 rounded-[18px] flex items-center justify-center flex-shrink-0 border shadow-inner transition-all group-hover:scale-110", s.bg, s.cls.split(' ')[0])}>
                      <Icon className={clsx("w-6 h-6", s.icon)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-[10px] text-cyan-400 font-mono font-medium px-2 py-0.5 rounded bg-cyan-400/5 border border-cyan-400/10 truncate">
                          {item.path}{item.line && `:${item.line}`}
                        </code>
                        <span className={clsx("text-[8px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest",
                          item.severity === "high" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            item.severity === "medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                              "bg-white/5 border-white/10 text-slate-600"
                        )}>{item.severity} severity</span>
                      </div>
                      <h4 className="text-sm font-black text-white tracking-tight mb-1.5">{item.description}</h4>
                      <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                        <RiArrowRightSLine className="w-4 h-4 text-indigo-500" />
                        <p className="text-[11px] font-medium leading-relaxed">{item.suggestion}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right space-y-1 pr-2">
                      <p className="text-2xl font-black text-white leading-none tabular-nums">{item.debtScore}</p>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Entropy Pts</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </section>
      </motion.div>
    </AppLayout>
  );
}
