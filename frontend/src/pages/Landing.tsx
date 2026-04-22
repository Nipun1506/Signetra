import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } }
  }

  return (
    <div className="bg-[#0a0e1a] min-h-screen font-body text-white selection:bg-primary/30 relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/20 blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-[#4d8eff]/10 blur-[150px]"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="material-symbols-outlined text-[#001a42] font-medium">waves</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SIGNETRA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-on-surface-variant hover:text-white transition-colors px-4 py-2">
              Log In
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-2.5 rounded-full bg-white shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center min-w-[140px]"
              style={{ color: '#0a0e1a', fontWeight: '900', fontSize: '14px' }}
            >
              Register Now
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-48 mb-16 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-primary mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Next-Gen AI Platform
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] max-w-4xl"
          >
            Bridge the gap with <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#adc6ff] to-[#4d8eff]">Real-Time AI Sign Language</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12"
          >
            Signetra breaks down communication barriers instantly. Translate sign language to text, integrate with Zoom calls, and practice your skills in one intelligent ecosystem.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto mt-4"
          >
            <Link to="/register" className="px-8 py-4 rounded-full bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] !text-black text-center font-black shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Get Started Now <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-full bg-surface-container-high border border-outline-variant/10 text-white text-center font-bold hover:bg-surface-container-highest transition-colors">
              Access Dashboard
            </Link>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-black/40 border-y border-white/5 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">Everything you need to communicate.</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">A fully integrated suite of tools designed to make sign language translation seamless and universally accessible.</p>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { icon: 'videocam', title: 'Real-Time Translation', desc: 'Instantly map hand gestures via your webcam using advanced low-latency AI.' },
                { icon: 'school', title: 'Learn & Practice', desc: 'Interactive lessons to build your sign language vocabulary visually.' },
                { icon: 'integration_instructions', title: 'Zoom & WhatsApp', desc: 'Bring translation directly into your favorite remote calling software.' },
                { icon: 'support_agent', title: 'Enterprise Support', desc: 'Comprehensive ticketing and remote system diagnostics built-in.' }
              ].map((f, i) => (
                <motion.div key={i} variants={itemVariants} className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/5 shadow-xl hover:bg-surface-container-high transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-[#0a0e1a] border border-white/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary">{f.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About Us / Developers */}
        <section id="about-us" className="py-24 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 mt-8">
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-2 block">The Architecture</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Meet the Developers</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: 'Nipun Naikwadi', role: 'Founder & Lead Engineer', image: '/assets/nipun.jpg' },
                { name: 'Purva Satav', role: 'Founder & Lead Engineer', image: '/assets/purva.jpg' },
                { name: 'Nikita Sharma', role: 'Founder & Lead Engineer', image: '/assets/nikita.jpg' },
                { name: 'Saurabh Yadav', role: 'Founder and Lead engineer', image: '/assets/saurabh.jpg' }
              ].map((dev, i) => (
                <div key={i} className="group relative">
                  <div className="w-full aspect-[4/5] bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/5 shadow-xl relative">
                    <img src={dev.image} alt={dev.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-90 group-hover:brightness-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                      <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{dev.name}</h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary drop-shadow-md">{dev.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#050810] pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">waves</span>
                <span className="font-bold tracking-tight text-xl">SIGNETRA</span>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Breaking communication barriers globally through innovative AI-driven gesture recognition technology.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
              <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
                <li><Link to="/login" className="hover:text-primary transition-colors">Login Gateway</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
                <li><a href="#about-us" className="hover:text-primary transition-colors">Developer Team</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs text-primary">Contact Us</h4>
              <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5">
                <p className="text-sm text-on-surface-variant mb-2">Have questions or feedback?</p>
                <a href="mailto:signetracare@gmail.com" className="text-white font-bold hover:text-primary transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  signetracare@gmail.com
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-on-surface-variant font-medium">
                &copy; {new Date().getFullYear()} Signetra Systems. All rights reserved.
              </p>
              <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest">
                Intellectual Property of Team Signetra
              </p>
            </div>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-[9px] text-on-surface-variant/40 leading-relaxed max-w-3xl mx-auto italic">
              Unauthorized duplication, reverse-engineering, or distribution of this platform's proprietary AI models, source code, data architectures, or media assets is strictly prohibited and protected under international copyright law.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
