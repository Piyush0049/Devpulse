"use client";

import { clsx } from "clsx";
import { AlertTriangle, Info, CheckCircle, Zap, Sparkles } from "lucide-react";
import type { AIInsight } from "@/types";

const TYPE_CONFIG = {
  risk: { icon: AlertTriangle, iconCls: "text-red-400", bg: "bg-red-500/6 border-red-500/18" },
  warning: { icon: AlertTriangle, iconCls: "text-amber-400", bg: "bg-amber-500/6 border-amber-500/18" },
  info: { icon: Info, iconCls: "text-cyan-400", bg: "bg-cyan-500/6 border-cyan-500/18" },
  success: { icon: CheckCircle, iconCls: "text-emerald-400", bg: "bg-emerald-500/6 border-emerald-500/18" },
  action: { icon: Zap, iconCls: "text-emerald-400", bg: "bg-emerald-500/6 border-emerald-500/18" },
} as const;

const PRI_DOT = { high: "bg-red-400", medium: "bg-amber-400", low: "bg-slate-600" } as const;

export function AIInsightsFeed({ insights, loading }: { insights: AIInsight[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
      </div>
    );
  }

  if (!insights?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Sparkles className="w-8 h-8 text-emerald-500/30 mb-3" />
        <p className="text-slate-500 text-sm">AI insights will appear after indexing</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {insights.map((ins) => {
        const cfg = TYPE_CONFIG[ins.type] ?? TYPE_CONFIG.info;
        const Icon = cfg.icon;
        return (
          <div key={ins.id} className={clsx("flex gap-3 p-3 rounded-lg border", cfg.bg)}>
            <div className="w-6 h-6 rounded-md bg-black/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className={clsx("w-3 h-3", cfg.iconCls)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-xs font-bold text-slate-200 leading-snug">{ins.title}</p>
                <span className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0", PRI_DOT[ins.priority])} />
              </div>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{ins.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
