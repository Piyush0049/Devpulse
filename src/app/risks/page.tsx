"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { RiskBadge } from "@/components/ui/Badge";
import { SkeletonBlock } from "@/components/ui/Loader";
import { RiskHeatmap } from "@/components/dashboard/RiskHeatmap";
import {
  RiAlertFill, RiFileCodeFill, RiStockFill,
  RiArrowUpDownLine, RiPulseFill, RiShieldFlashFill,
  RiLayoutGridFill, RiListUnordered
} from "react-icons/ri";
import { clsx } from "clsx";
import type { FileRisk } from "@/types";

const FACTOR_COLORS: Record<string, string> = {
  complexity: "#818cf8",
  churn: "#22d3ee",
  size: "#fbbf24",
  coverage: "#34d399",
  issues: "#f87171",
};

export default function RisksPage() {
  const [risks, setRisks] = useState<FileRisk[]>([]);
  const [summary, setSummary] = useState<{ critical: number; high: number; medium: number; low: number; avgScore: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<"riskScore" | "lines">("riskScore");

  useEffect(() => {
    fetch("/api/risks").then(r => r.json()).then(d => {
      setRisks(d.risks || []);
      setSummary(d.summary || null);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = risks
    .filter(r => filter === "all" || r.riskLevel === filter)
    .sort((a, b) => sort === "riskScore" ? b.riskScore - a.riskScore : b.lines - a.lines);

  const LEVELS = [
    { level: "critical", count: summary?.critical || 0, cls: "border-red-500/20 bg-red-500/5 text-red-400", glow: "shadow-[0_0_30px_rgba(239,68,68,0.1)]" },
    { level: "high", count: summary?.high || 0, cls: "border-orange-500/20 bg-orange-500/5 text-orange-400", glow: "shadow-[0_0_30px_rgba(249,115,22,0.1)]" },
    { level: "medium", count: summary?.medium || 0, cls: "border-amber-500/20 bg-amber-500/5 text-amber-400", glow: "shadow-[0_0_30px_rgba(245,158,11,0.1)]" },
    { level: "low", count: summary?.low || 0, cls: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400", glow: "shadow-[0_0_30px_rgba(16,185,129,0.1)]" },
  ];

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-20"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/[0.05]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black tracking-widest text-red-400 uppercase">
              <RiShieldFlashFill className="animate-pulse" /> Threat Analysis Active
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white leading-tight">
              Risk <span className="text-emerald-500">Radar.</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 max-w-lg leading-relaxed tracking-tight">
              Multidimensional threat scoring based on semantic complexity, code churn, and architectural patterns.
            </p>
          </div>

          {!loading && summary && (
            <div className="flex items-center gap-4 px-5 py-3 rounded-[20px] bg-white/[0.03] border border-white/[0.08]">
              <RiPulseFill className="text-emerald-500 w-5 h-5 animate-pulse" />
              <div className="text-left">
                <span className="block text-[10px] font-black text-slate-500 tracking-widest uppercase">Avg Risk Score</span>
                <span className="block text-xl font-black text-white">{summary.avgScore.toFixed(1)}</span>
              </div>
            </div>
          )}
        </header>

        {/* Global Mesh Effect */}
        <div className="fixed inset-0 glow-mesh opacity-10 pointer-events-none" />

        {/* Summary Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatePresence mode="wait">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-24 glass-card animate-pulse" />)
            ) : (
              LEVELS.map(({ level, count, cls, glow }) => (
                <motion.button
                  key={level}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setFilter(filter === level ? "all" : level)}
                  className={clsx(
                    "relative group overflow-hidden rounded-[24px] border px-6 py-5 text-left transition-all duration-500 shadow-2xl",
                    cls, glow,
                    filter === level ? "ring-2 ring-white/20 scale-105 z-10" : "hover:bg-white/[0.02] hover:scale-102"
                  )}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] -rotate-45 translate-x-12 -translate-y-12" />
                  <p className="text-4xl font-black tracking-tighter leading-none">{count}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60">{level}</p>
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Primary Insight Row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Heatmap Visualization */}
          <section className="xl:col-span-12 glass-card p-10 hover-glow group transition-all duration-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[18px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center glow-sm">
                  <RiLayoutGridFill className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Heuristic Heatmap</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Geometric representation of module criticality</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6">
                {LEVELS.map(({ level, cls }) => (
                  <div key={level} className="flex items-center gap-2">
                    <div className={clsx("w-2 h-2 rounded-full", cls.split(' ')[2])} />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{level}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-h-[300px]">
              {loading ? <SkeletonBlock className="h-64 rounded-2xl" /> : <RiskHeatmap risks={risks} />}
            </div>
          </section>

          {/* List View */}
          <section className="xl:col-span-12 glass-card overflow-hidden">
            <div className="px-8 py-5 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RiListUnordered className="text-slate-500" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} Indexed Modules</span>
                {filter !== "all" && (
                  <button onClick={() => setFilter("all")} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                    Reset Filter ×
                  </button>
                )}
              </div>
              <button
                onClick={() => setSort(s => s === "riskScore" ? "lines" : "riskScore")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all"
              >
                <RiArrowUpDownLine className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Sort: {sort === "riskScore" ? "Criticality" : "Linear Size"}
                </span>
              </button>
            </div>

            <div className="divide-y divide-white/[0.03]">
              <AnimatePresence>
                {loading ? (
                  <div className="p-8 space-y-4">{[...Array(5)].map((_, i) => <SkeletonBlock key={i} className="h-16 rounded-2xl" />)}</div>
                ) : filtered.length === 0 ? (
                  <div className="py-20 text-center">
                    <RiShieldFlashFill className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No matching threats identified</p>
                  </div>
                ) : (
                  filtered.map(r => (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={r.path}
                      className="group px-8 py-5 hover:bg-white/[0.02] transition-colors flex items-center gap-8"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2.5">
                          <code className="text-[11px] text-cyan-400 font-mono font-medium truncate bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-400/10">
                            {r.path}
                          </code>
                          <RiskBadge level={r.riskLevel} />
                        </div>

                        {/* Dimensional Factor Bars */}
                        <div className="flex flex-wrap gap-x-8 gap-y-3">
                          {Object.entries(r.factors).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-4 min-w-[140px]">
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] w-16">{k}</span>
                              <div className="w-16 h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${v}%` }}
                                  className="h-full rounded-full"
                                  style={{ background: FACTOR_COLORS[k] || "#6366f1", boxShadow: `0 0 8px ${FACTOR_COLORS[k]}40` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 space-y-1">
                        <div className="text-2xl font-black text-white tracking-tighter tabular-nums">{r.riskScore}</div>
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{r.lines} LOC</div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </motion.div>
    </AppLayout>
  );
}
