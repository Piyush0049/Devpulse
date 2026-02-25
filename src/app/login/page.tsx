"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiGithubFill, RiShieldKeyholeLine, RiTerminalBoxLine, RiLockPasswordLine, RiCpuLine } from "react-icons/ri";
import Image from "next/image";
import logo from "../logo.png";

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (status === "authenticated") {
            router.push("/");
        }
    }, [status, router]);

    if (!mounted) return null;

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#030307] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-t-2 border-emerald-500 animate-spin shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                    <p className="text-emerald-500 font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">Initializing Neural Link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030307] premium-grid relative flex flex-col items-center justify-center overflow-hidden">

            {/* Immersive Background Snippets */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] font-mono text-[10px] overflow-hidden select-none">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: -100, x: Math.random() * 100 + "%" }}
                        animate={{ y: "110vh" }}
                        transition={{ duration: 15 + Math.random() * 20, repeat: Infinity, ease: "linear", delay: i * 2 }}
                        className="absolute whitespace-pre text-emerald-500"
                    >
                        {`import { neural } from "@core";\nconst link = await neural.connect();\n// Hash: ${Math.random().toString(16).slice(2, 10)}\nif (link.secure) {\n  process.stdout.write("LINK_ESTABLISHED");\n}`}
                    </motion.div>
                ))}
            </div>

            {/* Enhanced Glows */}
            <div className="absolute inset-0 radial-mask pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-emerald-600/10 blur-[140px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-green-600/5 blur-[120px] rounded-full animate-float" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent scale-x-150 rotate-12" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[460px] px-6 relative z-10"
            >
                <div className="glass-card p-12 space-y-10 relative group overflow-hidden border-white/[0.05]">
                    {/* Scan Line Animation */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <motion.div
                            animate={{ top: ["-10%", "110%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent shadow-[0_0_20px_rgba(16,185,129,0.5)] z-20"
                        />
                    </div>

                    <div className="flex flex-col items-center space-y-5 text-center">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="w-20 h-20 rounded-[28px] bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)] p-4 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Image src={logo} alt="Logo" className="w-full h-full object-contain relative z-10" />
                        </motion.div>

                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                                DevPulse<span className="text-emerald-500">.</span>
                            </h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                                Secure Node Authentication
                            </p>
                        </div>
                    </div>

                    <div className="space-y-7">
                        <div className="p-5 rounded-[24px] bg-emerald-500/5 border border-emerald-500/10 space-y-3 relative overflow-hidden">
                            <div className="flex items-center gap-3">
                                <RiLockPasswordLine className="text-emerald-500 text-lg" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Auth_Protocol: v2.0</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
                                Access to the DevPulse neural engine is restricted to authorized GitHub providers. Establish link to continue.
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signIn("github")}
                            className="w-full h-16 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-emerald-50 transition-all shadow-2xl relative group/btn overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            <RiGithubFill className="text-2xl" />
                            Establish Link
                        </motion.button>
                    </div>

                    <div className="pt-4 flex flex-col items-center gap-3">
                        <div className="h-px w-12 bg-emerald-500/20" />
                        <p className="text-[9px] text-slate-700 font-mono font-black uppercase tracking-[0.5em] animate-pulse">
                            {Math.random().toString(36).slice(2, 15).toUpperCase()}
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="absolute bottom-10 left-10 md:left-auto md:right-10 flex gap-6 opacity-20 pointer-events-none">
                <div className="text-[10px] font-mono text-emerald-500 flex flex-col gap-1">
                    <span>LATENCY: 14MS</span>
                    <span>UPTIME: 99.99%</span>
                </div>
            </div>
        </div>
    );
}
