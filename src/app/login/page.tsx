"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiGithubFill, RiShieldKeyholeLine, RiTerminalBoxLine, RiLockPasswordLine, RiCpuLine, RiPulseFill } from "react-icons/ri";
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
        <div className="min-h-screen bg-[#020205] relative flex flex-col items-center justify-center overflow-hidden">

            {/* ── Background Infrastructure ────────────────────────── */}

            {/* Primary Dark Grid */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#062016_1px,transparent_1px),linear-gradient(to_bottom,#062016_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#051510_1px,transparent_1px),linear-gradient(to_bottom,#051510_1px,transparent_1px)] bg-[size:200px_200px]" />
            </div>

            {/* Scrolling Code Stream */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] font-mono text-[10px] overflow-hidden select-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: -200, x: (i * 5) + "%" }}
                        animate={{ y: "110vh" }}
                        transition={{
                            duration: 20 + Math.random() * 30,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 20
                        }}
                        className="absolute whitespace-pre text-emerald-400 leading-relaxed"
                    >
                        {`0x${Math.random().toString(16).slice(2, 10).toUpperCase()}\nFETCH_MOD\nSYNC_NODE\n${Math.random() > 0.5 ? 'ACK_OK' : 'ERR_RT'}\n>>_PUSH\n00101011`}
                    </motion.div>
                ))}
            </div>

            {/* Floating Geometric Nodes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                            y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                            rotate: [0, 360]
                        }}
                        transition={{ duration: 40 + i * 10, repeat: Infinity, ease: "linear" }}
                        className="absolute w-64 h-64 border border-emerald-500/5 rounded-full flex items-center justify-center"
                    >
                        <div className="w-2 h-2 bg-emerald-500/10 rounded-full shadow-[0_0_20px_#10b88122]" />
                    </motion.div>
                ))}
            </div>

            {/* Volumetric Glows */}
            <div className="absolute inset-0 radial-mask pointer-events-none">
                <div className="absolute top-[15%] left-[10%] w-[800px] h-[800px] bg-emerald-950/20 blur-[160px] rounded-full animate-pulse" />
                <div className="absolute bottom-[20%] right-[15%] w-[600px] h-[600px] bg-green-900/10 blur-[140px] rounded-full animate-float" />
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent rotate-[-15deg]"
                />
            </div>

            {/* ── Main Content ─────────────────────────────────────── */}

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[480px] px-6 relative z-10"
            >
                {/* Advanced Card Structure */}
                <div className="glass-card p-12 space-y-10 relative group border-white/[0.03] shadow-[0_0_80px_rgba(0,0,0,0.8)]">

                    {/* Interior Scan Effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                        <motion.div
                            animate={{ top: ["-20%", "120%"] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent z-20"
                        />
                    </div>

                    <div className="flex flex-col items-center space-y-6 text-center">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="w-24 h-24 rounded-[32px] bg-emerald-600/5 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.1)] p-5 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <Image src={logo} alt="Logo" className="w-full h-full object-contain relative z-10 group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all" />
                        </motion.div>

                        <div className="space-y-2">
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                                DevPulse<span className="text-emerald-500">.</span>
                            </h1>
                            <div className="flex items-center gap-3 justify-center">
                                <div className="h-[1px] w-8 bg-emerald-500/20" />
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">
                                    Node Authentication active
                                </p>
                                <div className="h-[1px] w-8 bg-emerald-500/20" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Protocol Information Box */}
                        <div className="p-6 rounded-[28px] bg-emerald-500/[0.02] border border-emerald-500/10 space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-20">
                                <RiShieldKeyholeLine className="text-2xl text-emerald-500" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Protocol: V4.1_SECURE</span>
                            </div>
                            <p className="text-[12px] text-slate-400 leading-relaxed font-bold">
                                Access to the DevPulse neural interface requires an established GitHub link.
                                <span className="text-white"> TLS 1.3 Encryption active.</span>
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signIn("github")}
                            className="w-full h-18 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.25em] flex items-center justify-center gap-5 hover:bg-emerald-50 transition-all shadow-2xl relative group/btn overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            <RiGithubFill className="text-2xl" />
                            Establish Link
                        </motion.button>
                    </div>

                    <div className="pt-2 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-6 opacity-40">
                            <RiTerminalBoxLine className="text-slate-500 text-lg hover:text-emerald-500 transition-colors" />
                            <RiCpuLine className="text-slate-500 text-lg hover:text-emerald-500 transition-colors" />
                            <RiLockPasswordLine className="text-slate-500 text-lg hover:text-emerald-500 transition-colors" />
                        </div>
                        <p className="text-[8px] text-slate-800 font-mono font-black uppercase tracking-[0.6em] animate-pulse">
                            SESSION_ID: {Math.random().toString(36).slice(2, 14).toUpperCase()}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── Footer Telemetry ───────────────────────────────── */}
            <div className="absolute bottom-10 left-10 md:left-auto md:right-10 flex gap-10 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                <div className="text-[10px] font-mono text-emerald-500 flex flex-col gap-1.5 border-l border-emerald-500/20 pl-4">
                    <span className="flex items-center gap-2"><RiPulseFill className="animate-pulse" /> NETWORK LAC: 11MS</span>
                    <span className="flex items-center gap-2">UPTIME: 99.999% ONLINE</span>
                </div>
            </div>

            <style jsx global>{`
                .glass-card {
                    background: rgba(8, 12, 10, 0.8);
                    backdrop-filter: blur(20px);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
                }
            `}</style>
        </div>
    );
}
