import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'

export default function UserLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsUrl = `${API_BASE_URL}/api/admin/stats`;
        const logsUrl = `${API_BASE_URL}/api/admin/logs`;
        
        console.log(`[UserLogs] Fetching stats from: ${statsUrl}`);
        console.log(`[UserLogs] Fetching logs from: ${logsUrl}`);

        const [statsRes, logsRes] = await Promise.all([
          fetch(statsUrl),
          fetch(logsUrl)
        ])
        
        if (!statsRes.ok || !logsRes.ok) {
           throw new Error(`HTTP Error: Stats ${statsRes.status}, Logs ${logsRes.status}`);
        }

        const statsData = await statsRes.json()
        const logsData = await logsRes.json()
        
        setStats(statsData)
        setLogs(Array.isArray(logsData) ? logsData : [])
        setError(null)
      } catch (err: any) {
        console.error("[UserLogs] Fetch failed:", err)
        setError(err.message || "Failed to connect to backend")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/export-metrics`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signetra_system_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export logs");
    }
  };

  // Safe Latency Parser
  const getLatency = () => {
    if (!stats?.system_latency) return "---";
    const val = String(stats.system_latency).replace(/[^\d.]/g, '');
    return val || "---";
  }

  if (loading && !stats) {
     return (
       <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
             <p className="text-xs font-mono opacity-40 uppercase tracking-widest animate-pulse">Initializing System Terminal...</p>
          </div>
       </div>
     )
  }

  return (
    <div className="pb-12 min-h-full text-white">
      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500">
           <span className="material-symbols-outlined">error</span>
           <p className="text-xs font-bold uppercase tracking-widest">Network Error: {error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-extrabold tracking-tighter uppercase font-mono">System Terminal</h2>
          <div className="flex gap-4 text-xs font-mono opacity-60">
            <Link to="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
            <span className="text-primary border-b border-primary/40">Terminal</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono hover:bg-white/10 transition-all">Clear Session</button>
          <button 
            onClick={handleExportCSV}
            className="px-6 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg text-xs font-mono hover:bg-primary/30 transition-all"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1b1f2c] p-8 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/[0.02] transition-all">
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Total Detections</p>
            <h3 className="text-4xl font-extrabold font-mono">{stats?.total_detections || '---'}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">analytics</span>
          </div>
        </div>
        <div className="bg-[#1b1f2c] p-8 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/[0.02] transition-all">
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Avg. Latency</p>
            <h3 className="text-4xl font-extrabold font-mono text-emerald-500">
              {getLatency()}<span className="text-lg opacity-50 ml-1">ms</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">bolt</span>
          </div>
        </div>
        <div className="bg-[#1b1f2c] p-8 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/[0.02] transition-all">
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Active Connections</p>
            <h3 className="text-4xl font-extrabold font-mono">{stats?.active_users || '---'}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">hub</span>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-[#1b1f2c] p-8 rounded-2xl border border-white/5 mb-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg mb-1">Activity Pulse</h3>
            <p className="text-xs text-on-surface-variant">Real-time detection frequency (8-sample rolling window)</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono opacity-50 uppercase tracking-widest">
            <span>Low</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 rounded-sm bg-primary" style={{ opacity: i * 0.2 }}></div>)}
            </div>
            <span>High</span>
          </div>
        </div>
        <div className="flex gap-4 h-24 items-end px-2">
           {stats?.pulse && Array.isArray(stats.pulse) ? stats.pulse.map((val: number, i: number) => {
             const maxVal = Math.max(...(stats.pulse || []), 1);
             return (
               <motion.div 
                 key={i} 
                 initial={{ height: 0 }}
                 animate={{ height: `${(val / maxVal) * 100}%` }}
                 className="flex-1 rounded-t-lg bg-gradient-to-t from-primary/20 to-primary relative group"
               >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {val} det
                  </div>
               </motion.div>
             )
           }) : Array.from({length: 8}).map((_, i) => (
             <div key={i} className="flex-1 h-4 bg-white/5 rounded-t-lg animate-pulse" />
           ))}
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-mono opacity-30">
          <span>T-24h</span>
          <span>T-18h</span>
          <span>T-12h</span>
          <span>T-6h</span>
          <span>Live</span>
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="bg-[#0a0e1a] rounded-2xl border border-white/5 overflow-hidden font-mono shadow-2xl">
        <div className="bg-[#1b1f2c] px-6 py-4 flex justify-between items-center border-b border-white/5">
           <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              <span className="text-[11px] opacity-60 ml-4">root@signetra:~/$ tail -f detection.log</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-500/80 uppercase">Pipeline Live</span>
              </div>
              <span className="text-[10px] opacity-40 ml-4">Entries: {logs?.length || 0}</span>
           </div>
        </div>

        <div className="p-0 max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0a0e1a] z-10">
              <tr className="text-[10px] uppercase tracking-widest opacity-40 border-b border-white/5">
                <th className="px-8 py-4 font-bold">Timestamp</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4 font-bold">Event Message</th>
                <th className="px-8 py-4 font-bold">Origin</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(logs) && logs.map((log: any) => (
                <tr key={log.id} className="text-xs border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4 opacity-60 font-mono whitespace-nowrap">
                    {log.time ? new Date(log.time).toLocaleTimeString() : '---'}
                  </td>
                  <td className={`px-8 py-4 font-bold flex items-center gap-2 ${log.status === 'Success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <span className="material-symbols-outlined text-sm">
                      {log.status === 'Success' ? 'check_circle' : 'warning'}
                    </span>
                    {log.status || 'INFO'}
                  </td>
                  <td className="px-8 py-4 font-medium italic opacity-80">{log.event || 'System Event'}</td>
                  <td className="px-8 py-4 opacity-50 font-mono">NODE_US_EAST</td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && !loading && (
                <tr>
                  <td colSpan={4} className="py-20 text-center opacity-20 text-xs uppercase tracking-[0.2em]">
                    No recent activity logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-[#1b1f2c]/50 px-8 py-3 flex justify-between items-center text-[9px] font-mono opacity-40">
           <div className="flex gap-6">
             <span>BACKEND: ONLINE</span>
             <span>STREAM: ACTIVE</span>
             <span>MODEL: v2.4.1</span>
           </div>
           <span className="animate-pulse">_ LISTENING FOR EVENTS</span>
        </div>
      </div>
    </div>
  )
}

