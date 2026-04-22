import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { House, Camera, BookOpen, Video, MessageCircle, Clock, Settings, Lock, Hand, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Home', path: '/', icon: House },
  { name: 'Recognize', path: '/recognize', icon: Camera },
  { name: 'Learn', path: '/learn', icon: BookOpen },
  { name: 'Zoom', path: '/zoom-integration', icon: Video },
  { name: 'WhatsApp', path: '/whatsapp-integration', icon: MessageCircle },
  { name: 'History', path: '/history', icon: Clock },
  { name: 'Settings', path: '/settings', icon: Settings },
]

export const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const location = useLocation()
  const isMobile = window.innerWidth <= 768

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border z-40 flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.name} to={item.path} className="flex flex-col items-center justify-center w-full h-full relative">
              <item.icon size={20} className={isActive ? 'text-primary' : 'text-muted'} />
              <span className={cn("text-[10px] mt-1", isActive ? 'text-primary font-medium' : 'text-muted')}>{item.name}</span>
              {isActive && (
                <motion.div layoutId="mobileNav" className="absolute top-0 w-8 h-[2px] bg-primary rounded-b-md" />
              )}
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <motion.div 
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 80 }}
      className="fixed top-0 left-0 h-screen bg-[#0A0E1A] border-r border-border z-40 flex flex-col pt-6 pb-4"
    >
      <div className={cn("flex items-center px-6 mb-10 overflow-hidden", sidebarOpen ? "justify-start gap-3" : "justify-center")}>
        <Hand className="text-primary flex-shrink-0" size={28} />
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col whitespace-nowrap">
            <span className="text-white font-bold tracking-wide text-lg leading-tight">SIGNETRA</span>
            <span className="text-muted text-[11px] uppercase tracking-wider">Your hands, your voice</span>
          </motion.div>
        )}
      </div>

      <div className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.name} to={item.path} className="block relative group">
              {isActive && (
                <motion.div 
                  layoutId="activeNav" 
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.div 
                  layoutId="activeNavLine" 
                  className="absolute left-0 top-1 bottom-1 w-[3px] bg-primary rounded-r-lg"
                />
              )}
              <div className={cn(
                "flex items-center px-3 py-3 rounded-lg transition-colors relative z-10",
                !isActive && "group-hover:bg-white/5",
                sidebarOpen ? "justify-start gap-4" : "justify-center"
              )}>
                <item.icon size={20} className={isActive ? 'text-primary' : 'text-muted group-hover:text-white transition-colors'} />
                {sidebarOpen && (
                  <span className={cn("font-medium", isActive ? 'text-primary' : 'text-muted group-hover:text-white transition-colors')}>
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      <div className="px-3 pt-4 border-t border-border mt-auto mb-4 space-y-2">
        <Link to="/admin" className="block relative group">
          {location.pathname === '/admin' && (
             <motion.div layoutId="activeNav" className="absolute inset-0 bg-primary/10 rounded-lg"/>
          )}
          <div className={cn(
            "flex items-center px-3 py-3 rounded-lg transition-colors relative z-10",
            location.pathname !== '/admin' && "group-hover:bg-white/5",
            sidebarOpen ? "justify-start gap-4" : "justify-center"
          )}>
            <Lock size={20} className={location.pathname === '/admin' ? 'text-primary' : 'text-muted group-hover:text-white'} />
            {sidebarOpen && (
              <span className={cn("font-medium", location.pathname === '/admin' ? 'text-primary' : 'text-muted group-hover:text-white')}>
                Admin
              </span>
            )}
          </div>
        </Link>
      </div>

      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 bg-surface border border-border rounded-full p-1 text-muted hover:text-white z-50 transition-colors"
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </motion.div>
  )
}
