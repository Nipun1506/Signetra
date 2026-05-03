import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import GlobalAIAssistant from '../chat/GlobalAIAssistant'
import NotificationDropdown from './NotificationDropdown'

export const AppLayout = () => {
  const location = useLocation()
  const { role } = useAuth()

  const navItems = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Recognize', path: '/recognize', icon: 'back_hand' },
    { name: 'Learn', path: '/learn', icon: 'school' },
    { name: 'Zoom', path: '/zoom-integration', icon: 'videocam' },
    { name: 'WhatsApp', path: '/whatsapp', icon: 'chat' },
    { name: 'History', path: '/history', icon: 'history' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
    { name: 'Admin', path: '/admin', icon: 'admin_panel_settings' },
  ]

  // We map the previous icons exactly: home, gesture, school, videocam, chat, history, settings, admin_panel_settings
  // Wait, the previous use had `gesture` for Recognize.
  const navItemsFixed = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Recognize', path: '/recognize', icon: 'gesture' },
    { name: 'Learn', path: '/learn', icon: 'school' },
    { name: 'Zoom', path: '/zoom-integration', icon: 'videocam' },
    { name: 'WhatsApp', path: '/whatsapp', icon: 'chat' },
    { name: 'History', path: '/history', icon: 'history' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
    { name: 'Admin', path: '/admin', icon: 'admin_panel_settings' },
  ]

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body overflow-hidden flex">
      {/* SideNavBar Integration */}
      <aside className="h-screen fixed left-0 top-0 flex flex-col bg-[#0f131f] py-6 z-50 w-20 hover:w-64 transition-[width] duration-300 ease-in-out group overflow-hidden border-r border-[#1b1f2c] shadow-2xl shadow-black/50">
        
        <div className="px-6 mb-10 h-10 flex flex-col justify-center whitespace-nowrap">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-lg">
               <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-[#adc6ff] leading-none">SIGNETRA</h1>
                <p className="text-[9px] text-on-surface-variant font-black tracking-[0.2em] mt-1.5 leading-none uppercase">Digital Curator</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2 mt-4 px-3">
          {navItemsFixed.filter(item => role !== 'user' || item.name !== 'Admin').map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center transition-all duration-300 rounded-xl relative group/item overflow-hidden h-12 w-14 group-hover:w-full ${
                  isActive
                    ? "text-[#adc6ff] bg-[#1b1f2c] shadow-inner shadow-black/20"
                    : "text-[#c2c6d6] hover:text-[#adc6ff] hover:bg-[#262a37]"
                }`}
              >
                {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#4d8eff]"></div>}
                
                <span className={`material-symbols-outlined shrink-0 z-10 transition-transform duration-300 absolute left-4 ${isActive ? 'scale-110' : 'group-hover/item:scale-110'}`}>
                  {item.icon}
                </span>

                <span className={`font-['Inter'] text-sm font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 absolute left-14 ${isActive ? 'font-bold' : ''}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-3">
          <Link
            to="/profile"
            className={`flex items-center transition-all duration-300 rounded-xl relative group/profile overflow-hidden h-12 w-14 group-hover:w-full ${
              location.pathname === '/profile'
                ? "text-[#adc6ff] bg-[#1b1f2c] shadow-inner shadow-black/20"
                : "text-[#c2c6d6] hover:text-[#adc6ff] hover:bg-[#262a37]"
            }`}
          >
            {location.pathname === '/profile' && <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#4d8eff]"></div>}
            
             <span className={`material-symbols-outlined shrink-0 transition-transform duration-300 absolute left-4 ${location.pathname === '/profile' ? 'scale-110' : 'group-hover/profile:scale-110'}`}>
               account_circle
             </span>
             
             <span className="font-['Inter'] text-sm font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 absolute left-14">
               Profile
             </span>
          </Link>
        </div>
      </aside>

      {/* TopNavBar Integration */}
      <header className="fixed top-0 left-20 right-0 h-16 z-40 bg-[#0a0e1a]/80 backdrop-blur-xl flex justify-end items-center px-8 shadow-sm border-b border-white/5 transition-all duration-300">
        <div className="flex items-center gap-6">
          {role !== 'user' && (
            <>
              <NotificationDropdown />
              <Link to="/admin/docs" title="Help Documentation" className="text-[#c2c6d6] hover:text-white transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined">help</span>
              </Link>
            </>
          )}
          <Link 
            to="/profile"
            className="h-8 w-8 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-transform hover:scale-110 overflow-hidden shadow-lg shadow-primary/20"
            title="Your Profile"
          >
            {(() => {
              try {
                const profileStr = localStorage.getItem('signetra_profile');
                if (!profileStr) return <span className="material-symbols-outlined text-sm">person</span>;
                const profile = JSON.parse(profileStr);
                return (
                  <img 
                    src={profile?.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                    onError={(e:any) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"; }} 
                    className="w-full h-full object-cover" 
                  />
                );
              } catch (e) {
                return <span className="material-symbols-outlined text-sm">person</span>;
              }
            })()}
          </Link>
        </div>
      </header>

      <main className="ml-20 flex flex-1 h-screen overflow-y-auto bg-surface-container-lowest custom-scrollbar transition-all duration-300">
        <div className="flex flex-col min-h-full w-full">
          <div className="flex-1 px-8 py-6">
            <Outlet />
          </div>
          <footer className="px-8 py-6 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-4 mt-12 bg-surface-container-low/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">waves</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Signetra Dashboard</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-on-surface-variant">
                  <span className="material-symbols-outlined text-xs">mail</span>
                  Contact Support: <a href="mailto:signetracare@gmail.com" className="text-primary hover:underline">signetracare@gmail.com</a>
                </div>
                <p className="text-[8px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">
                   Intellectual Property of Team Signetra
                </p>
              </div>
              <p className="text-[10px] text-on-surface-variant">
                &copy; {new Date().getFullYear()} Signetra
              </p>
            </div>
          </footer>
        </div>
      </main>

      <GlobalAIAssistant />
    </div>
  )
}
