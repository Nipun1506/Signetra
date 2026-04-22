import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: Date
}

export default function GlobalAIAssistant() {
  const { role } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: 'ai',
      text: `Hello! I am your Signetra AI Assistant. How can I help you navigate the platform or learn more about ASL today?`,
      timestamp: new Date()
    }
  ])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  const generateAIResponse = (prompt: string, currentRole: string) => {
    const lowerPrompt = prompt.toLowerCase()
    
    // ASL Specific Guidance
    if (lowerPrompt.includes('asl') || lowerPrompt.includes('sign language')) {
      return "American Sign Language (ASL) is a complete, visual language with its own unique grammar and syntax! On Signetra, you can navigate to the 'Learn' tab to study foundational signs, or the 'Practice' tab to hone your speed."
    }

    if (lowerPrompt.includes('how to sign') || lowerPrompt.includes('translate') || lowerPrompt.includes('camera')) {
      return "To translate your physical signs into text, simply head over to the 'Recognize' tab along your sidebar. It uses advanced Machine Learning hand-tracking to read your physical gestures in real-time using your webcam!"
    }

    // Role-Based Website Guidance
    if (lowerPrompt.includes('help') || lowerPrompt.includes('website') || lowerPrompt.includes('guide') || lowerPrompt.includes('how to use')) {
      if (currentRole === 'lead_admin') {
        return "As a Lead Administrator, you possess absolute control over Signetra's architecture. Use the top-right notification bell to access the 'Admin Panel' where you can purge logs, configure global AI models, and modify user credentials."
      }
      if (currentRole === 'admin') {
        return "As an Administrator, you are tasked with maintaining system integrity. You can monitor user hardware logs, resolve basic tickets, and review system health via the 'Admin Panel' hidden at the top right of the application header."
      }
      return "Welcome to Signetra! You can select modules from the Sidebar on the left. The 'Learn' hub teaches you ASL structure, whereas the 'Recognize' hub acts as an active physical translator."
    }

    // Profile Management
    if (lowerPrompt.includes('profile') || lowerPrompt.includes('password') || lowerPrompt.includes('account') || lowerPrompt.includes('2fa')) {
      return "You can manage your details seamlessly! Update your Avatar, toggle ultra-secure 2FA via QR Code, and reset your password instantly from the 'Profile' tab located at the absolute bottom-left of your sidebar."
    }
    
    // Zoom / integrations
    if (lowerPrompt.includes('zoom') || lowerPrompt.includes('whatsapp') || lowerPrompt.includes('integrate')) {
      return "Signetra supports deep integrations! Click 'Zoom' or 'WhatsApp' on the sidebar to inject our real-time translating algorithms directly into your communication pipelines."
    }

    return "I am the Signetra proprietary UI Agent. Ask me anything regarding American Sign Language education, or how to utilize the various Machine Learning modules across the website!"
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    // Simulate AI Processing Network Delay
    setTimeout(() => {
      const responseText = generateAIResponse(userMsg.text, role)
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1200 + Math.random() * 800) // Random variance for "typing" illusion
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none font-body">
      
      {/* Expanding Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }}
            className="w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-8rem)] bg-surface-container-low border border-outline-variant/10 shadow-2xl shadow-blue-500/10 rounded-3xl mb-4 pointer-events-auto flex flex-col overflow-hidden backdrop-blur-xl"
            style={{ transformOrigin: 'bottom right' }}
          >
            {/* Header */}
            <div className="p-5 bg-surface-container border-b border-outline-variant/5 flex items-center justify-between shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none"></div>
               <div className="flex items-center gap-3">
                 <div className="relative">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4d8eff] to-[#adc6ff] flex items-center justify-center shadow-inner">
                     <span className="material-symbols-outlined text-[#001a42]">smart_toy</span>
                   </div>
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-surface-container rounded-full drop-shadow-md"></div>
                 </div>
                 <div>
                   <h3 className="text-white font-bold text-sm tracking-tight">Signetra AI </h3>
                   <p className="text-[10px] text-primary uppercase tracking-widest font-bold">Online Assistant</p>
                 </div>
               </div>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="w-8 h-8 rounded-full bg-surface-container-highest hover:bg-white/10 text-on-surface-variant hover:text-white flex items-center justify-center transition-colors"
               >
                 <span className="material-symbols-outlined text-sm">close</span>
               </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-[#0a0e1a]/20">
               {messages.map((msg) => (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={msg.id} 
                   className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                 >
                   <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                     msg.sender === 'user' 
                       ? 'bg-primary text-[#001a42] rounded-br-[4px] font-medium' 
                       : 'bg-surface-container-highest text-white rounded-bl-[4px] border border-white/5 shadow-md shadow-black/20'
                   }`}>
                     {msg.text}
                   </div>
                   <span className="text-[10px] text-on-surface-variant/50 mt-1.5 px-1 font-medium">
                     {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                 </motion.div>
               ))}

               {isTyping && (
                 <div className="flex bg-surface-container-highest max-w-fit p-4 rounded-2xl rounded-bl-[4px] border border-white/5 mr-auto">
                   <div className="flex space-x-1.5 items-center h-5">
                     <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                     <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                     <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                   </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-surface-container border-t border-outline-variant/5">
               <form onSubmit={handleSendMessage} className="relative flex items-center">
                 <input 
                   type="text" 
                   value={inputText}
                   onChange={e => setInputText(e.target.value)}
                   placeholder="Ask me anything..." 
                   className="w-full bg-surface-container-highest border border-white/5 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                 />
                 <button 
                   type="submit"
                   disabled={!inputText.trim() || isTyping}
                   className="absolute right-2 w-9 h-9 rounded-lg bg-primary hover:bg-[#adc6ff] text-[#001a42] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <span className="material-symbols-outlined text-[18px]">send</span>
                 </button>
               </form>
               <p className="text-[9px] text-center text-on-surface-variant/40 mt-3 flex items-center justify-center gap-1">
                 <span className="material-symbols-outlined text-[10px]">lock</span>
                 End-to-End Secure Processing
               </p>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Badge */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#4d8eff] to-[#adc6ff] flex items-center justify-center shadow-xl shadow-blue-500/20 text-[#001a42] pointer-events-auto border-2 border-white/10 overflow-hidden relative group"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="material-symbols-outlined text-3xl font-medium relative z-10">close</motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="material-symbols-outlined text-3xl font-medium relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>robot_2</motion.span>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  )
}
