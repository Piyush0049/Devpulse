"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/ui/Loader";
import {
  RiMessage3Line, RiSendPlaneFill, RiRobot2Fill, RiUserFill,
  RiFileCodeFill, RiSparklingFill, RiArrowRightSLine, RiPulseFill
} from "react-icons/ri";
import { clsx } from "clsx";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ path: string; relevance: number; snippet: string }>;
  confidence?: number;
}

const EXAMPLES = [
  "Where is the authentication logic?",
  "What are the most complex modules?",
  "How does the state management work?",
  "Technical entropy bottlenecks?",
  "Locate data validation patterns",
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome", role: "assistant",
    content: "Neural engine initialized. I've successfully mapped your codebase architecture. Ask me anything about logic flows, dependencies, or architectural risks.",
  }]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function ask(text?: string) {
    const question = (text || q).trim();
    if (!question || loading) return;

    setMessages(p => [...p, { id: Date.now().toString(), role: "user", content: question }]);
    setQ("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: data.answer || data.error || "Neural link stable, but no data returned.",
        sources: data.sources,
        confidence: data.confidence,
      }]);
    } catch {
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: "assistant", content: "Signal interference. Please retry neural link." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8 pb-10"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.05]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black tracking-widest text-emerald-400 uppercase">
              <RiPulseFill className="animate-pulse" /> Neural Engine Active
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              Neural <span className="text-emerald-500">Query.</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 tracking-tight">Direct interface to codebase intelligence via semantic RAG embeddings.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.slice(0, 3).map(e => (
              <button key={e} onClick={() => ask(e)} disabled={loading}
                className="text-[10px] font-black px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all uppercase tracking-wider disabled:opacity-30">
                {e}
              </button>
            ))}
          </div>
        </header>

        {/* Global Mesh Effect */}
        <div className="fixed inset-0 glow-mesh opacity-20 pointer-events-none" />

        {/* Chat Window */}
        <div className="glass-card flex flex-col min-h-[600px] shadow-2xl relative">
          {/* Status Bar */}
          <div className="px-6 py-3 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Context: Global Repository</span>
            </div>
            <div className="px-3 py-1 rounded-md bg-black/40 border border-white/5 text-[9px] font-mono text-slate-600">
              0xF2A — Stable
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar h-[450px]">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id}
                  className={clsx("flex gap-5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  {/* Avatar Icons */}
                  <div className={clsx(
                    "w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border",
                    msg.role === "assistant" ? "bg-emerald-600 border-emerald-500/50" : "bg-white/[0.03] border-white/[0.08]"
                  )}>
                    {msg.role === "assistant"
                      ? <RiRobot2Fill className="w-5 h-5 text-white" />
                      : <RiUserFill className="w-5 h-5 text-slate-400" />
                    }
                  </div>

                  <div className={clsx("max-w-[80%] space-y-3", msg.role === "user" ? "items-end" : "items-start")}>
                    {/* Message Bubble */}
                    <div className={clsx(
                      "rounded-[24px] px-6 py-4 text-sm leading-relaxed shadow-xl",
                      msg.role === "assistant"
                        ? "bg-white/[0.03] border border-white/[0.06] text-slate-200"
                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 font-medium"
                    )}>
                      {msg.content}
                    </div>

                    {/* Meta Info: Sources & Confidence */}
                    {(msg.sources || msg.confidence) && (
                      <div className="w-full space-y-3 px-2">
                        {msg.confidence !== undefined && (
                          <div className="flex items-center gap-2">
                            <RiSparklingFill className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                              Engine Confidence: <span className="text-emerald-400">{Math.round(msg.confidence * 100)}%</span>
                            </span>
                          </div>
                        )}

                        {msg.sources && msg.sources.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {msg.sources.slice(0, 2).map((s, idx) => (
                              <div key={idx} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 group hover:border-emerald-500/30 transition-all">
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <RiFileCodeFill className="w-3.5 h-3.5 text-cyan-500/70" />
                                    <code className="text-[10px] text-slate-400 font-mono truncate">{s.path.split('/').pop()}</code>
                                  </div>
                                  <span className="text-[9px] font-black text-slate-700">{s.relevance}%</span>
                                </div>
                                <pre className="text-[9px] text-slate-600 font-mono line-clamp-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                  {s.snippet}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5">
                  <div className="w-10 h-10 rounded-[14px] bg-emerald-600 flex items-center justify-center animate-pulse">
                    <RiRobot2Fill className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] px-6 py-4 flex items-center gap-3">
                    <Spinner size="sm" />
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Neural Indexing...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/[0.01] border-t border-white/[0.05]">
            <div className="relative group">
              <textarea
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
                placeholder="Query neural codebase..."
                rows={1}
                disabled={loading}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-[22px] pl-6 pr-20 py-5 text-sm text-slate-100 placeholder-slate-700 outline-none focus:bg-white/[0.05] focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none overflow-hidden"
              />
              <div className="absolute right-3 bottom-2.5">
                <button
                  onClick={() => ask()}
                  disabled={loading || !q.trim()}
                  className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 rounded-[16px] flex items-center justify-center transition-all shadow-xl group/btn"
                >
                  <RiSendPlaneFill className="w-5 h-5 text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-700 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white">Enter</kbd> Send</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white">Shift+Enter</kbd> Wrap</span>
              </div>
              <p className="text-[9px] font-black text-emerald-500/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <RiPulseFill /> Neural Pulse v1.2.0
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
