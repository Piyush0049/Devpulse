"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  RiDashboard3Line, RiDashboard3Fill,
  RiSearchEyeLine, RiSearchEyeFill,
  RiGitPullRequestLine, RiGitPullRequestFill,
  RiShieldFlashLine, RiShieldFlashFill,
  RiLineChartLine, RiLineChartFill,
  RiHistoryLine, RiGithubFill, RiSettings4Line, RiNodeTree, RiCpuLine, RiLogoutBoxLine
} from "react-icons/ri";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import logo from "../../app/logo.png";

const NAV = [
  { href: "/dashboard", label: "Intelligence", icon: RiDashboard3Line, activeIcon: RiDashboard3Fill },
  { href: "/ask", label: "Neural Query", icon: RiSearchEyeLine, activeIcon: RiSearchEyeFill },
  { href: "/prs", label: "Merge Insights", icon: RiGitPullRequestLine, activeIcon: RiGitPullRequestFill },
  { href: "/risks", label: "Global Risks", icon: RiShieldFlashLine, activeIcon: RiShieldFlashFill },
  { href: "/debt", label: "Tech Entropy", icon: RiLineChartLine, activeIcon: RiLineChartFill },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  async function handleSwitchRepo() {
    await fetch("/api/repo/reset", { method: "POST" });
    router.push("/");
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[260px] flex flex-col z-40 border-r border-white/[0.04] bg-[#030307]/90 backdrop-blur-3xl"
    >
      {/* Brand */}
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-[14px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-700 group-hover:rotate-[15deg] group-hover:scale-110 shadow-[0_0_40px_rgba(16,185,129,0.2)] overflow-hidden p-2">
            <Image src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-lg font-black text-white leading-none tracking-tighter">DevPulse.</div>
            <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mt-1.5 opacity-60">Node v1.4.2</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-5 space-y-1 overflow-y-auto custom-scrollbar pt-2">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.25em] px-4 mb-4">Control Plane</p>
        {NAV.map(({ href, label, icon: Icon, activeIcon: ActiveIcon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const DisplayIcon = active ? ActiveIcon : Icon;

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "group relative flex items-center gap-3.5 px-4 py-3 rounded-[16px] text-xs font-black transition-all duration-500 overflow-hidden",
                active
                  ? "text-white bg-white/[0.03] border border-white/[0.06] shadow-xl"
                  : "text-slate-500 hover:text-white hover:bg-white/[0.02] border border-transparent"
              )}
            >
              <div className={clsx(
                "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-lg",
                active ? "bg-emerald-600 text-white glow-sm scale-110" : "bg-white/[0.03] group-hover:bg-white/[0.06]"
              )}>
                <DisplayIcon className={clsx("w-4 h-4", !active && "group-hover:scale-110 transition-transform")} />
              </div>
              <span className="relative z-10 transition-colors duration-300">{label}</span>

              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute right-0 w-1 h-8 bg-emerald-500 rounded-l-full shadow-[0_0_20px_rgba(16,185,129,1)]"
                />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-5 space-y-3 mt-auto border-t border-white/[0.04]">
        {session && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-2 group/user hover:bg-white/[0.04] transition-all">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400 shrink-0 shadow-lg group-hover/user:scale-110 transition-transform">
              {session.user?.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white truncate group-hover/user:text-emerald-400 transition-colors">{session.user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[8px] font-black text-slate-600 truncate uppercase tracking-widest">Operator Active</p>
              </div>
            </div>
          </div>
        )}

        <button onClick={handleSwitchRepo}
          className="w-full h-10 flex items-center gap-3 px-4 rounded-xl text-[10px] font-black text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all group uppercase tracking-widest"
        >
          <RiHistoryLine className="w-3.5 h-3.5 group-hover:rotate-[-90deg] transition-transform duration-700" />
          Context Switch
        </button>

        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full h-10 flex items-center gap-3 px-4 rounded-xl text-[10px] font-black text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group uppercase tracking-widest"
        >
          <RiLogoutBoxLine className="w-3.5 h-3.5" />
          Terminate Session
        </button>
      </div>

      {/* Experimental Card */}
      <div className="px-6 mb-6">
        <div className="p-6 rounded-[24px] bg-emerald-500/5 border border-emerald-500/10 space-y-3 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000">
            <RiCpuLine className="w-28 h-28 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Intelligence Status</p>
          </div>
          <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Neural analysis active. Global risk vectors identified.</p>
        </div>
      </div>

      {/* Footer */}

    </aside>
  );
}
