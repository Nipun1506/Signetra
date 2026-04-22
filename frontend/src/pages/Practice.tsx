import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { logGestureHistory } from '../utils/history'
import { TUTORIALS } from '../data/tutorials'

export default function Practice() {
  const { gestureId } = useParams()
  const [isActive, setIsActive] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [status, setStatus] = useState('CALIBRATING')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const frameIntervalRef = useRef<number | null>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const currentTutorial = TUTORIALS.find(t => t.title.toLowerCase() === gestureId?.toLowerCase())
  const referenceImage = currentTutorial?.img || "https://lh3.googleusercontent.com/aida-public/AB6AXuA6vbUq3RJd73uTQ9kPz_EWd5KbmODzcqravX38ccCdA6h3GH8RqknID62VrC7XLy_o_CEsx4rUa5Vl1-jhvuUY_JUIAHlLMMvvOQPnAwsp9o2JAVpUT-pCmT-L5uhnbzLbFeAViu6308pJkxd99DMdODE2_aULlNMcWD5z9NPXybOhTc5Fud7uvWOOdWKgfpRP_gZl2i3FNi9HDpCSeHZofQsQahkfF754LpzdeAwy5Xa37mSqPXvW7O7p_g2Ah9fjWycOFOf0ngo"

  // Trigger popup when high accuracy is met
  useEffect(() => {
    if (accuracy >= 85 && status === 'MOTION PERFECT' && !showLevelUp) {
      setShowLevelUp(true)
      if (gestureId) {
        logGestureHistory(gestureId, accuracy, 'Webcam (Practice)')
      }
      const timer = setTimeout(() => setShowLevelUp(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [accuracy, status])

  useEffect(() => {
    if (isActive) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [isActive])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraError(null)
      connectWs()
    } catch (err: any) {
      console.error("Camera error:", err)
      setCameraError(err.name === 'NotAllowedError' ? 'Permission Denied' : 'Insecure Context / No Camera')
    }
  }

  const stopCamera = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = null
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
  }

  const connectWs = () => {
    const host = window.location.hostname
    wsRef.current = new WebSocket(`ws://${host}:8000/ws/detection`)
    
    wsRef.current.onopen = () => {
      frameIntervalRef.current = window.setInterval(() => {
        sendFrame()
      }, 100)
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // Check against current tutorial's phrase
      const expectedPhrase = currentTutorial?.phrase || gestureId?.toUpperCase()
      if (data.phrase && data.phrase === expectedPhrase) {
        setAccuracy(data.confidence)
        setStatus('MOTION PERFECT')
      } else {
        setAccuracy(prev => Math.max(0, prev - 5))
        setStatus('CALIBRATING')
      }
    }
    
    wsRef.current.onclose = () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)
    }
  }

  const sendFrame = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return

    const MAX_W = 320
    const scale = Math.min(1, MAX_W / video.videoWidth)
    const targetWidth = Math.floor(video.videoWidth * scale)
    const targetHeight = Math.floor(video.videoHeight * scale)

    if (!captureCanvasRef.current) captureCanvasRef.current = document.createElement('canvas')
    const canvas = captureCanvasRef.current
    if (canvas.width !== targetWidth) {
      canvas.width = targetWidth
      canvas.height = targetHeight
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight)

    const frameB64 = canvas.toDataURL('image/jpeg', 0.4).split(',')[1]
    const token = localStorage.getItem('signetra_token') || ""
    wsRef.current.send(JSON.stringify({
      frame: frameB64,
      mode: 'text',
      source: 'webcam',
      token: token
    }))
  }

  return (
    <div className="pt-16 min-h-screen bg-[#0f131f] text-white font-body overflow-x-hidden">
      {/* Top Header Navigation */}
      <nav className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#0f131f]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold tracking-tight text-[#adc6ff]">Signetra</h1>
          <div className="flex gap-6 text-sm font-medium text-on-surface-variant">
             <Link to="/admin" className="hover:text-white transition-colors">Dashboard</Link>
             <span className="text-white border-b-2 border-primary pb-1">Practice</span>
             <Link to="/learn" className="hover:text-white transition-colors">Library</Link>
             <Link to="/history" className="hover:text-white transition-colors">History</Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white">settings</span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white">help</span>
          <div className="w-8 h-8 rounded-full bg-primary-container border border-primary/20 flex items-center justify-center text-xs font-bold">JD</div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)] pt-6">
        {/* Left Vertical Controls */}
        <aside className="w-16 flex flex-col items-center py-8 gap-10 border-r border-white/5">
          <div className="p-2 bg-primary/20 rounded-lg text-primary cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>back_hand</span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined">speed</span>
            <span className="text-[8px] font-bold uppercase tracking-tighter">Speed</span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="text-[8px] font-bold uppercase tracking-tighter">Guidance</span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined">mic</span>
            <span className="text-[8px] font-bold uppercase tracking-tighter">Voice</span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined">keyboard</span>
            <span className="text-[8px] font-bold uppercase tracking-tighter">Shortcuts</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 overflow-y-auto">
          {/* Practice Header Area */}
          <div className="flex justify-between items-start mb-10">
            <div className="flex flex-col gap-2">
              <Link to="/learn" className="w-fit bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 transition-all text-sm font-medium">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Learn
              </Link>
              <div className="mt-2">
                <h2 className="text-4xl font-extrabold tracking-tighter uppercase text-white">ASL: {gestureId || "HELLO"}</h2>
                <p className="text-primary/80 font-bold text-sm tracking-widest uppercase mt-1">Lesson Module</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Reference Card */}
            <div className="relative aspect-square bg-[#1b1f2c] rounded-[2rem] overflow-hidden border border-white/5 group shadow-2xl">
              <div className="absolute top-6 left-6 z-20">
                <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-[#001a42]">Reference</span>
              </div>
              <img 
                src={referenceImage} 
                alt="Reference" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80"
              />
              {/* Bottom Controls */}
              <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all">
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
                <div className="flex-1 mx-8 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 w-1/3"></div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-on-surface-variant hover:text-white transition-colors">0.5x</button>
                  <button className="px-3 py-1 bg-primary/20 rounded-lg text-[10px] font-bold text-primary">1x</button>
                </div>
              </div>
            </div>

            {/* Vision Workspace */}
            <div className="relative aspect-square bg-[#0a0e1a] rounded-[2rem] overflow-hidden border border-[#adc6ff]/20 shadow-[0_0_80px_rgba(173,198,255,0.05)]">
              <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
                {isActive && (
                  <button 
                    onClick={() => setIsActive(false)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined text-sm">videocam_off</span>
                    Stop Feed
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-surface-container-high'}`}></div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">Live Feedback</span>
                </div>
              </div>
              {cameraError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
                  <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">no_photography</span>
                  <p className="text-white font-bold">{cameraError}</p>
                  <p className="text-xs text-on-surface-variant mt-2 italic text-balance">Browser security blocks camera access on "Insecure" IP links.</p>
                </div>
              )}
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover grayscale brightness-50 transform -scale-x-100 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
              />
              {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer group" onClick={() => setIsActive(true)}>
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-4xl">videocam</span>
                  </div>
                  <p className="text-xs uppercase font-bold tracking-widest text-primary/60">Initialize Vision Feed</p>
                </div>
              )}
              {/* HUD Elements (Only when active) */}
              {isActive && (
                <>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                     <div className="w-1/2 h-1/2 rounded-full border-2 border-dashed border-primary/30 animate-pulse flex items-center justify-center">
                        <div className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-primary/60 shadow-[0_0_15px_rgba(173,198,255,1)]"></div>
                          <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                          <div className="w-2 h-2 rounded-full bg-primary/60 shadow-[0_0_15px_rgba(173,198,255,1)]"></div>
                        </div>
                     </div>
                  </div>

                  <div className="absolute bottom-10 left-10 max-w-[200px]">
                    <p className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">Hand Position</p>
                    <h4 className="text-xl md:text-2xl font-extrabold tracking-tight truncate pb-1">{status}</h4>
                  </div>

                  <div className="absolute bottom-10 right-10">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[80px]">
                      <span className="text-2xl font-black text-primary truncate">{Math.round(accuracy)}%</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">Accuracy</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom AI Feedback Bar */}
      <footer className="fixed bottom-0 w-full h-20 border-t border-white/5 bg-[#0f131f] flex items-center px-10 gap-12 z-50">
        <div className="flex-1 flex items-center gap-6">
           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
             <span className="material-symbols-outlined text-primary text-xl">psychology</span>
           </div>
           <div className="flex-1">
             <div className="flex justify-between items-center mb-1.5">
               <p className="text-[10px] font-bold uppercase tracking-widest">Pulse-AI Feedback: {status}</p>
               <p className="text-[10px] font-mono">{accuracy}% Match</p>
             </div>
             <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${accuracy}%` }}
                 className={`h-full transition-all duration-500 ${accuracy > 80 ? 'bg-emerald-500' : 'bg-primary'}`}
               ></motion.div>
             </div>
           </div>
        </div>
        <div className="flex items-center gap-10 border-l border-white/5 pl-10">
           <div className="flex flex-col items-center gap-1 group cursor-pointer hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">insert_chart</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter">Feedback</span>
           </div>
           <div className="flex flex-col items-center gap-1 group cursor-pointer hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">settings_suggest</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter">Analysis</span>
           </div>
           <button className="bg-primary-container h-12 w-12 rounded-xl flex items-center justify-center group hover:scale-105 transition-all shadow-xl shadow-blue-500/20">
              <span className="material-symbols-outlined text-on-primary-container group-hover:translate-x-1 transition-transform">arrow_forward</span>
           </button>
        </div>
      </footer>

      {/* Mastery Pop Up Notification */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-[#0a0e1a]/90 backdrop-blur-xl p-4 pr-8 rounded-[2rem] border border-emerald-500/30 flex items-center gap-6 shadow-[0_10px_50px_rgba(16,185,129,0.15)]"
          >
             <div className="relative w-12 h-12 flex items-center justify-center text-emerald-500">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="100 100" />
                </svg>
                <span className="absolute text-sm font-bold material-symbols-outlined">emoji_events</span>
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-[0.2em] mb-0.5">Mastery Achieved</p>
                <p className="text-lg font-bold text-white tracking-tight">Level Promoted!</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
