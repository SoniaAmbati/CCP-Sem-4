"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert, Globe, Activity, Terminal,
  Search, Cpu, Lock, Zap, AlertTriangle, ShieldCheck, X, Skull
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
type Attack = {
  id: number;
  ip: string;
  url: string;
  type: string;
  score: number;
  time: string;
};

type Toast = {
  id: number;
  attack: Attack;
};

// --- MOCK DATA ---
const INITIAL_ATTACKS: Attack[] = [
  { id: 1, ip: "10.0.4.12", url: "http://internal.node/auth?payload=sql_inj", type: "SQLi", score: 92, time: "12:04:22" },
  { id: 2, ip: "172.16.0.45", url: "https://secure-gate.isolated/v1/user?id=admin'--", type: "Phishing", score: 85, time: "12:05:01" },
  { id: 3, ip: "10.0.2.112", url: "http://10.0.2.112/scripts/exec.sh?cmd=rm%20-rf", type: "RCE", score: 98, time: "12:05:45" },
];

const CHART_DATA = Array.from({ length: 20 }, (_, i) => ({ time: i, attacks: Math.floor(Math.random() * 10) + 2 }));

// --- MALICIOUS TOKEN DETECTION ---
const MALICIOUS_TOKENS = [
  "sql_inj", "exec.sh", "rm%20-rf", "admin'--", "<script>", "eval(", "../",
  "passwd", "DROP TABLE", "%00", "cmd=", "payload=", "xss", "token=",
  "union select", "base64", "onerror", "javascript:", "data:",
];

const ATTACK_TYPE_COLORS: Record<string, string> = {
  SQLi: "#ef4444",
  Phishing: "#f97316",
  RCE: "#a855f7",
  XSS: "#3b82f6",
  "Brute Force": "#eab308",
  "Path Traversal": "#ec4899",
};

// Component: Highlighted URL with malicious token detection
function ThreatURL({ url }: { url: string }) {
  const lowerUrl = url.toLowerCase();
  const highlights: { start: number; end: number; token: string }[] = [];

  MALICIOUS_TOKENS.forEach((token) => {
    const idx = lowerUrl.indexOf(token.toLowerCase());
    if (idx !== -1) {
      highlights.push({ start: idx, end: idx + token.length, token });
    }
  });

  if (highlights.length === 0) {
    return <span className="text-slate-400">{url}</span>;
  }

  highlights.sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  highlights.forEach(({ start, end }, i) => {
    if (cursor < start) {
      parts.push(<span key={`plain-${i}`} className="text-slate-400">{url.slice(cursor, start)}</span>);
    }
    parts.push(
      <span
        key={`threat-${i}`}
        className="bg-red-500/20 text-red-400 border border-red-500/40 rounded px-0.5 font-bold animate-pulse"
        title="Malicious token detected"
      >
        {url.slice(start, end)}
      </span>
    );
    cursor = end;
  });

  if (cursor < url.length) {
    parts.push(<span key="plain-last" className="text-slate-400">{url.slice(cursor)}</span>);
  }

  return <span className="break-all">{parts}</span>;
}

// Component: Critical Toast Alert
function ToastAlerts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto bg-[#1a0808] border border-red-500/60 rounded-2xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.3)] relative overflow-hidden"
          >
            {/* Glowing top bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

            <div className="flex items-start gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg flex-shrink-0">
                <Skull className="w-5 h-5 text-red-400 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-black uppercase text-red-400 tracking-wider">⚠ Critical Threat Detected</p>
                  <button
                    onClick={() => onDismiss(t.id)}
                    className="text-red-500/50 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-white font-bold text-sm mt-1">{t.attack.ip}</p>
                <div className="flex gap-2 mt-1.5 items-center">
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase border border-red-500/30">
                    {t.attack.type}
                  </span>
                  <span className="text-[10px] text-red-300 font-bold">SCORE: {t.attack.score}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Component: Attack Type Donut Chart
function AttackTypeDonut({ attacks }: { attacks: Attack[] }) {
  const counts: Record<string, number> = {};
  attacks.forEach((a) => {
    counts[a.type] = (counts[a.type] || 0) + 1;
  });

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111418] border border-[#1f2937] rounded-lg px-3 py-2 text-[10px]">
          <p className="font-bold text-white">{payload[0].name}</p>
          <p className="text-cyber-primary">{payload[0].value} events</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-2xl p-4">
      <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-cyber-secondary" /> Attack Type Breakdown
      </h3>
      <div className="h-[190px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={ATTACK_TYPE_COLORS[entry.name] ?? "#64748b"}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: "10px", color: "#64748b" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [attacks, setAttacks] = useState<Attack[]>(INITIAL_ATTACKS);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttacks = searchQuery.trim()
    ? attacks.filter(
      (a) =>
        a.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : attacks;

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Simulate real-time attack detection
  useEffect(() => {
    const interval = setInterval(() => {
      const newAttack: Attack = {
        id: Date.now(),
        ip: `10.0.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 254)}`,
        url: `http://isolated-env/api/v1/resource?token=${Math.random().toString(36).substring(7)}`,
        type: ["XSS", "Brute Force", "Path Traversal", "SQLi", "RCE"][Math.floor(Math.random() * 5)],
        score: Math.floor(Math.random() * 40) + 60,
        time: new Date().toLocaleTimeString().split(" ")[0],
      };
      setAttacks((prev) => [newAttack, ...prev.slice(0, 9)]);

      // Trigger toast for critical threats
      if (newAttack.score > 90) {
        const toastId = Date.now();
        setToasts((prev) => [{ id: toastId, attack: newAttack }, ...prev.slice(0, 2)]);
        setTimeout(() => dismissToast(toastId), 6000);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [dismissToast]);

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-300 font-mono p-4 md:p-8 selection:bg-cyber-primary/30">

      {/* LIVE TOAST ALERTS */}
      <ToastAlerts toasts={toasts} onDismiss={dismissToast} />

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
            <span className="bg-cyber-primary text-black px-2 py-0.5 rounded italic">SENTINEL</span>
            URL DEFENDER <span className="text-cyber-primary animate-pulse">_</span>
          </h1>
          <p className="text-xs text-cyber-muted mt-1 uppercase tracking-widest">Isolated Network Intelligence System </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-cyber-card border border-cyber-border px-4 py-2 rounded-lg">
            <Activity className="w-4 h-4 text-cyber-primary animate-pulse" />
            <span className="text-xs font-bold text-cyber-primary uppercase">Engine: Operational</span>
          </div>
          <button
            onClick={() => { setShowSearch((v) => !v); setSearchQuery(""); }}
            className={`p-2 rounded-lg border transition-all ${showSearch
              ? "bg-cyber-primary/20 border-cyber-primary/50 text-cyber-primary"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-400"
              }`}
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* SEARCH BAR */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-primary" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by IP, type, or URL..."
                className="w-full bg-cyber-card border border-cyber-primary/40 focus:border-cyber-primary rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-cyber-muted outline-none transition-colors font-mono"
              />
              {searchQuery && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-cyber-muted">
                  {filteredAttacks.length} result{filteredAttacks.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {filteredAttacks.map((atk) => (
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
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${atk.score > 90 ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-yellow-500/20 text-yellow-500"
                          }`}>
                          {atk.type}
                        </span>
                        {atk.score > 90 && (
                          <span className="text-[10px] text-red-400 font-bold animate-pulse">CRITICAL</span>
                        )}
                      </div>
                      <span className="text-[10px] text-cyber-muted italic">{atk.time}</span>
                    </div>

                    {/* URL with threat decoder */}
                    <div className="text-xs font-mono bg-black/30 rounded-lg px-3 py-2 border border-white/5">
                      <p className="text-[9px] text-cyber-muted uppercase mb-1 tracking-widest">Decoded URL</p>
                      <ThreatURL url={atk.url} />
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1 flex-1 bg-cyber-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full"
                          style={{
                            backgroundColor: atk.score > 90 ? "#ef4444" : atk.score > 75 ? "#f97316" : "#eab308"
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${atk.score}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${atk.score > 90 ? "text-red-500" : "text-yellow-500"}`}>
                        SCORE: {atk.score}
                      </span>
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

          {/* ATTACK TYPE DONUT CHART */}
          <AttackTypeDonut attacks={attacks} />

          {/* ATTACK TREND CHART */}
          <div className="bg-cyber-card border border-cyber-border rounded-2xl p-4">
            <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Hourly Threat Velocity
            </h3>
            <div className="h-[150px] w-full">
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