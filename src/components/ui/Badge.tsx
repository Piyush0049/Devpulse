"use client";
import { clsx } from "clsx";

const VARIANTS = {
  default: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  critical: "bg-red-600/15 text-red-300 border-red-500/30",
  purple: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
} as const;

export function Badge({ children, variant = "default", size = "md", className }: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 rounded-full font-semibold border uppercase tracking-wider",
      VARIANTS[variant],
      size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1",
      className
    )}>
      {children}
    </span>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const map: Record<string, { variant: keyof typeof VARIANTS; label: string }> = {
    low: { variant: "success", label: "Low" },
    medium: { variant: "warning", label: "Med" },
    high: { variant: "danger", label: "High" },
    critical: { variant: "critical", label: "Critical" },
  };
  const { variant, label } = map[level] ?? { variant: "default" as const, label: level };
  return <Badge variant={variant}>{label}</Badge>;
}
