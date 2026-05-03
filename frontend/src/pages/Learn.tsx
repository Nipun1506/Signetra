import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TUTORIALS, VIDEOS } from '../data/tutorials'
import { getLearningProgress } from '../utils/history'

export default function Learn() {
  const [activeTab, setActiveTab] = useState<'tutorials' | 'videos'>('tutorials')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(getLearningProgress())
  }, [])

  return (
    <div className="pt-24 px-10 pb-12 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Learning Module</h2>
          <p className="text-on-surface-variant max-w-md italic">Master the language of light and motion through our curated curriculum.</p>
        </div>
        <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('tutorials')}
            className={`px-6 py-2 rounded-lg text-sm transition-all ${activeTab === 'tutorials' ? 'bg-surface-container-highest text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface font-medium'}`}
          >
            Symbol Tutorials
          </button>
          <button 
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-2 rounded-lg text-sm transition-all ${activeTab === 'videos' ? 'bg-surface-container-highest text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface font-medium'}`}
          >
            Video Library
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {activeTab === 'tutorials' ? (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {TUTORIALS.map((t) => (
              <div key={t.id} className="bg-surface-container-high rounded-[14px] p-5 flex flex-col group hover:bg-surface-variant transition-all duration-300 border border-outline-variant/5">
                <div className="aspect-square bg-surface-container rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group/img">
                  <span className="material-symbols-outlined text-[80px] text-primary/20 absolute">{t.icon}</span>
                  <img src={t.img} alt={t.title} className="w-full h-full object-cover relative z-10 group-hover/img:scale-110 transition-transform duration-500 shadow-inner" onError={(e) => e.currentTarget.style.opacity = '0'} />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-on-surface">{t.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-${t.bg} text-${t.text} border border-primary/20`}>{t.difficulty}</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed italic">{t.description}</p>
                <Link to={`/practice/${t.title.toLowerCase()}`} className="mt-auto block">
                  <button className="w-full py-2.5 rounded-lg border border-primary/20 text-primary text-xs font-bold hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2">
                    PRACTICE <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-2 uppercase text-xs opacity-60 font-body">Digital Archives</h2>
              <p className="text-3xl font-extrabold text-on-surface">Video Library</p>
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                <input className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50" placeholder="Search Masterclasses..." type="text"/>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {VIDEOS.map((v) => (
              <div key={v.id} className="group cursor-pointer">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-xl shadow-blue-500/5">
                  <img src={v.img} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-90" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-[10px] font-bold text-white backdrop-blur-md">{v.duration}</div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors text-lg">{v.title}</h4>
                    <p className="text-on-surface-variant text-sm mt-1">{v.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Progress FAB: Moved to left-bottom and updated z-index */}
      <div className="fixed bottom-10 left-[104px] z-40">
        <Link to="/history" title="View Learning Progress">
          <button className="bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] w-14 h-14 rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center group relative border border-white/20 hover:scale-105 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-on-primary text-2xl group-hover:rotate-12 transition-transform">emoji_events</span>
            <div className="absolute -top-1 -right-1 bg-on-background text-[#00285d] text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary">{progress}%</div>
          </button>
        </Link>
      </div>
    </div>
  )
}
