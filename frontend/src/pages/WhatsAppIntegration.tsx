import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const TYPING_SPEED = 50;
const PAUSE_DURATION = 3000;

const WA_PHRASES = [
  { text: "I will be arriving at the main hall by 3:00 PM for the presentation.", language: "ASL", conf: 98.4 },
  { text: "Can you send me the latest meeting notes?", language: "ASL", conf: 94.2 },
  { text: "I approve the new design wireframes.", language: "ASL", conf: 99.1 }
];

const AutoTypingTranslation = () => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const currentPhrase = WA_PHRASES[index];
    
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
        setIndex((prev) => (prev + 1) % WA_PHRASES.length);
        setText('');
        setIsTyping(true);
        setIsVisible(true);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [text, isTyping, isVisible, index]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          className="bg-[#0a0e1a]/80 backdrop-blur-md rounded-xl p-5 border border-[#25D366]/30 shadow-2xl shadow-[#25D366]/10"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#25D366] tracking-widest uppercase">Live Translation</span>
          </div>
          <p className="text-xl text-white font-medium italic min-h-[60px]">
            "{text}{isTyping && <span className="w-1.5 h-5 bg-white/70 inline-block align-middle ml-1 animate-pulse" />}"
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function WhatsAppIntegration() {
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Backend Polling
  useEffect(() => {
    let isMounted = true;
    
    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
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
      a.download = 'signetra-whatsapp-extension.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      completeStep(1);
    } catch (error) {
      console.error('Error downloading extension:', error);
      alert('Failed to download extension. Ensure Signetra backend is running.');
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
    <div className="pt-24 pb-12 px-10 w-full font-body overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${backendStatus === 'connected' ? 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {backendStatus === 'checking' ? 'Initializing...' : backendStatus === 'connected' ? 'Active Integration' : 'Backend Offline'}
              </span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">WhatsApp Web Bridge</h2>
            <p className="text-on-surface-variant text-lg max-w-xl italic">Translate Sign Language into text instantly within your WhatsApp Web conversations using our proprietary vision engine.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`p-4 bg-surface-container rounded-xl flex items-center gap-4 border ${isOverlayEnabled ? 'shadow-xl shadow-[#25D366]/5 border-[#25D366]/30' : 'shadow-none border-outline-variant/10 opacity-60'}`}>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Interface Status</span>
                <span className={`text-sm font-semibold ${isOverlayEnabled ? 'text-[#25D366]' : 'text-on-surface-variant'}`}>{isOverlayEnabled ? 'WhatsApp Overlay Enabled' : 'Overlay Disabled'}</span>
              </div>
              <div 
                onClick={() => setIsOverlayEnabled(!isOverlayEnabled)}
                className={`w-11 h-6 rounded-full relative cursor-pointer outline-none transition-colors ${isOverlayEnabled ? 'bg-[#25D366]' : 'bg-surface-container-highest'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOverlayEnabled ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Mockup Video Call */}
          <section className="lg:col-span-8 space-y-6">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 shadow-2xl group">
              <img className="w-full h-full object-cover opacity-80 grayscale-[0.2]" alt="WhatsApp Call" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBZFfS2S40KtNjiYGaoJ_tzPvM_xtCyUNLPO03Si3L2kv3zEU5aN2VbNL-A_YasnhZOF7ykGpF5inQQ06jRxcKkMA4puNDscIAOJ7C9tWmqUMY4uqQcvvMlOgcXmMPxw23UAVF2mJIWJwXpTBzDzWs83Jpp7CWeIXiwFtsgZbbYapAxmkjM5GUGodL8CmgA_kp-qTI3UTT8ChbzlxafciTXuOqu2-IOeIfC-6C27fe11X6KN5BWMcyBAlE11QgVBfcPkdqSNOxSE8"/>
              
              <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start">
                <div className="bg-[#1b1f2c]/60 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-3 border border-white/10">
                  <div className="w-3 h-3 rounded-full bg-[#25D366] animate-pulse"></div>
                  <span className="text-sm font-medium text-white tracking-wide uppercase">Signetra Live Bridge</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#25D366]/40 transition-colors">
                    <span className="material-symbols-outlined text-xl">videocam</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Translation Caption Box */}
              {isOverlayEnabled && (
                <div className="absolute bottom-6 left-6 right-6">
                  <AutoTypingTranslation />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-surface-container rounded-xl border border-white/5 py-3 px-5">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Current Language</span>
                  <span className="text-sm font-semibold text-white">ASL (American Sign Language)</span>
                </div>
                <div className="w-px h-8 bg-outline-variant/30 hidden md:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Confidence Score</span>
                  <span className="text-sm font-semibold text-[#25D366]">98.4% Accuracy</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 rounded-xl border border-outline-variant/20 hover:bg-surface-container-high transition-all text-sm font-medium text-white">Export Transcript</button>
                <a 
                  href="https://web.whatsapp.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-[#25D366] text-[#001a42] font-bold text-sm shadow-lg shadow-[#25D366]/20 hover:scale-[1.02] active:scale-95 transition-all outline-none text-center block"
                >
                  Launch Web Window
                </a>
              </div>
            </div>
          </section>

          {/* Sidebar Config / Protocol */}
          <aside className="lg:col-span-4 space-y-6 flex flex-col h-full">
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/10 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl transition-colors ${backendStatus === 'connected' ? 'bg-[#25D366]/10' : 'bg-red-500/10'}`}></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${backendStatus === 'connected' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-red-500/10 text-red-500'}`}>
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>phonelink_ring</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">Bridge Status</h3>
                    <p className="text-xs text-on-surface-variant italic">
                      {backendStatus === 'checking' ? 'Testing connection...' : backendStatus === 'connected' ? 'Syncing with WhatsApp API' : 'Connection failed'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {['Browser Extension', 'Vision Pipeline', 'Encryption'].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/5">
                      <span className="text-xs text-on-surface-variant">{item}</span>
                      <span className={`text-xs font-bold tracking-widest uppercase ${backendStatus === 'connected' || idx === 2 ? 'text-[#25D366]' : 'text-red-400'}`}>
                        {idx === 2 ? 'VERIFIED' : backendStatus === 'connected' ? 'READY' : 'OFFLINE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-surface-container flex-1 p-6 rounded-xl border border-outline-variant/5 font-body flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-6">Setup Protocol</h3>
              <div className="flex-1 space-y-2 relative">
                
                {/* Step 1 */}
                <div className={`p-4 rounded-xl border transition-colors ${activeStep === 1 ? 'border-[#25D366]/40 bg-[#25D366]/5' : completedSteps.includes(1) ? 'border-outline-variant/10 bg-surface-container-low' : 'border-outline-variant/5 bg-transparent opacity-50'}`}>
                  <div className="flex gap-4">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${completedSteps.includes(1) ? 'bg-[#25D366] text-[#001a42]' : activeStep === 1 ? 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {completedSteps.includes(1) ? <span className="material-symbols-outlined text-[14px] font-bold">check</span> : <span className="text-[10px] font-bold">01</span>}
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-on-surface">Install Plugin</h4>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Add the Signetra Extension to your browser.</p>
                        {activeStep === 1 && (
                          <button 
                            onClick={handleDownload}
                            disabled={isDownloading || backendStatus !== 'connected'}
                            className="mt-3 px-4 py-2 bg-surface-container-highest hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/5 disabled:opacity-50 flex items-center gap-2 outline-none"
                          >
                             <span className="material-symbols-outlined text-sm">download</span>
                             {isDownloading ? 'Packaging...' : 'Download Plugin'}
                          </button>
                        )}
                        {activeStep === 1 && backendStatus !== 'connected' && (
                          <p className="text-[9px] text-red-400 mt-2 font-bold uppercase tracking-widest">Start core engine to bypass</p>
                        )}
                     </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`p-4 rounded-xl border transition-colors ${activeStep === 2 ? 'border-[#25D366]/40 bg-[#25D366]/5' : completedSteps.includes(2) ? 'border-outline-variant/10 bg-surface-container-low' : 'border-outline-variant/5 bg-transparent opacity-50'}`}>
                  <div className="flex gap-4">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${completedSteps.includes(2) ? 'bg-[#25D366] text-[#001a42]' : activeStep === 2 ? 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {completedSteps.includes(2) ? <span className="material-symbols-outlined text-[14px] font-bold">check</span> : <span className="text-[10px] font-bold">02</span>}
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-on-surface">Pair Account</h4>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Scan the secure QR code to link your profile.</p>
                        {activeStep === 2 && (
                          <button 
                            onClick={() => completeStep(2)}
                            className="mt-3 px-4 py-2 bg-surface-container-highest hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/5"
                          >
                             Acknowledge Sync
                          </button>
                        )}
                     </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`p-4 rounded-xl border transition-colors ${activeStep === 3 ? 'border-[#25D366]/40 bg-[#25D366]/5' : completedSteps.includes(3) ? 'border-outline-variant/10 bg-surface-container-low' : 'border-outline-variant/5 bg-transparent opacity-50'}`}>
                  <div className="flex gap-4">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${completedSteps.includes(3) ? 'bg-[#25D366] text-[#001a42]' : activeStep === 3 ? 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {completedSteps.includes(3) ? <span className="material-symbols-outlined text-[14px] font-bold">check</span> : <span className="text-[10px] font-bold">03</span>}
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-on-surface">Calibrate Camera</h4>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Perform a 5-second hand calibration test.</p>
                        {activeStep === 3 && (
                          <Link 
                            to="/recognize"
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-[#001a42] text-xs font-bold rounded-lg transition-transform hover:scale-105"
                          >
                             Test Calibration Engine
                          </Link>
                        )}
                     </div>
                  </div>
                </div>

              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
