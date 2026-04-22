import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LegalConsentModal() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasConsented = localStorage.getItem('signetra_legal_consent')
    if (!hasConsented) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('signetra_legal_consent', 'true')
    setIsVisible(false)
  }

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[9999]">
          <div className="bg-[#0f131f]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/80 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">gavel</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">Legal Consent</h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  By using <span className="text-primary font-bold">Signetra</span>, you acknowledge that you have read and agree to our 
                  <span className="text-white hover:underline cursor-pointer ml-1">Terms of Service</span> and 
                  <span className="text-white hover:underline cursor-pointer ml-1">Cookie Policy</span>. 
                  We use cookies to ensure platform security and optimize our AI models.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handleAccept}
                className="flex-1 bg-white hover:bg-white/90 text-[#0a0e1a] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Accept & Continue
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="px-4 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-[10px] font-bold text-on-surface-variant transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
