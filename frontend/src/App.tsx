import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { motion } from 'framer-motion'
import { AppLayout } from './components/layout/AppLayout'
import { Home } from './pages/Home'
import Recognize from './pages/Recognize'
import Learn from './pages/Learn'
import ZoomIntegration from './pages/ZoomIntegration'
import WhatsAppIntegration from './pages/WhatsAppIntegration'
import History from './pages/History'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import Practice from './pages/Practice'
import UserLogs from './pages/UserLogs'
import Profile from './pages/Profile'
import AdminDocumentation from './pages/AdminDocumentation'
import Support from './pages/Support'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Landing from './pages/Landing'
import LegalConsentModal from './components/legal/LegalConsentModal'

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { role } = useAuth();
  if (role !== 'none') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const ProtectedRoute = () => {
  const { role } = useAuth();
  if (role === 'none') {
    return <Navigate to="/welcome" replace />;
  }
  if (role === 'user') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

const ProtectedAppLayout = () => {
  const { role } = useAuth();
  if (role === 'none') {
    return <Navigate to="/welcome" replace />;
  }
  return <AppLayout />;
};

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Keep the loading screen as requested for 2.5 seconds
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0a0e1a] flex flex-col items-center justify-center">
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20"
          >
            <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>waves</span>
          </motion.div>
          <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse"></div>
        </div>
        <h1 className="mt-8 text-2xl font-bold tracking-tighter text-[#adc6ff]">SIGNETRA</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c2c6d6] mt-2 opacity-50">Initializing AI Pipeline...</p>
      </div>
    )
  }

  return (
    <>
      <Routes>
      {/* Public Authentication Gateways */}
      <Route path="/welcome" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Secure App Sandbox */}
      <Route element={<ProtectedAppLayout />}>
        {/* Public App Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/recognize" element={<Recognize />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/zoom-integration" element={<ZoomIntegration />} />
        <Route path="/whatsapp" element={<WhatsAppIntegration />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route path="/practice/:gestureId" element={<Practice />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/docs" element={<AdminDocumentation />} />
          <Route path="/admin/logs" element={<UserLogs />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <LegalConsentModal />
  </>
  )
}
