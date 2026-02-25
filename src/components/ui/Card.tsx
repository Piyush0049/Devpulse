"use client";
import { clsx } from "clsx";

export function Card({ children, className, glow, hover, onClick, accentColor }: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
  accentColor?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "glass-card transition-all duration-500",
        hover && "hover-glow hover:-translate-y-1",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
      style={accentColor ? { borderTop: `2px solid ${accentColor}` } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon, action }: {
  title: string; subtitle?: string; icon?: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 glow-sm">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

const ACCENT = {
  emerald: { border: "#10b981", cls: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400" },
  indigo: { border: "#10b981", cls: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400" },
  cyan: { border: "#22d3ee", cls: "bg-cyan-500/15 border-cyan-500/25 text-cyan-400" },
  green: { border: "#10b981", cls: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400" },
  amber: { border: "#f59e0b", cls: "bg-amber-500/15 border-amber-500/25 text-amber-400" },
  red: { border: "#ef4444", cls: "bg-red-500/15 border-red-500/25 text-red-400" },
  purple: { border: "#34d399", cls: "bg-green-500/15 border-green-500/25 text-green-400" },
} as const;

export function StatCard({ label, value, sub, icon, accent = "indigo" }: {
  label: string; value: string | number; sub?: string; icon?: React.ReactNode; accent?: keyof typeof ACCENT;
}) {
  const a = ACCENT[accent];
  return (
    <div className="relative group rounded-[20px] glass glass-hover p-4 overflow-hidden transition-all duration-500 hover:shadow-2xl"
      style={{ borderTop: `2px solid ${a.border}` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.05] to-transparent -rotate-45 translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-700" />

      <div className="flex items-center gap-4 relative z-10">
        {icon && (
          <div className={clsx(
            "w-10 h-10 rounded-[14px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-lg",
            "group-hover:scale-110 group-hover:rotate-3",
            a.cls
          )}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] truncate mb-0.5">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-white tracking-tighter leading-none">{value}</p>
            {sub && <span className="text-[9px] font-black text-slate-600 truncate uppercase tracking-widest">{sub}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
