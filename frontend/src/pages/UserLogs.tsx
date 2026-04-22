import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const LOGS = [
  { id: 1, timestamp: '14:02:11.452', type: 'Detection', payload: "Gesture 'HELP' detected - 98% Conf", device: 'Webcam #1', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 2, timestamp: '14:02:10.981', type: 'WS Connection', payload: "Handshake established with node_us_east_2", device: 'iPhone 15 Pro', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 3, timestamp: '14:02:08.224', type: 'Camera Error', payload: "Frame buffer overflow (0x00FF2A) - dropping 3 frames", device: 'Extension 4', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { id: 4, timestamp: '14:01:55.112', type: 'Detection', payload: "Gesture 'THANK_YOU' detected - 94% Conf", device: 'Webcam #1', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 5, timestamp: '14:01:42.003', type: 'System Event', payload: "Model vocabulary refreshed from registry v2.4.1", device: 'System', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 6, timestamp: '14:01:38.991', type: 'Detection', payload: "Gesture 'HELLO' detected - 99% Conf", device: 'iPhone 15 Pro', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
]

export default function UserLogs() {
  return (
    <div className="pt-24 px-10 pb-12 min-h-screen bg-[#0f131f] text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-extrabold tracking-tighter uppercase font-mono">System Terminal</h2>
          <div className="flex gap-4 text-xs font-mono opacity-60">
            <Link to="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
            <span>Metrics</span>
            <span>Users</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono hover:bg-white/10 transition-all">Clear Logs</button>
          <button className="px-6 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg text-xs font-mono hover:bg-primary/30 transition-all">Export CSV</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1b1f2c] p-8 rounded-2xl border border-white/5 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Detections / Min</p>
            <h3 className="text-4xl font-extrabold font-mono">42</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">analytics</span>
          </div>
        </div>
        <div className="bg-[#1b1f2c] p-8 rounded-2xl border border-white/5 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Avg. Latency</p>
            <h3 className="text-4xl font-extrabold font-mono text-emerald-500">12<span className="text-lg opacity-50 ml-1">ms</span></h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <span className="material-symbols-outlined">bolt</span>
          </div>
        </div>
        <div className="bg-[#1b1f2c] p-8 rounded-2xl border border-white/5 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Active Connections</p>
            <h3 className="text-4xl font-extrabold font-mono">156</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <span className="material-symbols-outlined">hub</span>
          </div>
        </div>
      </div>

      {/* Activity Heatmap Placeholder */}
      <div className="bg-[#1b1f2c] p-8 rounded-2xl border border-white/5 mb-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg mb-1">Activity Heatmap</h3>
            <p className="text-xs text-on-surface-variant">Usage density mapped across 24-hour cycle</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono opacity-50 uppercase tracking-widest">
            <span>Low</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-3 rounded-sm bg-primary/${i*20}`}></div>)}
            </div>
            <span>High</span>
          </div>
        </div>
        <div className="flex gap-2 h-16 items-end">
           {Array.from({length: 24}).map((_, i) => (
             <div key={i} className={`flex-1 rounded-md bg-primary/${Math.floor(Math.random() * 80 + 20)}`} style={{ height: `${Math.random() * 100}%` }}></div>
           ))}
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-mono opacity-30">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:59</span>
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
              <span className="text-[11px] opacity-60 ml-4">root@signetra:~/$ tail -f system.log</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-500/80">LIVE FEED</span>
              </div>
              <span className="text-[10px] opacity-40 ml-4">Total Entries: 14,209</span>
           </div>
        </div>

        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest opacity-40 border-b border-white/5">
                <th className="px-8 py-4 font-bold">Timestamp</th>
                <th className="px-8 py-4 font-bold">Event Type</th>
                <th className="px-8 py-4 font-bold">Payload Summary</th>
                <th className="px-8 py-4 font-bold">Device</th>
              </tr>
            </thead>
            <tbody>
              {LOGS.map((log) => (
                <tr key={log.id} className={`text-xs border-b border-white/5 hover:bg-white/[0.02] transition-colors ${log.border ? 'bg-rose-500/5' : ''}`}>
                  <td className="px-8 py-4 opacity-60">{log.timestamp}</td>
                  <td className={`px-8 py-4 font-bold flex items-center gap-2 ${log.color}`}>
                    <span className="material-symbols-outlined text-sm">{log.type === 'Detection' ? 'check_circle' : log.type.includes('Camera') ? 'error' : 'info'}</span>
                    {log.type}
                  </td>
                  <td className="px-8 py-4 font-medium italic opacity-80">{log.payload}</td>
                  <td className="px-8 py-4 opacity-50">{log.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-[#1b1f2c]/50 px-8 py-3 flex justify-between items-center text-[9px] font-mono opacity-40">
           <div className="flex gap-6">
             <span>UPTIME: 42D 11H 04M</span>
             <span>CPU: 12%</span>
             <span>MEM: 2.4GB / 8GB</span>
           </div>
           <span>READY FOR COMMANDS _</span>
        </div>
      </div>
    </div>
  )
}
