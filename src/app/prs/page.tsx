"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { RiskBadge } from "@/components/ui/Badge";
import { SkeletonBlock } from "@/components/ui/Loader";
import {
  RiGitPullRequestFill, RiAddLine, RiSubtractLine, RiFileCodeLine,
  RiExternalLinkLine, RiArrowDownSLine, RiArrowUpSLine, RiUser3Fill,
  RiTimeLine, RiCheckboxCircleFill, RiGitMergeFill, RiPulseFill,
  RiInformationFill, RiStackFill, RiAlertFill
} from "react-icons/ri";
import { clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
import type { PRAnalysis } from "@/types";

const RISK_SUMMARY_STYLES = {
  critical: { cls: "border-red-500/20 bg-red-500/5 text-red-100", glow: "shadow-[0_0_30px_rgba(239,68,68,0.1)]" },
  high: { cls: "border-orange-500/20 bg-orange-500/5 text-orange-100", glow: "shadow-[0_0_30px_rgba(249,115,22,0.1)]" },
  medium: { cls: "border-amber-500/20 bg-amber-500/5 text-amber-100", glow: "shadow-[0_0_30px_rgba(245,158,11,0.1)]" },
  low: { cls: "border-emerald-500/20 bg-emerald-500/5 text-emerald-100", glow: "shadow-[0_0_30px_rgba(16,185,129,0.1)]" },
};

export default function PRsPage() {
  const [prs, setPrs] = useState<PRAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/prs").then(r => r.json()).then(d => {
      if (d.error) setError(d.error); else setPrs(d.prs || []);
    }).catch(() => setError("Neural link to Git provider failed.")).finally(() => setLoading(false));
  }, []);

  const openCount = prs.filter(p => p.state === "open").length;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8 pb-20"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/[0.05]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black tracking-widest text-emerald-400 uppercase">
              <RiStackFill /> Merge Intelligence Active
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">
              PR <span className="text-emerald-500">Analyzer.</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 tracking-tight max-w-md leading-relaxed">
              Automated impact analysis, behavioral risk assessment, and targeted review checklists for staged changes.
            </p>
          </div>

          {!loading && prs.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                <span className="live-dot" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{openCount} Active</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {prs.length - openCount} Finalized
              </div>
            </div>
          )}
        </header>

        {/* Global Mesh Effect */}
        <div className="fixed inset-0 glow-mesh opacity-10 pointer-events-none" />

        {/* Risk Indicators Grid */}
        {!loading && prs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["critical", "high", "medium", "low"] as const).map(level => {
              const count = prs.filter(p => p.riskLevel === level).length;
              const s = RISK_SUMMARY_STYLES[level];
              return (
                <div key={level} className={clsx("glass-card px-6 py-5 flex flex-col items-start gap-1 transition-all", s.cls, s.glow)}>
                  <p className="text-3xl font-black text-white">{count}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{level} complexity</p>
                </div>
              );
            })}
          </div>
        )}

        {/* PR Stream */}
        <section className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-28 glass-card animate-pulse" />)
            ) : error ? (
              <div className="glass-card p-10 text-center border-red-500/20">
                <RiAlertFill className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <p className="text-sm font-black text-red-400 uppercase tracking-widest">{error}</p>
              </div>
            ) : prs.length === 0 ? (
              <div className="glass-card p-20 text-center">
                <RiGitPullRequestFill className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No staged changes detected in stream</p>
              </div>
            ) : (
              prs.map(pr => {
                const isOpen = expanded === pr.number;
                return (
                  <motion.div
                    layout
                    key={pr.number}
                    className={clsx(
                      "glass-card transition-all duration-500 overflow-hidden",
                      isOpen ? "ring-1 ring-emerald-500/30 shadow-3xl translate-x-1" : "hover:bg-white/[0.02] hover:translate-x-1"
                    )}
                  >
                    {/* PR Header Row */}
                    <div className="p-6 cursor-pointer" onClick={() => setExpanded(isOpen ? null : pr.number)}>
                      <div className="flex items-center gap-6">
                        {/* Status Icon */}
                        <div className={clsx(
                          "w-12 h-12 rounded-[18px] flex items-center justify-center flex-shrink-0 border shadow-lg",
                          pr.state === "open" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-white/[0.03] border-white/[0.08] text-slate-600"
                        )}>
                          {pr.state === "merged" ? <RiGitMergeFill className="w-6 h-6" /> : <RiGitPullRequestFill className="w-6 h-6" />}
                        </div>

                        {/* Title & Meta Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-[10px] font-black text-slate-600 font-mono tracking-tighter">NODE-PR-{pr.number}</span>
                            <RiskBadge level={pr.riskLevel} />
                            <div className="flex items-center gap-3 ml-2">
                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400/80"><RiAddLine className="w-3 h-3" />{pr.linesAdded}</span>
                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400/80"><RiSubtractLine className="w-3 h-3" />{pr.linesRemoved}</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-black text-white tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                            {pr.title}
                          </h3>
                        </div>

                        {/* Visual Indicators */}
                        <div className="flex items-center gap-8 flex-shrink-0 pr-2">
                          {/* Circle Gauge */}
                          <div className="relative w-12 h-12">
                            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                              <motion.circle
                                initial={{ strokeDasharray: "0 94" }}
                                animate={{ strokeDasharray: `${(pr.riskScore / 100) * 94} 94` }}
                                cx="18" cy="18" r="15" fill="none" strokeWidth="4" strokeLinecap="round"
                                stroke={pr.riskLevel === "critical" ? "#ef4444" : pr.riskLevel === "high" ? "#f97316" : pr.riskLevel === "medium" ? "#f59e0b" : "#10b981"}
                              />
                            </svg>
                            <span className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
                              <span className="text-xs font-black text-white leading-none">{pr.riskScore}</span>
                              <span className="text-[7px] font-black text-slate-600 uppercase">Risk</span>
                            </span>
                          </div>

                          <div className="text-right flex flex-col justify-center gap-1">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest justify-end">
                              <RiUser3Fill className="w-3 h-3" /> {pr.author}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest justify-end">
                              <RiTimeLine className="w-3 h-3" /> {formatDistanceToNow(new Date(pr.createdAt))} ago
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <a href={pr.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
                              <RiExternalLinkLine className="w-4 h-4" />
                            </a>
                            {isOpen ? <RiArrowUpSLine className="w-6 h-6 text-slate-700" /> : <RiArrowDownSLine className="w-6 h-6 text-slate-700 hover:text-slate-400" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Analysis Area */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/[0.05] bg-white/[0.01]"
                        >
                          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Summary Bubble */}
                            <div className="lg:col-span-2 space-y-6">
                              <div>
                                <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                                  <RiPulseFill /> Abstract Intelligence Summary
                                </div>
                                <p className="text-sm font-medium text-slate-300 leading-relaxed bg-black/20 p-5 rounded-2xl border border-white/[0.03]">
                                  {pr.summary}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {pr.impactedModules.length > 0 && (
                                  <div className="space-y-4">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                      <RiFileCodeLine className="text-cyan-500" /> Hotspot Modules
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {pr.impactedModules.map(m => (
                                        <span key={m} className="px-3 py-1 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 text-[10px] font-mono font-medium">{m}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Checklist Panel */}
                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[28px] p-6 space-y-6">
                              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <RiCheckboxCircleFill className="w-4 h-4" /> Recommended Checks
                              </div>
                              <ul className="space-y-3">
                                {pr.reviewChecklist.map((item, idx) => (
                                  <li key={idx} className="flex gap-3 text-[11px] font-medium text-emerald-100/70 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                              <div className="pt-4 border-t border-emerald-500/10">
                                <p className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest text-center">Neural review powered by Llama 3.1 70B</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
