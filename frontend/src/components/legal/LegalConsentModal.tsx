import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

/**
 * LegalConsentModal — MANDATORY gate.
 *
 * Renders a full-screen blocking overlay until the user explicitly accepts.
 * There is NO "Later" / "Skip" / dismiss option.
 * The overlay prevents ALL interaction with the app beneath it.
 * Consent is persisted in localStorage so it only shows once per browser.
 */
export default function LegalConsentModal() {
  const [isVisible, setIsVisible] = useState(false)
  const [declined, setDeclined] = useState(false)

  useEffect(() => {
    const hasConsented = localStorage.getItem('signetra_legal_consent')
    if (!hasConsented) {
      // Small delay so the app splash screen finishes first
      const timer = setTimeout(() => setIsVisible(true), 2600)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('signetra_legal_consent', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }))
    setIsVisible(false)
    setDeclined(false)
  }

  const handleDecline = () => {
    setDeclined(true)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          // Full-screen backdrop — pointer-events-all blocks ALL clicks beneath
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          // Do NOT allow clicking outside to dismiss
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
            className="w-full max-w-lg bg-[#0f131f] border border-white/10 rounded-3xl shadow-2xl shadow-black overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#4d8eff] via-[#adc6ff] to-[#4d8eff]" />

            <div className="p-8">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
                  <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-white mb-1">Legal Consent Required</h2>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">You must accept to continue</p>
                </div>
              </div>

              {/* Body */}
              <AnimatePresence mode="wait">
                {!declined ? (
                  <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed mb-6">
                      Before accessing <span className="text-primary font-bold">Signetra</span>, you must read and accept our legal agreements. By clicking <strong className="text-white">Accept & Continue</strong>, you confirm that you:
                    </p>
                    <ul className="space-y-3 mb-6">
                      {[
                        { icon: 'check_circle', text: 'Are at least 13 years of age' },
                        { icon: 'check_circle', text: 'Have read and agree to our Terms of Service' },
                        { icon: 'check_circle', text: 'Consent to our Cookie & Data Policy' },
                        { icon: 'check_circle', text: 'Understand that Signetra uses AI-powered gesture recognition with inherent limitations' },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                          <span className="text-[13px] text-on-surface-variant">{item.text}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Legal links */}
                    <div className="flex gap-3 mb-6 p-4 bg-white/3 rounded-2xl border border-white/5">
                      <Link
                        to="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/30 text-primary text-[11px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">description</span>
                        Terms of Service
                      </Link>
                      <Link
                        to="/cookies"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-on-surface-variant text-[11px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">cookie</span>
                        Cookie Policy
                      </Link>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleAccept}
                        className="w-full py-4 bg-gradient-to-r from-[#adc6ff] to-[#4d8eff] text-[#001a42] rounded-2xl text-sm font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20"
                      >
                        ✓ Accept & Continue
                      </button>
                      <button
                        onClick={handleDecline}
                        className="w-full py-3 border border-white/5 rounded-2xl text-[11px] font-bold text-on-surface-variant hover:bg-white/5 hover:text-white transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="declined" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-6 text-center">
                      <span className="material-symbols-outlined text-rose-400 text-4xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                      <h3 className="text-white font-black text-base mb-2">Access Denied</h3>
                      <p className="text-[13px] text-on-surface-variant leading-relaxed">
                        You must accept the Terms of Service and Cookie Policy to use Signetra. Without consent, we cannot authenticate you or provide our services as we are obligated to comply with applicable privacy regulations.
                      </p>
                    </div>
                    <p className="text-[12px] text-on-surface-variant text-center mb-6 opacity-70">
                      If you have concerns about our policies, please review them or contact us at{' '}
                      <a href="mailto:signetracare@gmail.com" className="text-primary hover:underline">signetracare@gmail.com</a>.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeclined(false)}
                        className="flex-1 py-3 border border-white/10 rounded-2xl text-[11px] font-bold text-on-surface-variant hover:bg-white/5 hover:text-white transition-colors"
                      >
                        ← Go Back
                      </button>
                      <button
                        onClick={handleAccept}
                        className="flex-1 py-3 bg-gradient-to-r from-[#adc6ff] to-[#4d8eff] text-[#001a42] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                      >
                        Accept & Continue
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom note */}
            <div className="px-8 pb-6 text-center">
              <p className="text-[10px] text-on-surface-variant opacity-40">
                © {new Date().getFullYear()} Team Signetra · Intellectual Property Protected · v1.0
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
