import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion'
import { logGestureHistory } from '../utils/history'

const GESTURES = [
  { id: '1', phrase: 'STOP', category: 'General', combo: '⌘ S', icon: 'back_hand' },
  { id: '2', phrase: 'HELP', category: 'Urgent', combo: '⌘ H', icon: 'sports_mma' },
  { id: '3', phrase: 'YES', category: 'Affirmation', combo: '⌘ Y', icon: 'thumb_up' },
  { id: '4', phrase: 'NO', category: 'Negation', combo: '⌘ N', icon: 'swipe_down' },
  { id: '5', phrase: 'HELLO', category: 'Greeting', combo: '⌘ E', icon: 'front_hand' },
  { id: '6', phrase: 'THANK YOU', category: 'Social', combo: '⌘ T', icon: 'pan_tool' },
  { id: '7', phrase: 'SORRY', category: 'Social', combo: '⌘ 1', icon: 'sign_language' },
  { id: '8', phrase: 'I LOVE YOU', category: 'Social', combo: '⌘ L', icon: 'favorite' },
  { id: '9', phrase: 'PLEASE', category: 'Social', combo: '⌘ P', icon: 'volunteer_activism' },
  { id: '10', phrase: 'WATER', category: 'Needs', combo: '⌘ W', icon: 'water_drop' }
]

export default function Recognize() {
  const [isActive, setIsActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [source, setSource] = useState<'webcam'|'iphone'>('webcam')
  const [mode, setMode] = useState<'text'|'speech'|'text-speech'>('speech')
  const [currentGesture, setCurrentGesture] = useState<any>(null)
  
  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [minConfidence, setMinConfidence] = useState(75)
  const [speechRate, setSpeechRate] = useState(1.0)
  const [mirrorView, setMirrorView] = useState(true)
  const [adminNotification, setAdminNotification] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('signetra_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setMinConfidence(settings.confidenceThreshold || 75);
      setMirrorView(settings.mirrorView !== undefined ? settings.mirrorView : true);
      setMode(settings.speechOutput ? 'speech' : 'text');
    }
  }, []);

  const getConstraints = () => {
    const saved = localStorage.getItem('signetra_settings');
    const settings = saved ? JSON.parse(saved) : {};
    
    const resMap: Record<string, { w: number, h: number }> = {
      '1080p': { w: 1920, h: 1080 },
      '720p': { w: 1280, h: 720 },
      '480p': { w: 640, h: 480 }
    };

    const res = resMap[settings.outputResolution] || resMap['720p'];
    
    const constraints: any = {
      video: {
        width: { ideal: res.w },
        height: { ideal: res.h }
      }
    };

    if (settings.sourceDevice && settings.sourceDevice !== 'default') {
      constraints.video.deviceId = { exact: settings.sourceDevice };
    }

    return constraints;
  };
  
  // Animation values for confidence ring
  const confidenceValue = useMotionValue(0)
  const animatedConfidence = useSpring(confidenceValue, { stiffness: 100, damping: 20 })
  const [displayConf, setDisplayConf] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const frameIntervalRef = useRef<number | null>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastSpokenRef = useRef<string>("")
  const lastLoggedRef = useRef<string>("")

  useEffect(() => {
    const unsubscribe = animatedConfidence.on("change", (latest) => {
      setDisplayConf(Math.round(latest))
    })
    return unsubscribe
  }, [animatedConfidence])

  useEffect(() => {
    if (isActive) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [isActive, source])

  const startCamera = async () => {
    try {
      const constraints = getConstraints();
      
      // If the user manually toggled "iPhone", we override the deviceId
      if (source === 'iphone') {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(d => d.kind === 'videoinput')
        const iphoneDevice = videoDevices.find(d =>
          d.label.toLowerCase().includes('iphone') || 
          d.label.toLowerCase().includes('desk view') ||
          d.label.toLowerCase().includes('continuity')
        )

        if (iphoneDevice) {
          constraints.video.deviceId = { exact: iphoneDevice.deviceId };
        } else {
          console.warn("iPhone camera not found. Falling back to default.");
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraError(null)
      connectWs()
    } catch (err: any) {
      console.error("Camera access error:", err)
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
    setCurrentGesture(null)
    confidenceValue.set(0)
  }

  const connectWs = () => {
    const host = window.location.hostname
    wsRef.current = new WebSocket(`ws://${host}:8000/ws/detection`)

    wsRef.current.onopen = () => {
      console.log("✅ WebSocket connected")
      // Start sending frames every 100ms (10fps — good balance for MediaPipe)
      frameIntervalRef.current = window.setInterval(() => {
        sendFrame()
      }, 100)
    }

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Handle Global Admin Notifications
        if (data.type === 'notification') {
          setAdminNotification(data.message);
          setTimeout(() => setAdminNotification(null), 8000); // Hide after 8s
          return;
        }

        // Only accept gestures that meet the user-defined minimum confidence threshold
        if (data.phrase && data.confidence >= minConfidence) {
          setCurrentGesture(data)
          confidenceValue.set(data.confidence)
          if (data.landmarks && canvasRef.current) {
            drawLandmarks(data.landmarks)
          }
          // Client-side speech using Web Speech API
          if ((mode === 'speech' || mode === 'text-speech') && data.phrase !== lastSpokenRef.current) {
            speakPhrase(data.phrase)
            lastSpokenRef.current = data.phrase
          }
          // History persistence tracking
          if (data.phrase !== lastLoggedRef.current) {
            logGestureHistory(data.phrase, data.confidence, source === 'webcam' ? 'Webcam' : 'iPhone')
            lastLoggedRef.current = data.phrase
          }
        } else {
          // No hand detected — clear display
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          }
        }
      } catch (e) {}
    }

    wsRef.current.onclose = () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)
    }
  }

  const sendFrame = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return // Ensure video is ready

    // Calculate aspect-ratio preserving dimensions for backend (max 320w)
    const MAX_W = 320
    const scale = Math.min(1, MAX_W / video.videoWidth)
    const targetWidth = Math.floor(video.videoWidth * scale)
    const targetHeight = Math.floor(video.videoHeight * scale)

    if (!captureCanvasRef.current) {
      captureCanvasRef.current = document.createElement('canvas')
    }
    
    const canvas = captureCanvasRef.current
    if (canvas.width !== targetWidth) {
      canvas.width = targetWidth
      canvas.height = targetHeight
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw without mirroring, just scale it down to drastically reduce latency
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight)

    // Reduced quality to 0.4 for very low latency (~5KB per frame)
    const frameB64 = canvas.toDataURL('image/jpeg', 0.4).split(',')[1]

    const token = localStorage.getItem('signetra_token') || ""

    wsRef.current.send(JSON.stringify({
      frame: frameB64,
      mode: mode,
      source: source,
      token: token
    }))
  }

  const speakPhrase = (phrase: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel() // stop any current speech
    const utter = new SpeechSynthesisUtterance(phrase.toLowerCase())
    utter.rate = speechRate
    utter.pitch = 1.0
    window.speechSynthesis.speak(utter)
  }

  const drawLandmarks = (landmarks: any[]) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || video.videoWidth === 0) return

    // Sync canvas internal resolution to video source resolution for perfect object-cover matching
    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0,0, canvas.width, canvas.height)
    
    ctx.fillStyle = '#adc6ff' // using Stitch primary token
    ctx.strokeStyle = '#adc6ff'
    ctx.lineWidth = 4

    landmarks.forEach((lm, i) => {
      // Direct mapping since the canvas has transform: -scale-x-100 in CSS (only if mirrored)
      const x = lm[0] * canvas.width
      const y = lm[1] * canvas.height
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2*Math.PI)
      ctx.fill()
      
      if (i > 0) {
        const prev = landmarks[i-1]
        const px = prev[0] * canvas.width
        const py = prev[1] * canvas.height
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    })
  }

  return (
    <div className="flex w-full h-full pt-24">
      {/* Left Panel: Live Camera Feed (60%) */}
      <section className="w-3/5 p-6 h-full flex flex-col relative w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Vision Interface</h2>
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              isActive 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
            }`}
          >
            {isActive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-xs font-bold tracking-widest uppercase">Stop Feed</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px]">videocam</span>
                <span className="text-xs font-bold tracking-widest uppercase">Start Feed</span>
              </>
            )}
          </button>
        </div>

        {/* Camera Container */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 shadow-inner group">
          {cameraError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-6 text-center animate-in fade-in duration-300">
              <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">no_photography</span>
              <p className="text-white font-bold">{cameraError}</p>
              <p className="text-xs text-on-surface-variant mt-2 italic">Browser security blocks camera access on "Insecure" IP links. Use Option 2 (Localtunnel) or Reset Permissions.</p>
            </div>
          )}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'} ${mirrorView ? 'transform -scale-x-100' : ''}`} 
          />
          
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant font-bold uppercase tracking-wider text-sm tracking-widest opacity-50 z-10">
              <span className="material-symbols-outlined text-4xl mb-2">videocam_off</span>
              Camera Off
            </div>
          )}

          <canvas 
            ref={canvasRef} 
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-20 ${mirrorView ? 'transform -scale-x-100' : ''}`} 
          />

          {/* Bottom Detection Overlay */}
          <AnimatePresence>
            {adminNotification && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-6 inset-x-6 z-[100]"
              >
                <div className="bg-primary/90 backdrop-blur-xl border border-[#001a42]/20 p-4 rounded-2xl flex items-center gap-4 shadow-2xl shadow-primary/40 text-[#001a42]">
                  <div className="w-10 h-10 rounded-full bg-[#001a42]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined font-bold">campaign</span>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest opacity-60">System Administrator</h5>
                    <p className="text-sm font-bold leading-tight">{adminNotification}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {isActive && currentGesture && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent p-8 flex items-end justify-between z-30"
              >
                <div>
                  <span className="label-md uppercase text-primary tracking-widest font-bold text-xs">Identified Gesture</span>
                  <h3 className="text-7xl font-extrabold tracking-tighter text-white">{currentGesture.phrase.toUpperCase()}</h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="px-4 py-2 bg-primary-container/20 backdrop-blur-md rounded-full border border-primary/30 flex items-center gap-2">
                    <span className="text-primary font-bold text-lg">{displayConf}%</span>
                    <span className="text-xs uppercase tracking-tighter text-primary/80">Confidence</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Right Panel: Sidebar Controls & Feed (40%) */}
      <aside className="w-2/5 h-full bg-surface-container-low p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {/* TOP: Controls */}
        <section className="bg-surface-container-high rounded-[14px] p-5 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary">System Controls</h4>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="material-symbols-outlined text-on-surface-variant text-sm hover:text-primary transition-colors cursor-pointer"
            >
              tune
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Camera Source</label>
              <div className="flex bg-surface-container rounded-lg p-1">
                {['webcam', 'iphone'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setSource(t as any)} 
                    className={`flex-1 text-[10px] py-1.5 rounded-md font-bold uppercase ${
                      source === t ? 'bg-primary text-on-primary' : 'text-on-surface-variant font-medium hover:bg-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Output Mode</label>
              <div className="flex bg-surface-container rounded-lg p-1">
                {[
                  { id: 'text', label: 'TEXT' },
                  { id: 'speech', label: 'SPEECH' },
                  { id: 'text-speech', label: 'BOTH' }
                ].map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setMode(m.id as any)} 
                    className={`flex-1 text-[10px] py-1.5 rounded-md font-bold uppercase ${
                      mode === m.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant font-medium hover:bg-white/5'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MIDDLE: Live Detection Card */}
        <section className="bg-surface-container-highest rounded-[14px] p-6 border-l-4 border-primary shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Current Transcription</span>
              <h5 className="text-lg font-medium text-white mt-1">
                {currentGesture ? `"${currentGesture.phrase}"` : "Waiting for gesture..."}
              </h5>
            </div>
            <div className="relative flex items-center justify-center w-12 h-12">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-container-low" />
                <motion.circle 
                  cx="18" cy="18" r="15.915" fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                  className="text-primary"
                  strokeDasharray="100 100"
                  strokeDashoffset={useTransform(animatedConfidence, v => 100 - v)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold">{displayConf}%</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-on-surface-variant">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">category</span>
              <span>{currentGesture ? currentGesture.category : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
               {/* Time visualization static for mockup purposes */}
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </section>

        {/* BOTTOM: Quick Reference Scrollable */}
        <section className="flex-1 flex flex-col min-h-0">
          <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 mt-2">Quick Reference Library</h4>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {GESTURES.map(g => {
              const matches = currentGesture?.phrase?.toUpperCase() === g.phrase
              return (
                <div key={g.id} className={`${matches ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container border border-transparent'} rounded-xl p-3 flex items-center justify-between hover:bg-surface-container-high transition-colors`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${matches ? 'text-primary' : 'text-on-surface-variant'}`} style={matches ? {fontVariationSettings: "'FILL' 1"} : {}}>
                      {g.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${matches ? 'text-white' : 'text-on-surface'}`}>{g.phrase}</p>
                      <p className={`text-[10px] ${matches ? 'text-primary/70' : 'text-on-surface-variant'}`}>{g.category}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${matches ? 'text-primary bg-primary/10' : 'text-on-surface-variant bg-surface-container-lowest'}`}>
                    {g.combo}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </aside>

      {/* Advanced Calibration Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface-container-high border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSettingsModal(false)} 
                className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <span className="material-symbols-outlined">tune</span> 
                </div>
                Advanced Calibration
              </h3>
              
              <div className="space-y-8">
                {/* Confidence Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Min Confidence</label>
                    <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{minConfidence}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="99" value={minConfidence} 
                    onChange={e => setMinConfidence(Number(e.target.value))}
                    className="w-full h-1.5 bg-surface-container-lowest rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-xs text-on-surface-variant/70">Gestures below this threshold will be ignored to rigorously prevent false positives.</p>
                </div>

                {/* Speech Rate Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Speech Rate</label>
                    <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{speechRate.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="2.0" step="0.1" value={speechRate} 
                    onChange={e => setSpeechRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-surface-container-lowest rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-xs text-on-surface-variant/70">Adjust the speed of the Web Speech voice playback module.</p>
                </div>
              </div>
              
              <div className="mt-10 flex justify-end">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-blue-500 text-white font-bold tracking-wide rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
