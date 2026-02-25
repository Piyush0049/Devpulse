"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { HealthGauge } from "@/components/dashboard/HealthGauge";
import { VelocityChart } from "@/components/dashboard/VelocityChart";
import { RiskHeatmap } from "@/components/dashboard/RiskHeatmap";
import { AIInsightsFeed } from "@/components/dashboard/AIInsightsFeed";
import { BreakdownBar } from "@/components/dashboard/BreakdownBar";
import { LanguageChart } from "@/components/dashboard/LanguageChart";
import { SkeletonBlock } from "@/components/ui/Loader";
import {
  RiStarFill, RiGitForkFill, RiAlertFill, RiFileCodeFill,
  RiDatabase2Fill, RiCodeBoxFill, RiPulseFill, RiBrainFill,
  RiBarChartGroupedFill, RiArrowRightSLine, RiGlobalFill,
  RiFlashlightFill, RiGithubFill, RiShieldCheckFill, RiCpuLine
} from "react-icons/ri";
import type { HealthScore, AIInsight, CommitActivity, FileRisk } from "@/types";

interface HealthData {
  healthScore: HealthScore;
  aiInsights: AIInsight[];
  commits: CommitActivity[];
  languages: Array<{ name: string; count: number; percentage: number }>;
  stats: { totalFiles: number; totalLines: number; totalVectors: number; openIssues: number; stars: number; forks: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [repoStatus, setRepoStatus] = useState<{ repoInfo?: { fullName: string; description: string; url: string; language: string } } | null>(null);
  const [risks, setRisks] = useState<FileRisk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const statusRes = await fetch("/api/repo/status");
      const statusData = await statusRes.json();
      if (statusData.status?.status !== "done") { router.push("/"); return; }
      setRepoStatus(statusData);

      const [hRes, rRes] = await Promise.allSettled([fetch("/api/health"), fetch("/api/risks")]);
      if (hRes.status === "fulfilled" && hRes.value.ok) setHealthData(await hRes.value.json());
      if (rRes.status === "fulfilled" && rRes.value.ok) setRisks((await rRes.value.json()).risks || []);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8 premium-grid min-h-[80vh] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-black text-emerald-400 uppercase tracking-[0.3em] animate-pulse text-center">Initializing Intelligence<br /><span className="text-[10px] opacity-40">Connecting to Neural Engine</span></p>
        </div>
      </AppLayout>
    );
  }

  const h = healthData?.healthScore;
  const s = healthData?.stats;
  const repoInfo = repoStatus?.repoInfo;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-12 pb-20 px-4 md:px-0"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/[0.05] relative">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black tracking-widest text-emerald-400 uppercase">
              <RiPulseFill className="animate-pulse" /> Systems Operational
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white leading-tight">
              Engineering <span className="text-emerald-500">Command.</span>
            </h1>
            {repoInfo && (
              <div className="flex flex-wrap items-center gap-3">
                <a href={repoInfo.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 group px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all shadow-xl">
                  <RiGithubFill className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="text-xs font-black text-slate-400 group-hover:text-white tracking-tight">{repoInfo.fullName}</span>
                </a>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 self-start md:self-end">
            <div className="flex items-center gap-4 px-6 py-4 rounded-[24px] bg-emerald-500/5 border border-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
              <span className="live-dot" />
              <div className="text-left">
                <span className="block text-[10px] font-black text-emerald-400 tracking-widest uppercase mb-0.5">Link Status</span>
                <span className="block text-xs font-bold text-emerald-500/60 uppercase">Stable 12ms</span>
              </div>
            </div>
          </div>
        </header>

        {/* Global Mesh Effect */}
        <div className="fixed inset-0 glow-mesh opacity-10 pointer-events-none" />

        {/* Unified Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard label="Followers" value={s?.stars ?? "—"} icon={<RiStarFill />} accent="amber" />
          <StatCard label="Forks" value={s?.forks ?? "—"} icon={<RiGitForkFill />} accent="emerald" />
          <StatCard label="Security" value={s?.openIssues ?? "—"} icon={<RiAlertFill />} accent={s && s.openIssues > 20 ? "red" : "green"} sub="Alerts" />
          <StatCard label="Modules" value={s?.totalFiles ?? "—"} icon={<RiFileCodeFill />} accent="cyan" />
          <StatCard label="Codebase" value={s?.totalLines ? `${(s.totalLines / 1000).toFixed(1)}k` : "—"} icon={<RiCodeBoxFill />} accent="green" sub="Lines" />
          <StatCard label="Neural Pool" value={s?.totalVectors ?? "—"} icon={<RiDatabase2Fill />} accent="emerald" sub="Vectors" />
        </div>

        {/* Primary Data Row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Health Index */}
          <section className="xl:col-span-4 glass-card p-10 hover-glow group transition-all duration-700">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center glow-sm shadow-2xl transition-transform group-hover:scale-110 duration-500">
                  <RiPulseFill className="w-7 h-7 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Codebase Health</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Advanced Stability Metrics</p>
                </div>
              </div>
            </div>

            {h ? (
              <div className="space-y-12">
                <HealthGauge score={h.overall} trend={h.trend} />
                <div className="pt-10 border-t border-white/[0.05]">
                  <BreakdownBar breakdown={h.breakdown} />
                </div>
                <div className="grid grid-cols-1 gap-5">
                  {h.insights.slice(0, 2).map((ins, i) => (
                    <div key={i} className="p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.04] text-[13px] font-bold text-slate-400 leading-relaxed hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all cursor-default">
                      <div className="w-6 h-px bg-emerald-500 mb-4 opacity-40" />
                      {ins}
                    </div>
                  ))}
                </div>
              </div>
            ) : <SkeletonBlock className="h-[400px] rounded-[32px]" />}
          </section>

          {/* Activity Matrix */}
          <section className="xl:col-span-8 space-y-8">
            <div className="glass-card p-10 flex-1 hover-glow transition-all duration-700">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[20px] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-2xl">
                    <RiBarChartGroupedFill className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Deployment Velocity</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Temporal Activity Audit</p>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">
                  Live Telemetry
                </div>
              </div>
              <div className="h-[260px]">
                <VelocityChart data={healthData?.commits ?? []} />
              </div>
            </div>

            <div className="glass-card p-10 hover-glow transition-all duration-700">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[20px] bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-2xl">
                    <RiGlobalFill className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Stack Architecture</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Linguistic Composition Matrix</p>
                  </div>
                </div>
              </div>
              <LanguageChart languages={healthData?.languages ?? []} />
            </div>
          </section>
        </div>

        {/* Insight Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="glass-card p-10 hover-glow transition-all duration-700">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[20px] bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-2xl">
                  <RiShieldCheckFill className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Entropy Heatmap</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Predictive Risk Scoring</p>
                </div>
              </div>
              <a href="/risks" className="flex items-center gap-2 group px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-red-500/20 transition-all shadow-xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-red-400">Deep Audit</span>
                <RiArrowRightSLine className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <RiskHeatmap risks={risks} />
          </section>

          <section className="glass-card p-10 hover-glow transition-all duration-700">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl">
                  <RiBrainFill className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Neural Feed</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Synthetic Intelligence Stream</p>
                </div>
              </div>
            </div>
            <AIInsightsFeed insights={healthData?.aiInsights ?? []} loading={loading} />
          </section>
        </div>

      </motion.div>
    </AppLayout>
  );
}
