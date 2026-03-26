"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, Globe, Activity, Terminal, 
  Search, Cpu, Lock, Zap, AlertTriangle, ShieldCheck 
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK DATA ---
const INITIAL_ATTACKS = [
  { id: 1, ip: "10.0.4.12", url: "http://internal.node/auth?payload=sql_inj", type: "SQLi", score: 92, time: "12:04:22" },
  { id: 2, ip: "172.16.0.45", url: "https://secure-gate.isolated/v1/user?id=admin'--", type: "Phishing", score: 85, time: "12:05:01" },
  { id: 3, ip: "10.0.2.112", url: "http://10.0.2.112/scripts/exec.sh?cmd=rm%20-rf", type: "RCE", score: 98, time: "12:05:45" },
];

const CHART_DATA = Array.from({ length: 20 }, (_, i) => ({ time: i, attacks: Math.floor(Math.random() * 10) + 2 }));

export default function Dashboard() {
  const [attacks, setAttacks] = useState(INITIAL_ATTACKS);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);

  // Simulate real-time attack detection
  useEffect(() => {
    const interval = setInterval(() => {
      const newAttack = {
        id: Date.now(),
        ip: `10.0.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 254)}`,
        url: `http://isolated-env/api/v1/resource?token=${Math.random().toString(36).substring(7)}`,
        type: ["XSS", "Brute Force", "Path Traversal"][Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 40) + 60,
        time: new Date().toLocaleTimeString().split(" ")[0],
      };
      setAttacks(prev => [newAttack, ...prev.slice(0, 9)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-300 font-mono p-4 md:p-8 selection:bg-cyber-primary/30">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
            <span className="bg-cyber-primary text-black px-2 py-0.5 rounded italic">SENTINEL</span>
            URL DEFENDER <span className="text-cyber-primary animate-pulse">_</span>
          </h1>
          <p className="text-xs text-cyber-muted mt-1 uppercase tracking-widest">Isolated Network Intelligence System v4.0.2</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-cyber-card border border-cyber-border px-4 py-2 rounded-lg">
            <Activity className="w-4 h-4 text-cyber-primary animate-pulse" />
            <span className="text-xs font-bold text-cyber-primary uppercase">Engine: Operational</span>
          </div>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-lg transition-all">
            <Search className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* TOP STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "IP Insights Profiled", val: "1,204", icon: Globe, color: "text-blue-400" },
          { label: "Threats Blocked", val: "452", icon: ShieldAlert, color: "text-red-400" },
          { label: "Network Latency", val: "12ms", icon: Zap, color: "text-yellow-400" },
          { label: "Isolation Integrity", val: "99.9%", icon: Lock, color: "text-emerald-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-cyber-card border border-cyber-border p-5 rounded-xl group hover:border-cyber-primary/50 transition-colors">
            <div className="flex justify-between items-start">
              <p className="text-[10px] uppercase font-bold text-cyber-muted tracking-wider">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white mt-2 tracking-tight">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT: LIVE ATTACK FEED */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden">
            <div className="bg-white/[0.02] border-b border-cyber-border p-4 flex justify-between items-center">
              <h2 className="text-xs font-black uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyber-primary" /> URL Attack Vector Stream
              </h2>
              <span className="text-[10px] text-cyber-muted">LIVE_LOG_BUFFER: 1024KB</span>
            </div>
            <div className="p-2 h-[500px] overflow-y-auto custom-scrollbar">
              <AnimatePresence initial={false}>
                {attacks.map((atk) => (
                  <motion.div
                    key={atk.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedIp(atk.ip)}
                    className="p-4 mb-2 border border-transparent hover:border-cyber-border hover:bg-white/[0.03] rounded-xl cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white bg-cyber-border px-2 py-0.5 rounded">{atk.ip}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          atk.score > 90 ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"
                        }`}>
                          {atk.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-cyber-muted italic">{atk.time}</span>
                    </div>
                    <p className="text-xs font-mono break-all text-slate-400 group-hover:text-cyber-primary transition-colors">
                      {atk.url}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1 flex-1 bg-cyber-border rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${atk.score}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-red-500">SCORE: {atk.score}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT: IP INSIGHTS & ANALYTICS */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* IP DETAIL CARD */}
          <div className="bg-cyber-card border-2 border-cyber-primary/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Cpu className="w-24 h-24 text-cyber-primary" />
            </div>
            <h3 className="text-xs font-black uppercase text-cyber-primary mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Focused IP Insights
            </h3>
            {selectedIp ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-cyber-muted uppercase tracking-tighter">Selected Target</p>
                  <p className="text-3xl font-black text-white">{selectedIp}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-[10px] text-cyber-muted">Anomaly Entropy</p>
                    <p className="text-xl font-bold text-white">4.82</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-[10px] text-cyber-muted">Request Freq.</p>
                    <p className="text-xl font-bold text-white">124/min</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-cyber-muted text-xs italic border border-dashed border-cyber-border rounded-xl">
                Select an entry from the feed to derive IP insights...
              </div>
            )}
          </div>

          {/* ATTACK TREND CHART */}
          <div className="bg-cyber-card border border-cyber-border rounded-2xl p-4">
            <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Hourly Threat Velocity
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART_DATA}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 15]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111418', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Line type="monotone" dataKey="attacks" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}