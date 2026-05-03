import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function AdminDocumentation() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Architecture & Infrastructure",
      icon: "account_tree",
      content: [
        { label: "Frontend Stack", detail: "React 18, Vite, TypeScript, TailwindCSS v3, Framer Motion." },
        { label: "Backend Core", detail: "Python FastAPI with SQLAlchemy ORM and SQLite." },
        { label: "AI Engine", detail: "MediaPipe Holistic heuristics for real-time skeletal tracking." }
      ]
    },
    {
      title: "AI Pipeline Details",
      icon: "neurology",
      content: [
        { label: "Landmark Count", detail: "21 nodes per hand in 3D coordinate space." },
        { label: "FPS Target", detail: "Optimized for 30FPS @ 640x480 resolution." },
        { label: "Thresholds", detail: "Global confidence minimum set to 0.7 (70%)." }
      ]
    },
    {
      title: "API Interface (v1)",
      icon: "api",
      content: [
        { label: "GET /api/admin/stats", detail: "Retrieves live aggregation metrics for dashboard cards." },
        { label: "GET /api/admin/gestures", detail: "Lists all gesture templates and their 3D signatures." },
        { label: "POST /api/admin/notify", detail: "Broadcasts WebSocket messages to all connected clients." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f131f] text-white p-10 pt-24 font-inter">
      {/* Back Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-6xl mx-auto flex items-center gap-6 mb-12"
      >
        <button 
          onClick={() => navigate('/admin')}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all group"
        >
          <span className="material-symbols-outlined text-xl opacity-40 group-hover:opacity-100 transition-opacity">arrow_back</span>
        </button>
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">System Documentation</h1>
           <p className="text-xs opacity-40 uppercase tracking-[0.3em] mt-1">Signetra Protocol v1.4.2</p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-12">
          {/* Quick Start Guide */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1b2235] rounded-[3rem] p-12 border border-white/5 shadow-2xl"
          >
             <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">rocket_launch</span>
                Quick Start Deployment
             </h2>
             <div className="space-y-8">
                <div className="bg-[#0a0e1a] p-8 rounded-3xl border border-white/5 font-mono text-sm">
                   <p className="text-primary mb-2"># Docker Deployment</p>
                   <code className="text-white/60">docker-compose up --build -d</code>
                </div>
                <div className="bg-[#0a0e1a] p-8 rounded-3xl border border-white/5 font-mono text-sm leading-relaxed">
                   <p className="text-primary mb-2"># Manual Dev Mode</p>
                   <p className="text-white/40">1. cd backend && python main.py</p>
                   <p className="text-white/40">2. cd frontend && npm run dev</p>
                </div>
             </div>
          </motion.section>

          {/* Detailed Specs */}
          <div className="grid grid-cols-1 gap-8">
              {sections.map((sec, idx) => (
                <motion.div 
                  key={sec.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5"
                >
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <span className="material-symbols-outlined opacity-40">{sec.icon}</span>
                      {sec.title}
                   </h3>
                   <div className="space-y-4">
                      {sec.content.map(item => (
                        <div key={item.label} className="flex justify-between border-b border-white/5 pb-4">
                           <span className="text-xs uppercase tracking-widest opacity-40">{item.label}</span>
                           <span className="text-sm font-medium text-primary-fixed">{item.detail}</span>
                        </div>
                      ))}
                   </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Side Stats/Status Area */}
        <div className="space-y-8">
           <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-primary/10 to-transparent p-10 rounded-[3rem] border border-primary/20"
           >
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Environment Status</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold">Mainnet Ready</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold">API v1.0.1 Online</span>
                 </div>
              </div>
           </motion.div>


        </div>
      </div>
    </div>
  )
}
