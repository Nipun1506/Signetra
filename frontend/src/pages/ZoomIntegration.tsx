import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Plug, Download, Settings, Play, CheckCircle, ExternalLink, Hand, Bot, MessageSquare, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, WS_BASE_URL } from '../config';

const TYPING_SPEED = 60;
const PAUSE_DURATION = 2000;

const SAMPLE_PHRASES = [
  { text: 'I need help', category: 'Emergency', conf: 94, color: '#ef4444' },
  { text: 'Thank you', category: 'Response', conf: 97, color: '#94a3b8' },
  { text: 'Give me water', category: 'Basic Need', conf: 89, color: '#10b981' }
];

const TypingSubtitle = () => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const currentPhrase = SAMPLE_PHRASES[index];
    
    if (isTyping) {
      if (text.length < currentPhrase.text.length) {
        const timeout = setTimeout(() => {
          setText(currentPhrase.text.slice(0, text.length + 1));
        }, TYPING_SPEED);
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
        const timeout = setTimeout(() => {
          setIsVisible(false);
        }, PAUSE_DURATION);
        return () => clearTimeout(timeout);
      }
    } else if (!isVisible) {
      const timeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % SAMPLE_PHRASES.length);
        setText('');
        setIsTyping(true);
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [text, isTyping, isVisible, index]);

  const phrase = SAMPLE_PHRASES[index];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/80 border border-blue-500/50 text-white font-sans shadow-2xl backdrop-blur-md z-50 whitespace-nowrap"
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: phrase.color, boxShadow: `0 0 10px ${phrase.color}` }}
          />
          <span className="text-xl font-semibold tracking-wide flex items-center">
            {text}
            {isTyping && <span className="ml-[2px] w-[2px] h-5 bg-white/70 inline-block" style={{ animation: 'blink 1s step-end infinite' }} />}
          </span>
          {!isTyping && (
             <span className="ml-2 text-xs font-bold px-2 py-1 bg-white/10 rounded-md text-white/80">
               {phrase.conf}%
             </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function ZoomIntegration() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isZoomBridgeEnabled, setIsZoomBridgeEnabled] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Load integration setting
  useEffect(() => {
    const saved = localStorage.getItem('signetra_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setIsZoomBridgeEnabled(settings.zoomBridge !== undefined ? settings.zoomBridge : true);
    }
  }, []);

  // Backend Polling
  useEffect(() => {
    let isMounted = true;
    
    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
        
        const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (isMounted) {
          if (res.ok) setBackendStatus('connected');
          else setBackendStatus('disconnected');
        }
      } catch (e) {
        if (isMounted) setBackendStatus('disconnected');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/extension/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'signetra-extension.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      completeStep(1);
    } catch (error) {
      console.error('Error downloading extension:', error);
      alert('Failed to download extension. Is the backend running?');
    } finally {
      setIsDownloading(false);
    }
  };

  const completeStep = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps(prev => [...prev, stepNumber]);
    }
    setActiveStep(stepNumber + 1);
  };

  return (
    <div className="flex-1 w-full flex flex-col p-8 overflow-y-auto custom-scrollbar pt-20">
      
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 text-primary mb-2">
          <Video size={28} />
          <h1 className="text-3xl font-bold tracking-tight text-white">Zoom Integration</h1>
        </div>
        <p className="text-on-surface-variant text-lg">Your signs become subtitles for everyone in the call.</p>
      </header>

      {/* Top Section: Status & Tech */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Status Card */}
        <div className="lg:col-span-2 bg-surface-container-high rounded-2xl p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Plug size={100} /></div>
          <h3 className="text-sm uppercase tracking-widest text-on-surface-variant font-bold mb-4">Backend Connection</h3>
          
          <div className="flex items-center gap-4">
            {backendStatus === 'checking' && (
              <>
                <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                <p className="text-white font-medium">Checking connection...</p>
              </>
            )}
            
            {backendStatus === 'connected' && (
              <>
                <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <div className="w-full h-full rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                </div>
                <p className="text-emerald-400 font-medium">Synced with {new URL(API_BASE_URL).hostname} — ready to broadcast</p>
              </>
            )}

            {backendStatus === 'disconnected' && (
              <>
                <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                <div className="flex flex-col">
                  <p className="text-rose-400 font-medium">Not running — start the backend first</p>
                  <code className="text-xs bg-black/40 px-2 py-1 rounded text-rose-200 mt-2 font-mono border border-rose-500/20">
                    python3 -m uvicorn main:app --host 0.0.0.0 --port 10000
                  </code>
                </div>
              </>
            )}

            {!isZoomBridgeEnabled && backendStatus === 'connected' && (
              <div className="absolute inset-0 bg-surface-container-high/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                <span className="material-symbols-outlined text-primary mb-2">info</span>
                <p className="text-white font-bold">Zoom Bridge is Disabled</p>
                <p className="text-xs text-on-surface-variant mt-1">Enable "Zoom Bridge" in Settings to activate this integration.</p>
                <Link to="/settings" className="mt-4 text-xs text-primary font-bold hover:underline">Go to Settings</Link>
              </div>
            )}
          </div>
        </div>

        {/* Tech Info Box */}
        <div className="bg-surface-container-high rounded-2xl p-6 border border-primary/20">
          <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2"><Code size={16}/> Specs</h3>
          <ul className="space-y-3 text-sm text-on-surface-variant font-medium">
            <li className="flex items-start gap-2 overflow-hidden">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span> 
              <span className="truncate">WebSocket: <code className="bg-black/30 px-1 rounded text-primary/80 break-all whitespace-normal">{WS_BASE_URL}/ws/detection</code></span>
            </li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Latency: <span className="text-emerald-400">&lt;100ms</span></li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Works on: Zoom Web, WhatsApp Web</li>
          </ul>
        </div>
      </div>

      {/* Middle Section: Browser Mockup & How It Works */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-10">
        
        {/* Browser Mockup */}
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-[#333] shadow-2xl flex flex-col h-[400px]">
          {/* Fake Browser Toolbar */}
          <div className="bg-[#323233] px-4 py-3 flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="flex-1 bg-[#1e1e1e] rounded-md px-3 py-1.5 text-xs text-[#d4d4d4] flex items-center gap-2 font-mono">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              app.zoom.us/wc/join/8482...
            </div>
          </div>
          
          {/* Zoom Mockup Area */}
          <div className="flex-1 bg-[#1a1a1a] p-4 relative">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-[#2a2a2a] rounded-lg flex items-center justify-center border border-[#3a3a3a]">
                <div className="w-20 h-20 rounded-full bg-[#4a4a4a] text-[#8a8a8a] flex items-center justify-center text-2xl font-bold">JD</div>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg border-2 border-emerald-500 relative overflow-hidden flex items-center justify-center">
                 <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold z-10">YOU</div>
                 <div className="absolute bottom-2 left-2 flex gap-1">
                   {/* Fake mic visualizer */}
                   {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-3 bg-emerald-500 rounded-sm"></div>)}
                 </div>
              </div>
            </div>

            {/* The actual component we built */}
            <TypingSubtitle />
          </div>
        </div>

        {/* How It Works */}
        <div className="flex flex-col justify-center gap-4">
          <h3 className="text-xl font-bold text-white mb-2">How It Works</h3>
          
          <div className="bg-surface-container rounded-xl p-5 flex items-start gap-4 border border-white/5 hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/10 text-primary rounded-lg"><Hand size={24}/></div>
            <div>
              <h4 className="font-bold text-white">1. You sign</h4>
              <p className="text-sm text-on-surface-variant mt-1">Show your gesture to the camera through the SIGNETRA interface.</p>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-5 flex items-start gap-4 border border-white/5 hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/10 text-primary rounded-lg"><Bot size={24}/></div>
            <div>
              <h4 className="font-bold text-white">2. SIGNETRA detects</h4>
              <p className="text-sm text-on-surface-variant mt-1">The AI instantly recognizes the gesture and categorizes the intent.</p>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-5 flex items-start gap-4 border border-white/5 hover:border-primary/30 transition-colors">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg"><MessageSquare size={24}/></div>
            <div>
              <h4 className="font-bold text-white">3. Subtitle appears</h4>
              <p className="text-sm text-on-surface-variant mt-1">The Chrome Extension injects a real-time floating subtitle directly into your active Zoom call.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-white mb-6">Setup Guide</h3>
        <div className="space-y-4">
          
          {/* Step 1 */}
          <div className={`p-6 rounded-xl border-2 transition-colors ${activeStep === 1 ? 'border-primary bg-primary/5' : completedSteps.includes(1) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-surface-container-high'}`}>
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${completedSteps.includes(1) ? 'bg-emerald-500 text-white' : activeStep === 1 ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  {completedSteps.includes(1) ? <CheckCircle size={16}/> : '1'}
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${activeStep === 1 ? 'text-primary' : 'text-white'}`}>Download Extension</h4>
                  <p className="text-sm text-on-surface-variant mt-1">Get the official SIGNETRA Chrome Extension payload.</p>
                  
                  {activeStep === 1 && (
                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading || backendStatus !== 'connected'}
                      className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <Download size={18}/>
                      {isDownloading ? 'Zipping files...' : 'Download Extension'}
                    </button>
                  )}
                  {activeStep === 1 && backendStatus !== 'connected' && (
                    <p className="text-xs text-rose-400 mt-2">Cannot download: Backend must be running first.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`p-6 rounded-xl border-2 transition-colors ${activeStep === 2 ? 'border-primary bg-primary/5' : completedSteps.includes(2) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-surface-container-high'}`}>
            <div className="flex gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${completedSteps.includes(2) ? 'bg-emerald-500 text-white' : activeStep === 2 ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {completedSteps.includes(2) ? <CheckCircle size={16}/> : '2'}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold text-lg ${activeStep === 2 ? 'text-primary' : 'text-white'}`}>Install in Chrome</h4>
                <p className="text-sm text-on-surface-variant mt-1">Load the unpacked extension into your browser.</p>
                
                {activeStep === 2 && (
                  <div className="mt-4 bg-black/30 p-4 rounded-lg space-y-3">
                    <p className="text-sm flex items-center gap-2"><span className="text-primary font-mono text-xs">1</span> Unzip the downloaded <code className="bg-black/50 px-1 rounded text-white">signetra-extension.zip</code> file.</p>
                    <p className="text-sm flex items-center gap-2"><span className="text-primary font-mono text-xs">2</span> Open Google Chrome and go to <code className="bg-black/50 px-1 rounded text-white select-all">chrome://extensions</code></p>
                    <p className="text-sm flex items-center gap-2"><span className="text-primary font-mono text-xs">3</span> Turn on <strong>Developer Mode</strong> (toggle in top right).</p>
                    <p className="text-sm flex items-center gap-2"><span className="text-primary font-mono text-xs">4</span> Click <strong>Load unpacked</strong> and select the unzipped folder.</p>
                    
                    <button 
                      onClick={() => completeStep(2)}
                      className="mt-4 px-4 py-2 bg-surface-container-highest hover:bg-white/10 text-white font-medium text-sm rounded-lg border border-white/10 transition-colors"
                    >
                      I have installed it
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`p-6 rounded-xl border-2 transition-colors ${activeStep === 3 ? 'border-primary bg-primary/5' : completedSteps.includes(3) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-surface-container-high'}`}>
            <div className="flex gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${completedSteps.includes(3) ? 'bg-emerald-500 text-white' : activeStep === 3 ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {completedSteps.includes(3) ? <CheckCircle size={16}/> : '3'}
              </div>
              <div>
                <h4 className={`font-bold text-lg ${activeStep === 3 ? 'text-primary' : 'text-white'}`}>Open Zoom Web</h4>
                <p className="text-sm text-on-surface-variant mt-1">Join a meeting using the web browser client.</p>
                
                {activeStep === 3 && (
                  <div className="mt-4 flex gap-3">
                    <a 
                      href="https://app.zoom.us" target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Open Zoom <ExternalLink size={16}/>
                    </a>
                    <button 
                      onClick={() => completeStep(3)}
                      className="px-4 py-2 bg-transparent text-primary font-medium text-sm rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      Mark Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className={`p-6 rounded-xl border-2 transition-colors ${activeStep === 4 ? 'border-primary bg-primary/5' : completedSteps.includes(4) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-surface-container-high'}`}>
            <div className="flex gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${completedSteps.includes(4) ? 'bg-emerald-500 text-white' : activeStep === 4 ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                <Play size={14} className="ml-0.5" />
              </div>
              <div>
                <h4 className={`font-bold text-lg ${activeStep === 4 ? 'text-primary' : 'text-white'}`}>Start Broadcasting</h4>
                <p className="text-sm text-on-surface-variant mt-1">Head over to the Vision Interface to start analyzing your gestures.</p>
                
                {activeStep === 4 && (
                  <Link 
                    to="/recognize"
                    className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                  >
                    Go to Vision Interface
                  </Link>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
