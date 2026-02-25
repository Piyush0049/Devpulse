"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiFlashlightFill, RiGithubFill, RiCpuLine, RiShieldKeyholeLine,
  RiGitPullRequestLine, RiDashboard3Line, RiArrowRightLine,
  RiCheckboxCircleFill, RiArrowRightSLine, RiPulseLine,
  RiSparkling2Fill, RiTerminalBoxLine, RiDatabase2Line,
  RiSearchEyeLine
} from "react-icons/ri";
import { SiHuggingface, SiGithub } from "react-icons/si";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import logo from "./logo.png";

const FEATURES = [
  {
    icon: RiCpuLine,
    title: "Neural Engine",
    desc: "Advanced RAG-powered intelligence for instant architectural mapping.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: RiShieldKeyholeLine,
    title: "Risk Pulse",
    desc: "Predictive module analysis to surface potential churn hotspots.",
    color: "from-red-500 to-orange-600",
  },
  {
    icon: RiGitPullRequestLine,
    title: "PR Intelligence",
    desc: "Synthetic summaries and risk scoring for every pull request.",
    color: "from-cyan-500 to-emerald-600",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [indexState, setIndexState] = useState<{ current: string; progress: number; total: number } | null>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/repo/status")
      .then((r) => r.json())
      .then((d) => { if (d.status?.status === "done") router.push("/dashboard"); });
  }, [router]);

  useEffect(() => {
    if (status === "authenticated") {
      setReposLoading(true);
      fetch("/api/github/repos")
        .then(r => r.json())
        .then(data => {
          if (data.repos) setRepos(data.repos);
          setReposLoading(false);
        })
        .catch(() => setReposLoading(false));
    }
  }, [status]);

  async function handleConnect(repoName: string) {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setRepoUrl(repoName);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/repo/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoName, githubToken: (session as any)?.accessToken }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Connection Failed"); setLoading(false); return; }

      const poll = setInterval(async () => {
        const sr = await fetch("/api/repo/status");
        const sd = await sr.json();
        const s = sd.status;
        setIndexState({ current: s.current || "Analyzing...", progress: s.progress || 0, total: s.total || 1 });
        if (s.status === "done") { clearInterval(poll); router.push("/dashboard"); }
        if (s.status === "error") { clearInterval(poll); setError(s.error || "Sync Error"); setLoading(false); setIndexState(null); }
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const pct = indexState && indexState.total > 0 ? Math.round((indexState.progress / indexState.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#030307] premium-grid relative flex flex-col items-center overflow-hidden">

      {/* Dynamic Background */}
      <div className="absolute inset-0 radial-mask pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-green-600/10 blur-[140px] rounded-full animate-float" />
      </div>

      {/* Nav */}
      <nav className="w-full max-w-7xl px-8 py-10 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] overflow-hidden">
            <Image src={logo} alt="DevPulse Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">DevPulse.</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-black tracking-widest uppercase text-slate-500">
            System v1.2 Active
          </div>
          {status === "authenticated" ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {session.user?.name?.[0] || "U"}
                </div>
                <span className="text-xs font-bold text-emerald-400">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="glass-button text-[10px] py-2 px-4 uppercase tracking-widest text-slate-400 hover:text-white"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="glass-button text-[10px] py-2 px-6 uppercase tracking-widest text-emerald-400 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
            >
              Access Portal
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 w-full max-w-6xl px-6 flex flex-col items-center justify-center text-center relative z-10 pt-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full space-y-12"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4">
            <RiSparkling2Fill className="animate-pulse" />
            Empowering Next-Gen Engineering
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter text-white">
            Understand your <span className="text-emerald-500">Code.</span><br />
            <span className="opacity-40">Better.</span>
          </h1>

          <p className="max-w-xl mx-auto text-base md:text-lg text-slate-400 font-medium leading-relaxed opacity-70">
            Professional AI-powered engineering intelligence dashboard. Synchronize your codebase and unlock deep architectural insights in seconds.
          </p>

          {/* Connect Card / Repo List */}
          <div className="w-full max-w-4xl mx-auto pt-6">
            <div className="glass-card p-8 md:p-10 relative group hover-glow min-h-[300px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 max-w-[500px] mx-auto w-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-lg font-black text-white">Neural Synchronizing</p>
                        <p className="text-[10px] text-emerald-400 font-mono mt-1 uppercase tracking-widest">{indexState?.current}</p>
                      </div>
                      <span className="text-3xl font-black text-white">{pct}%</span>
                    </div>
                    <div className="progress-track">
                      <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
                    </div>
                  </motion.div>
                ) : status === "authenticated" ? (
                  <motion.div
                    key="repos"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                      <div className="text-left">
                        <h2 className="text-xl font-black text-white tracking-tight">Select Repository</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Available for analysis</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative group/search">
                          <RiSearchEyeLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-emerald-500 transition-colors" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter neural nodes..."
                            className="bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all w-full md:w-[240px] font-medium"
                          />
                        </div>
                        <div className="px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-black text-emerald-400 uppercase tracking-widest hidden sm:block">
                          {repos.length} Total
                        </div>
                      </div>
                    </div>

                    {reposLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 4, 6].map(i => (
                          <div key={i} className="h-20 bg-white/[0.02] border border-white/[0.05] rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {repos
                          .filter(repo => repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((repo) => (
                            <button
                              key={repo.id}
                              onClick={() => handleConnect(repo.fullName)}
                              className="group relative flex flex-col items-start p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all text-left overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="flex items-center justify-between w-full mb-2">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{repo.language || "Unknown"}</span>
                                <RiArrowRightLine className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                              </div>
                              <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors truncate w-full">{repo.fullName}</h3>
                              <p className="text-[10px] text-slate-500 font-bold mt-1 line-clamp-1">{repo.description || "No description provided."}</p>
                            </button>
                          ))}
                        {repos.filter(repo => repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                          <div className="col-span-full py-20 text-center">
                            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No matching repositories found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="unauth"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center space-y-8 py-10"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
                      <RiTerminalBoxLine className="w-10 h-10 text-emerald-500 opacity-40" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-black text-white">Neural Link Not Established</h2>
                      <p className="text-sm text-slate-500 max-w-md font-medium leading-relaxed">
                        Connect your GitHub account to initialize codebase intelligence and explore architectural deep-dives.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push("/login")}
                      className="h-14 px-10 bg-white text-black rounded-2xl font-black text-base uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4"
                    >
                      Authenticate System <RiArrowRightLine />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Features Preview */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card p-8 group text-left hover:border-white/20 transition-all">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-tight">{f.title}</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-40 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest text-white uppercase"><RiCheckboxCircleFill className="text-emerald-500 w-5 h-5" /> AES-256 SECURED</div>
          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest text-white uppercase"><SiHuggingface className="text-amber-500 w-5 h-5" /> HF-AI POWERED</div>
          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest text-white uppercase"><RiShieldKeyholeLine className="text-emerald-500 w-5 h-5" /> ISO-V4 AUDITED</div>
        </div>
      </main>
    </div>
  );
}
