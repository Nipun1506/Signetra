import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import { API_BASE_URL } from '../../config'

export default function Login() {
  const navigate = useNavigate()
  const { setRole } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotContact, setForgotContact] = useState('')
  const [forgotOTP, setForgotOTP] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [isForgotLoading, setIsForgotLoading] = useState(false)

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return false;
    let types = 0;
    if (/[a-zA-Z]/.test(pwd)) types++;
    if (/[0-9]/.test(pwd)) types++;
    if (/[^a-zA-Z0-9]/.test(pwd)) types++;
    return types >= 2;
  }
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      // Specific Admin/Lead injections
      const leadEmails = ['nipunnaikwadi131270@gmail.com', 'nikitasharmaji00@gmail.com', 'saurabhyadavtly18.58@gmail.com', 'Purvasatav07@gmail.com'];
      const isAdminEmail = email === 'nipunnaikwadi15@gmail.com' && password === 'nipun0001';
      
      if (leadEmails.includes(email) || isAdminEmail) {
        const isLead = leadEmails.includes(email);
        const roleStr = isLead ? "Lead Administrator" : "Administrator";
        
        const superProfile = {
           fullName: "Nipun Naikwadi",
           email: email,
           age: 20,
           gender: "Male",
           phoneNumber: "Skipped (Admin)",
           avatarUrl: "https://ui-avatars.com/api/?name=Nipun+Naikwadi&background=random",
           role: roleStr,
           baseRole: roleStr
        };
        localStorage.setItem('signetra_profile', JSON.stringify(superProfile));
        setRole(isLead ? 'lead_admin' : 'admin');
      } else {
        // Fallback for random mock users
        const mockProfile = {
           fullName: "Demo User",
           email: email || "demo@example.com",
           age: 25,
           gender: "Not Specified",
           phoneNumber: "123-456-7890",
           avatarUrl: "https://ui-avatars.com/api/?name=Demo+User&background=random",
           role: "Standard User",
           baseRole: "Standard User"
        };
        localStorage.setItem('signetra_profile', JSON.stringify(mockProfile));
        setRole('user');
      }
      navigate('/')
    }, 1500)
  }

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true)
      try {
        const API_URL = API_BASE_URL;
        // Send the access token to backend for verification and session setup
        const res = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token })
        })
        const data = await res.json()
        
        if (res.ok && data.success) {
          const userEmail = data.profile.email;
          const leadEmails = ['nipunnaikwadi131270@gmail.com', 'nikitasharmaji00@gmail.com', 'saurabhyadavtly18.58@gmail.com', 'Purvasatav07@gmail.com'];
          const isLead = leadEmails.includes(userEmail);
          const isAdmin = userEmail === 'nipunnaikwadi15@gmail.com';
          
          let resolvedRoleStr = 'Standard User';
          let resolvedRoleKey: 'user'|'admin'|'lead_admin'|'none' = 'user';
          
          if (isLead) {
              resolvedRoleStr = 'Lead Administrator';
              resolvedRoleKey = 'lead_admin';
          } else if (isAdmin) {
              resolvedRoleStr = 'Administrator';
              resolvedRoleKey = 'admin';
          }
          
          // Store backend-verified profile in localStorage
          localStorage.setItem('signetra_profile', JSON.stringify({
            firstName: data.profile.given_name || data.profile.name,
            lastName: data.profile.family_name || '',
            email: userEmail,
            role: resolvedRoleStr,
            baseRole: resolvedRoleStr,
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            avatarUrl: data.profile.picture || '',
            age: 18,
            gender: 'Not Specified'
          }))
          if(data.access_token) localStorage.setItem('signetra_token', data.access_token)
          setRole(resolvedRoleKey)
          navigate('/')
        } else {
          alert('Google login failed: ' + (data.detail || 'Unknown error'))
        }
      } catch (err) {
        alert('Network error communicating with authentication server.')
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => {
      alert('Google Login Failed')
      setIsLoading(false)
    }
  })

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-6 relative overflow-hidden font-body">
      
      {/* Background Ambient Layers */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-2xl mb-6 overflow-hidden">
              <img src="/logo.png" alt="Signetra Logo" className="w-full h-full object-cover" />
            </div>
           <h1 className="text-3xl font-extrabold tracking-tighter text-white uppercase">SIGNETRA</h1>
           <p className="text-xs uppercase tracking-[0.3em] text-[#adc6ff] mt-2 font-bold">Authentication Gateway</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low border border-white/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-sm text-on-surface-variant mt-1">Enter your credentials to access the platform.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#adc6ff] ml-1">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">mail</span>
                <input 
                  type="email" 
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#1b1f2c] border border-white/5 rounded-xl text-white py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-[#4d8eff] focus:border-transparent transition-all outline-none placeholder:text-white/20 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#adc6ff] ml-1">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">lock</span>
                <input 
                  type="password" 
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1b1f2c] border border-white/5 rounded-xl text-white py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-[#4d8eff] focus:border-transparent transition-all outline-none placeholder:text-white/20 text-sm tracking-widest"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
               <label className="flex items-center gap-2 cursor-pointer group">
                 <input type="checkbox" className="rounded-md border-white/10 bg-[#1b1f2c] text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                 <span className="text-xs text-on-surface-variant group-hover:text-white transition-colors">Remember me</span>
               </label>
               <button 
                 type="button" 
                 onClick={(e) => { e.preventDefault(); setShowForgotModal(true); setForgotStep(1); setForgotError(''); }} 
                 className="text-xs text-[#4d8eff] hover:text-[#adc6ff] font-medium transition-colors cursor-pointer"
               >
                 Forgot Password?
               </button>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#4d8eff] to-[#adc6ff] text-[#001a42] font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-[#001a42]/30 border-t-[#001a42] rounded-full" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
             <div className="flex-1 h-px bg-white/5"></div>
             <p className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">Or continue with</p>
             <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <button 
            onClick={() => handleGoogleAuth()}
            disabled={isLoading}
            className="w-full mt-6 bg-[#1b1f2c] hover:bg-white/5 border border-white/5 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
          >
             <span className="bg-white p-1 rounded-full flex items-center justify-center w-6 h-6 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16px" height="16px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
             </span>
             Sign in with Google
          </button>
        </motion.div>

        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#4d8eff] font-bold hover:text-[#adc6ff] transition-colors underline decoration-white/20 underline-offset-4">Create an account</Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-surface-container-low max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-outline-variant/10 relative overflow-hidden"
            >
              <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
              <p className="text-xs text-on-surface-variant mb-4">
                {forgotStep === 1 && "Enter your Email Address to receive an authorization OTP."}
                {forgotStep === 2 && `An OTP has been sent to ${forgotContact}. Please enter it below.`}
                {forgotStep === 3 && "Create a secure new password."}
              </p>
              
              {forgotError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  {forgotError}
                </div>
              )}

              {/* Step 1: Input Contact */}
              {forgotStep === 1 && (
                <div className="space-y-4 mb-8">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">contact_mail</span>
                    <input 
                      type="text" 
                      value={forgotContact}
                      onChange={(e) => { setForgotContact(e.target.value); setForgotError(''); }}
                      placeholder="Email Address" 
                      className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3 pl-11 text-sm focus:ring-2 focus:ring-primary/30" 
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Input OTP */}
              {forgotStep === 2 && (
                <div className="space-y-4 mb-8">
                  <input 
                    type="text" 
                    maxLength={6}
                    value={forgotOTP}
                    onChange={(e) => { setForgotOTP(e.target.value.replace(/\D/g, '')); setForgotError(''); }}
                    placeholder="000 000" 
                    className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3 text-2xl tracking-[0.5em] text-center font-mono focus:ring-2 focus:ring-primary/30 outline-none" 
                  />
                </div>
              )}

              {/* Step 3: New Password */}
              {forgotStep === 3 && (
                <div className="space-y-4 mb-8">
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setForgotError(''); }}
                    placeholder="New Password" 
                    className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3 text-sm focus:ring-2 focus:ring-primary/30" 
                  />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setForgotError(''); }}
                    placeholder="Verify New Password" 
                    className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3 text-sm focus:ring-2 focus:ring-primary/30" 
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end mt-4">
                <button 
                  onClick={() => {
                     setShowForgotModal(false);
                     setForgotContact('');
                     setForgotOTP('');
                     setNewPassword('');
                     setConfirmPassword('');
                     setForgotError('');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-white transition-colors"
                >Cancel</button>

                <button 
                  onClick={async () => {
                    const API_URL = 'http://localhost:8000';
                    if (forgotStep === 1) {
                      if (!forgotContact) { setForgotError('Please enter a valid credential.'); return; }
                      setIsForgotLoading(true);
                      try {
                        const res = await fetch(`${API_URL}/api/otp/send`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: forgotContact, purpose: 'forgot_password' })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setForgotStep(2);
                        } else {
                          setForgotError('Failed to send OTP. Please try again.');
                        }
                      } catch (err) {
                        setForgotError('Network error. Is the backend running?');
                      } finally {
                        setIsForgotLoading(false);
                      }
                    }
                    else if (forgotStep === 2) {
                      if (forgotOTP.length !== 6) { setForgotError('Please enter exactly 6 digits.'); return; }
                      setIsForgotLoading(true);
                      try {
                        const res = await fetch(`${API_URL}/api/otp/verify`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: forgotContact, email_otp: forgotOTP, purpose: 'forgot_password' })
                        });
                        const data = await res.json();
                        if (res.ok && data.verified) {
                          if (data.access_token) localStorage.setItem('signetra_token', data.access_token);
                          setForgotStep(3);
                        } else {
                          setForgotError(data.detail || 'Invalid OTP. Please try again.');
                        }
                      } catch (err) {
                        setForgotError('Network error. Is the backend running?');
                      } finally {
                        setIsForgotLoading(false);
                      }
                    }
                    else if (forgotStep === 3) {
                      if (newPassword !== confirmPassword) { setForgotError('Passwords do not match.'); return; }
                      if (!validatePassword(newPassword)) { setForgotError('Password must be at least 8 chars and have 2 char types.'); return; }
                      
                      setIsForgotLoading(true);
                      setTimeout(() => { 
                        setIsForgotLoading(false); 
                        setShowForgotModal(false);
                        alert("Password successfully reset! You may now login.");
                      }, 1000);
                    }
                  }}
                  disabled={isForgotLoading}
                  className="px-5 py-2 flex items-center justify-center min-w-[100px] text-sm font-bold bg-primary text-[#001a42] rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isForgotLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border border-[#001a42]/30 border-t-[#001a42] rounded-full" />
                  ) : (
                    forgotStep === 3 ? 'Reset Password' : forgotStep === 2 ? 'Verify OTP' : 'Send OTP'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
