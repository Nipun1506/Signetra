import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config'

const STATS_MAP = [
  { key: 'total_detections', label: 'Total Detections', icon: 'analytics', color: 'text-primary', sub: 'Logged in history' },
  { key: 'active_users', label: 'Active Users', icon: 'group', color: 'text-blue-400', sub: 'Live connections' },
  { key: 'new_gestures', label: 'Unique Gestures', icon: 'gesture', color: 'text-amber-500', sub: 'Distinct types used' },
  { key: 'system_latency', label: 'System Latency', icon: 'timer', color: 'text-rose-500', sub: 'Processing speed' },
]

const SIDEBAR_LINKS: { label: string; icon: string; action?: string; path?: string }[] = [
  { label: 'Main Dashboard', icon: 'dashboard', action: 'dashboard' },
  { label: 'Tutorial Manager', icon: 'video_library', action: 'YouTube Manager' },
  { label: 'User Logs', icon: 'assignment', path: '/admin/logs' },
]

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17] // Palm
];

function HandSkeleton({ landmarks }: { landmarks: any[] }) {
  if (!landmarks || landmarks.length < 21) return <div className="text-xs opacity-40">Invalid landmark data</div>;
  
  const scale = 300;
  const padding = 50;

  return (
    <svg viewBox={`0 0 ${scale + padding*2} ${scale + padding*2}`} className="w-full h-full drop-shadow-2xl">
      {/* Connections */}
      {HAND_CONNECTIONS.map(([start, end], i) => (
        <line
          key={i}
          x1={landmarks[start].x * scale + padding}
          y1={landmarks[start].y * scale + padding}
          x2={landmarks[end].x * scale + padding}
          y2={landmarks[end].y * scale + padding}
          stroke="#adc6ff"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-40"
        />
      ))}
      {/* Joints */}
      {landmarks.map((lm, i) => (
        <circle
          key={i}
          cx={lm.x * scale + padding}
          cy={lm.y * scale + padding}
          r={i === 0 ? "8" : "4"}
          fill={i % 4 === 0 ? "#adc6ff" : "#4d8eff"}
        />
      ))}
    </svg>
  );
}

export default function Admin() {
  const navigate = useNavigate()
  const { role } = useAuth();
  const [activeTab, setActiveTab ] = useState('Main Dashboard')
  const [activeManagerTab, setActiveManagerTab] = useState('YouTube Manager')
  const [showAddTutorial, setShowAddTutorial] = useState(false)
  const [selectedGesture, setSelectedGesture] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  
  // Manager Lists
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [gestures, setGestures] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Add Tutorial Form State
  const [newTutorial, setNewTutorial] = useState({ youtube_url: '', title: '', difficulty: 'Beginner' });

  useEffect(() => {
    const token = localStorage.getItem('signetra_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchAllData = () => {
      fetchTutorials();
      fetchGestures();
      fetchHistory();
      fetchLogs();
      fetchStats();
    };

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
        if (res.status === 401) return;
        const data = await res.json();
        setLiveStats(data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const generatePath = (data: number[], isArea = false) => {
    if (!data || data.length < 2) return "";
    const width = 800;
    const height = 200;
    const max = Math.max(...data, 100);
    const step = width / (data.length - 1);
    
    let path = `M 0,${height - (data[0] / max) * height}`;
    
    for (let i = 1; i < data.length; i++) {
        const x = i * step;
        const y = height - (data[i] / max) * height;
        const prevX = (i - 1) * step;
        const prevY = height - (data[i-1] / max) * height;
        // Cubic bezier for smooth curves
        path += ` C ${prevX + step/2},${prevY} ${x - step/2},${y} ${x},${y}`;
    }

    if (isArea) {
      path += ` L ${width},250 L 0,250 Z`;
    }
    return path;
  };

  const fetchTutorials = async () => {
    const token = localStorage.getItem('signetra_token');
    const res = await fetch(`${API_BASE_URL}/api/tutorials`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setTutorials(await res.json());
  };

  const fetchGestures = async () => {
    const token = localStorage.getItem('signetra_token');
    const res = await fetch(`${API_BASE_URL}/api/admin/gestures`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setGestures(await res.json());
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem('signetra_token');
    const res = await fetch(`${API_BASE_URL}/api/history/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setHistory(await res.json());
  };

  const fetchLogs = async () => {
    const token = localStorage.getItem('signetra_token');
    const res = await fetch(`${API_BASE_URL}/api/admin/logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setLogs(await res.json());
  };

  const handleAddTutorial = async () => {
    if (!newTutorial.youtube_url) return alert("URL is required");
    try {
      const token = localStorage.getItem('signetra_token');
      await fetch(`${API_BASE_URL}/api/tutorials`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTutorial)
      });
      setShowAddTutorial(false);
      setNewTutorial({ youtube_url: '', title: '', difficulty: 'Beginner' });
      fetchTutorials();
    } catch (err) {
      alert("Failed to add tutorial");
    }
  };

  const handleDeleteTutorial = async (id: number) => {
    if (confirm("Delete this tutorial?")) {
      const token = localStorage.getItem('signetra_token');
      await fetch(`${API_BASE_URL}/api/tutorials/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTutorials();
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('signetra_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/export-metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signetra_admin_metrics_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export metrics");
    }
  };

  const handleSystemRestart = async () => {
    if (confirm("Soft-restart the AI pipeline? Current connections will stay active.")) {
      try {
        const token = localStorage.getItem('signetra_token');
        const res = await fetch(`${API_BASE_URL}/api/admin/restart`, { 
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        alert(data.message);
      } catch (err) {
        alert("Restart failed");
      }
    }
  };

  const handleGlobalNotify = async () => {
    const msg = prompt("Enter global notification message:");
    if (msg) {
      try {
        const token = localStorage.getItem('signetra_token');
        await fetch(`${API_BASE_URL}/api/admin/notify`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: msg })
        });
        alert("Notification sent to all active users.");
      } catch (err) {
        alert("Failed to send notification");
      }
    }
  };

  const handlePopulate = async () => {
    if (confirm("Populate gesture library with default templates? This will reload the AI classifier.")) {
      try {
        const token = localStorage.getItem('signetra_token');
        const res = await fetch(`${API_BASE_URL}/api/admin/populate`, { 
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        alert(data.message);
        fetchGestures();
      } catch (err) {
        alert("Population failed");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f131f] text-white">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a101f] flex flex-col pt-24 pb-8">
        <div className="px-6 mb-10">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] flex items-center justify-center text-xs font-bold shadow-lg shadow-primary/20">NP</div>
              <div>
                 <h4 className="text-xs font-bold">Nipun</h4>
                 <p className="text-[10px] opacity-40 uppercase tracking-widest leading-none mt-1">Lead Administrator</p>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
           {SIDEBAR_LINKS.map(link => {
             const content = (
               <div 
                 onClick={() => {
                   if (link.action) {
                     setActiveTab(link.label);
                     if (link.action === 'dashboard') {
                        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                     } else {
                        setActiveManagerTab(link.action);
                        document.getElementById('manager-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                     }
                   } else if (link.path) {
                     setActiveTab(link.label);
                   }
                 }}
                 className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer group ${activeTab === link.label ? 'bg-primary text-[#001a42]' : 'hover:bg-white/5 text-on-surface-variant'}`}
               >
                 <span className={`material-symbols-outlined text-xl ${activeTab === link.label ? '' : 'group-hover:text-primary'}`}>{link.icon}</span>
                 <span className="text-sm font-medium">{link.label}</span>
                 {activeTab === link.label && <motion.div layoutId="active" className="ml-auto w-1 h-4 bg-[#001a42]/40 rounded-full" />}
               </div>
             );

             return link.path ? (
               <Link key={link.label} to={link.path}>
                 {content}
               </Link>
             ) : (
               <React.Fragment key={link.label}>
                 {content}
               </React.Fragment>
             );
           })}
        </nav>

        <div className="px-6 space-y-4">
           <div className="pt-4 border-t border-white/5">
              <div onClick={() => navigate('/admin/docs')} className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-white transition-colors cursor-pointer group">
                 <span className="material-symbols-outlined text-lg group-hover:text-primary transition-colors">help</span>
                 <span className="text-xs font-medium">Documentation</span>
              </div>
              <div onClick={() => navigate('/support')} className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-white transition-colors cursor-pointer group">
                 <span className="material-symbols-outlined text-lg group-hover:text-primary transition-colors">support</span>
                 <span className="text-xs font-medium">Support</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-10 pt-24 overflow-y-auto relative">
        {/* Top Floating Header */}
        <div className="flex justify-between items-center mb-10">
           <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Backend Server: Online</span>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <span 
                onClick={() => {
                   setActiveManagerTab('System Logs');
                   document.getElementById('manager-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="material-symbols-outlined opacity-40 hover:opacity-100 cursor-pointer transition-opacity"
              >
                notifications
              </span>
              <span 
                onClick={() => navigate('/admin/docs')}
                className="material-symbols-outlined opacity-40 hover:opacity-100 cursor-pointer transition-opacity title='Help Documentation'"
              >
                help
              </span>
              <div 
                onClick={() => navigate('/profile')}
                className="w-8 h-8 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-primary/20 transition-all title='Your Profile'"
              >
                NP
              </div>
           </div>
        </div>

        {/* Global Action Header - Lead Admin Only */}
        {role === 'lead_admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
           <button 
             onClick={handlePopulate}
             className="bg-[#1b1f2c] p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-all group"
           >
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined">database</span>
             </div>
             <div className="text-left">
               <h4 className="text-sm font-bold">Initialize System</h4>
               <p className="text-[10px] opacity-40">Seed gesture library</p>
             </div>
           </button>
           <button 
             onClick={handleExportCSV}
             className="bg-[#1b1f2c] p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-all group"
           >
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined">description</span>
             </div>
             <div className="text-left">
               <h4 className="text-sm font-bold">Export CSV Summary</h4>
               <p className="text-[10px] opacity-40">Download metrics</p>
             </div>
           </button>
           <button 
             onClick={handleSystemRestart}
             className="bg-[#1b1f2c] p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-all group"
           >
             <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined">refresh</span>
             </div>
             <div className="text-left">
               <h4 className="text-sm font-bold">System Restart</h4>
               <p className="text-[10px] opacity-40">Soft reset AI pipeline</p>
             </div>
           </button>
           <button 
             onClick={handleGlobalNotify}
             className="bg-[#1b1f2c] p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-all group"
           >
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined">campaign</span>
             </div>
             <div className="text-left">
               <h4 className="text-sm font-bold">Global Notification</h4>
               <p className="text-[10px] opacity-40">Alert all users</p>
             </div>
           </button>
        </div>
        )}

        {/* Hero Dashboard Section */}
        <div className="flex justify-between items-end mb-8">
           <div>
              <h2 className="text-3xl font-extrabold tracking-tighter uppercase">Admin Dashboard</h2>
              <p className="text-sm text-on-surface-variant mt-1">System-wide monitoring and content curation.</p>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {STATS_MAP.map(stat => (
             <div key={stat.key} className="bg-[#1b1f2c] p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity">
                  <span className={`material-symbols-outlined text-5xl ${stat.color}`}>{stat.icon}</span>
                </div>
                <div className="flex justify-between items-start mb-6">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{stat.label}</p>
                   <span className="material-symbols-outlined text-xs text-primary">trending_up</span>
                </div>
                <h3 className="text-4xl font-extrabold mb-1">
                  {liveStats ? liveStats[stat.key] : '---'}
                </h3>
                <p className="text-[10px] font-medium opacity-50">
                  {stat.key === 'active_users' ? 'Currently online' : stat.key === 'new_gestures' ? 'In gesture library' : stat.key === 'system_latency' ? 'Optimal range' : '+12.4%'}
                </p>
             </div>
           ))}
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Chart Bento */}
           <div className="lg:col-span-2 bg-[#1b1f2c] p-10 rounded-[2.5rem] border border-white/5">
              <div className="flex justify-between items-center mb-10">
                 <div>
                   <h3 className="text-xl font-bold mb-1">User Activity Pulse</h3>
                   <p className="text-xs text-on-surface-variant">Real-time engagement tracking</p>
                 </div>
                 <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-primary"></div>
                       <span className="text-[10px] font-bold opacity-60">Active Sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-white/20"></div>
                       <span className="text-[10px] font-bold opacity-60">Detections</span>
                    </div>
                 </div>
              </div>
               <div className="relative h-64 flex items-end">
                  <svg 
                    className="absolute inset-0 w-full h-full overflow-hidden" 
                    viewBox="0 0 800 250" 
                    preserveAspectRatio="none"
                  >
                     <path 
                       d={liveStats?.pulse ? generatePath(liveStats.pulse, true) : "M0,200 Q400,100 800,200 L800,250 L0,250 Z"} 
                       fill="url(#pulse-gradient)" 
                       className="opacity-40 transition-all duration-1000"
                     />
                     <path 
                       d={liveStats?.pulse ? generatePath(liveStats.pulse, false) : "M0,200 Q400,100 800,200"} 
                       fill="none" 
                       stroke={liveStats ? "#adc6ff" : "rgba(255,255,255,0.1)"}
                       strokeWidth="3" 
                       strokeDasharray="8 8"
                       className="transition-all duration-1000"
                     />
                     <defs>
                       <linearGradient id="pulse-gradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#adc6ff" />
                         <stop offset="100%" stopColor="transparent" />
                       </linearGradient>
                     </defs>
                  </svg>
                 <div className="absolute bottom-0 w-full flex justify-between text-[10px] font-mono opacity-30 mt-4 pt-4 border-t border-white/5">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>23:59</span>
                 </div>
              </div>
           </div>

           {/* Popular Signs Bento */}
            <div className="bg-[#1b1f2c] p-10 rounded-[2.5rem] border border-white/5">
                <h3 className="text-xl font-bold mb-8">Popular Signs</h3>
                <div className="space-y-8">
                  {liveStats?.popular_signs?.length > 0 ? (
                    liveStats.popular_signs.map((sign: any, idx: number) => {
                      const maxVal = Math.max(...liveStats.popular_signs.map((s: any) => s.val), 1);
                      return (
                        <div key={sign.name}>
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold opacity-60 uppercase tracking-widest leading-none">{sign.name}</span>
                              <span className="text-xs font-mono font-bold">{sign.val >= 1000 ? `${(sign.val/1000).toFixed(1)}k` : sign.val}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(sign.val / maxVal) * 100}%` }}
                                className="h-full bg-primary"
                              />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 opacity-20">
                      <span className="material-symbols-outlined text-4xl mb-2">history</span>
                      <p className="text-[10px] font-black uppercase tracking-widest">No detection history yet</p>
                    </div>
                  )}
                </div>
            </div>
        </div>

        <section id="manager-section" className="mt-16 bg-[#1b1f2c] rounded-[2.5rem] border border-white/5 overflow-hidden">
           <div className="flex border-b border-white/5 items-center justify-between pr-10">
              <div className="flex">
                {['YouTube Manager', 'Gesture Library', 'User History', 'System Logs'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveManagerTab(tab)}
                    className={`px-10 py-6 text-sm font-bold uppercase tracking-widest transition-all ${activeManagerTab === tab ? 'text-primary border-b-2 border-primary bg-primary/5' : 'opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeManagerTab === 'YouTube Manager' && (
                <button 
                  onClick={() => setShowAddTutorial(true)}
                  className="bg-primary px-6 py-2 rounded-xl text-sm font-bold text-[#001a42] flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add Tutorial
                </button>
              )}
           </div>
           
           <div className="p-10">
              {activeManagerTab === 'YouTube Manager' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest opacity-40 border-b border-white/5">
                      <th className="pb-6 px-4">Thumbnail</th>
                      <th className="pb-6 px-4">Tutorial Name</th>
                      <th className="pb-6 px-4">Language</th>
                      <th className="pb-6 px-4">Difficulty</th>
                      <th className="pb-6 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutorials.map(tutorial => (
                      <tr key={tutorial.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                        <td className="py-6 px-4">
                           <div className="w-20 h-12 rounded-lg overflow-hidden border border-white/10 bg-black">
                              <img src={tutorial.thumbnail_url} className="w-full h-full object-cover" onError={(e:any) => e.target.src="https://via.placeholder.com/160x90?text=Tutorial"} />
                           </div>
                        </td>
                        <td className="py-6 px-4">
                           <p className="text-sm font-bold">{tutorial.title}</p>
                        </td>
                        <td className="py-6 px-4">
                           <span className="text-xs opacity-60">ASL</span>
                        </td>
                        <td className="py-6 px-4">
                           <span className="bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{tutorial.difficulty}</span>
                        </td>
                        <td className="py-6 px-4 text-right">
                           <div className="flex justify-end gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-lg cursor-pointer hover:text-rose-500 transition-colors" onClick={() => handleDeleteTutorial(tutorial.id)}>delete</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {tutorials.length === 0 && (
                      <tr><td colSpan={5} className="py-20 text-center opacity-20 text-xs uppercase tracking-[0.2em]">No tutorials found</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeManagerTab === 'Gesture Library' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {gestures.map(gesture => (
                    <div key={gesture.id} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold">{gesture.name}</h4>
                          <p className="text-[10px] opacity-40 uppercase tracking-widest">{gesture.category}</p>
                        </div>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[8px] font-bold">{gesture.difficulty}</span>
                      </div>
                      <div className="text-[10px] opacity-60 font-mono bg-black/20 p-3 rounded-lg border border-white/5 line-clamp-2">
                        {gesture.phrase}
                      </div>
                      <button 
                        onClick={() => setSelectedGesture(gesture)}
                        className="w-full py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-[#001a42] transition-all"
                      >
                        View Landmarks
                      </button>
                    </div>
                  ))}
                  {gestures.length === 0 && <div className="col-span-3 py-20 text-center opacity-20 text-xs uppercase tracking-[0.2em]">No gesture templates trained</div>}
                </div>
              )}

              {activeManagerTab === 'User History' && (
                <div className="space-y-4">
                  {history.slice(0, 10).map((h: any) => (
                    <div key={h.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-sm">history</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{h.phrase}</p>
                          <p className="text-[10px] opacity-40">{new Date(h.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-primary">{Math.round(h.confidence)}% Confidence</span>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest">{h.platform}</p>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && <div className="py-20 text-center opacity-20 text-xs uppercase tracking-[0.2em]">History is empty</div>}
                </div>
              )}

              {activeManagerTab === 'System Logs' && (
                <div className="font-mono text-[11px] space-y-3 bg-black/40 p-8 rounded-3xl border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                   {logs.map((log: any) => (
                     <div key={log.id} className="flex flex-wrap gap-x-4 border-b border-white/5 pb-2 hover:bg-white/[0.02] transition-colors">
                        <span className="opacity-30 whitespace-nowrap">[{new Date(log.time).toLocaleTimeString()}]</span>
                        <span className="text-primary font-bold whitespace-nowrap">@{log.user || 'SYSTEM'}</span>
                        <span className={`px-2 rounded ${log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{log.status}</span>
                        <span className="opacity-60">{log.event}</span>
                     </div>
                   ))}
                   {logs.length === 0 && <div className="py-10 text-center opacity-20 uppercase tracking-[0.2em]">Scanning logs...</div>}
                </div>
              )}
           </div>
        </section>

        {/* Gesture Library Section */}
        <section className="mt-12">
           <h3 className="text-2xl font-bold mb-8">Gesture Library</h3>
           <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <div className="bg-[#1b1f2c] p-6 rounded-3xl border border-white/5 relative group">
                 <div className="aspect-square rounded-2xl bg-[#0a0e1a] mb-4 flex items-center justify-center border border-white/5 overflow-hidden">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6zhv96_Xz7ARgeGgTWiHOAzvgCk7zK2VwOA4v9iRttmlYPUMJM8SUIJ1d7zcvSCZXeJX8CxTKEtRZz8qtFmlE4YyPQ58bw2FgcpDw-b3ISO4wY6SCPEC0LWbMd5RVmU_nda6i7wxXKI4pd7p-7a7bioiQvjtwn3sKlls50FmGxA69mwZS-sK53ZqkpWByvWVI1BqoyIi4Ret3c5uQZbiHF9tVTnSLs6qhndPjgiz1QUlVAE86X7-_UnrGdcbJXS3nA3VOfBoj6gE" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                 </div>
                 <h4 className="text-xs font-bold mb-1">Gesture: Alpha_A</h4>
                 <p className="text-[10px] opacity-40 leading-tight">JSON Landmarks:<br/>Validated</p>
                 <div className="absolute inset-0 bg-primary/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-3xl p-4 text-[#001a42]">
                    <span className="material-symbols-outlined text-4xl mb-2">gesture</span>
                    <button className="text-[10px] font-black uppercase tracking-widest border-2 border-[#001a42] px-4 py-2 rounded-xl">Edit Landmarks</button>
                 </div>
              </div>
              <div className="bg-[#0a0e1a] p-6 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-colors group">
                 <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined opacity-40">add</span>
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Train New Gesture</h4>
              </div>
           </div>
        </section>

      </main>

      {/* Add Tutorial Side Tray */}
      <AnimatePresence>
        {showAddTutorial && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddTutorial(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-screen w-[480px] bg-[#1b1f2c] border-l border-white/5 z-[101] p-12 shadow-2xl"
            >
               <div className="flex justify-between items-center mb-12">
                  <h3 className="text-2xl font-extrabold uppercase tracking-tighter">Add New Tutorial</h3>
                  <button onClick={() => setShowAddTutorial(false)} className="material-symbols-outlined opacity-40 hover:opacity-100 transition-opacity">close</button>
               </div>
               <div className="space-y-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">YouTube URL</label>
                     <input 
                       value={newTutorial.youtube_url}
                       onChange={(e) => setNewTutorial({...newTutorial, youtube_url: e.target.value})}
                       className="w-full bg-[#0a0e1a] border border-white/5 rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:opacity-20" 
                       placeholder="https://youtube.com/..." 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tutorial Title</label>
                     <input 
                       value={newTutorial.title}
                       onChange={(e) => setNewTutorial({...newTutorial, title: e.target.value})}
                       className="w-full bg-[#0a0e1a] border border-white/5 rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:opacity-20" 
                       placeholder="Advanced Expression" 
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Language</label>
                        <select className="w-full bg-[#0a0e1a] border border-white/5 rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
                           <option>ASL</option>
                           <option>BSL</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Difficulty</label>
                        <select 
                          value={newTutorial.difficulty}
                          onChange={(e) => setNewTutorial({...newTutorial, difficulty: e.target.value})}
                          className="w-full bg-[#0a0e1a] border border-white/5 rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                        >
                           <option>Beginner</option>
                           <option>Intermediate</option>
                           <option>Advanced</option>
                        </select>
                     </div>
                  </div>
               </div>
               <div className="absolute bottom-12 left-12 right-12">
                  <button 
                    onClick={handleAddTutorial}
                    className="w-full py-5 bg-[#adc6ff] text-[#001a42] rounded-2xl font-extrabold uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] transition-transform"
                  >
                    Save & Publish
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Landmark Visualizer Modal */}
      <AnimatePresence>
        {selectedGesture && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGesture(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[300]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[301] pointer-events-none">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-[500px] h-[640px] bg-[#1b1f2c] rounded-[3rem] border border-white/10 p-12 flex flex-col items-center shadow-2xl pointer-events-auto"
              >
                  <div className="w-full flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Landmark Signature</h3>
                      <p className="text-xs opacity-40 uppercase tracking-widest leading-none mt-2">Gesture: {selectedGesture.name}</p>
                    </div>
                    <button onClick={() => setSelectedGesture(null)} className="material-symbols-outlined text-white/40 hover:text-white transition-colors">close</button>
                  </div>
                  
                  <div className="w-full flex-1 bg-[#0a0e1a] rounded-[2rem] border border-white/5 p-8 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
                    <HandSkeleton landmarks={(() => {
                        try {
                          const data = typeof selectedGesture.landmark_json === 'string' ? JSON.parse(selectedGesture.landmark_json) : selectedGesture.landmark_json;
                          return Array.isArray(data) ? data : [];
                        } catch(e) {
                          return [];
                        }
                    })()} />
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] opacity-40 uppercase tracking-widest mb-1">Phrase</p>
                      <p className="text-sm font-bold text-white">{selectedGesture.phrase}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] opacity-40 uppercase tracking-widest mb-1">Dimensions</p>
                      <p className="text-sm font-bold text-white">21 Nodes / 3D</p>
                    </div>
                  </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
