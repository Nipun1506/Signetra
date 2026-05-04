import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config'

export default function Register() {
  const navigate = useNavigate()
  const { setRole } = useAuth()
  
  // High-Level State
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errorLine, setErrorLine] = useState('')

  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Select Gender',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    emailOTP: '',
    phoneOTP: ''
  })

  // OTP state
  const [otpSending, setOtpSending] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const API_URL = API_BASE_URL

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrorLine('')
  }

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return false;
    let types = 0;
    if (/[a-zA-Z]/.test(pwd)) types++;
    if (/[0-9]/.test(pwd)) types++;
    if (/[^a-zA-Z0-9]/.test(pwd)) types++;
    return types >= 2;
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const sendOTP = async () => {
    setOtpSending(true)
    setErrorLine('')
    try {
      const res = await fetch(`${API_URL}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, purpose: 'register' })
      })
      const data = await res.json()
      if (data.success) {
        setOtpSent(true)
        setStep(3)
        startResendCooldown()
      } else {
        setErrorLine('Failed to send verification codes. Please try again.')
      }
    } catch (err) {
      setErrorLine('Network error. Make sure the backend server is running.')
    } finally {
      setOtpSending(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    setOtpSending(true)
    setErrorLine('')
    try {
      const res = await fetch(`${API_URL}/api/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, purpose: 'register' })
      })
      const data = await res.json()
      if (data.success) {
        startResendCooldown()
        setErrorLine('')
      }
    } catch (err) {
      setErrorLine('Failed to resend codes.')
    } finally {
      setOtpSending(false)
    }
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.age || formData.gender === 'Select Gender') {
        setErrorLine('Please complete all demographic fields.')
        return
      }
      if (parseInt(formData.age, 10) < 13) {
        setErrorLine('You must be at least 13 years old to register.')
        return
      }
    }
    if (step === 2) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setErrorLine('Please complete all credentials.')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorLine('Passwords do not match.')
        return
      }
      if (!validatePassword(formData.password)) {
        setErrorLine('Password must be at least 8 characters and contain at least 2 types (letters, numbers, special characters).')
        return
      }
      // Send real OTP instead of just advancing
      sendOTP()
      return
    }
    setStep(step + 1)
  }

  const handlePreviousStep = () => {
    setStep(step - 1)
    setErrorLine('')
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.emailOTP) {
        setErrorLine('Please enter the verification code.')
        return
    }

    setIsLoading(true)
    setErrorLine('')

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          email: formData.email,
          password: formData.password,
          email_otp: formData.emailOTP,
        })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        // Store real JWT token and profile from backend
        localStorage.setItem('signetra_token', data.access_token)
        localStorage.setItem('signetra_profile', JSON.stringify(data.profile))
        const roleKey = data.profile.role === 'Administrator' ? 'admin' : (data.profile.role === 'Lead Administrator' ? 'lead_admin' : 'user')
        setRole(roleKey)
        navigate('/')
      } else {
        setErrorLine(data.detail || 'Registration failed. Please check your verification code.')
        setIsLoading(false)
      }
    } catch (err) {
      setErrorLine('Network error. Make sure the backend server is running.')
      setIsLoading(false)
    }
  }

  // Animation variants
  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20, transition: { duration: 0.15 } }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-6 relative overflow-hidden font-body">
      
      {/* Background Ambient Layers */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4d8eff]/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-[#adc6ff]/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-lg z-10">
        
        {/* Dynamic Header */}
        <div className="flex flex-col items-center mb-8 relative">
           <Link to="/login" className="absolute left-0 top-1 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
           </Link>
           <h1 className="text-2xl font-extrabold tracking-tight text-white">Create Account</h1>
           <p className="text-sm text-on-surface-variant mt-1 text-center max-w-sm">
             {step === 1 && "Identity & Demographic Profile"}
             {step === 2 && "Setup your Secure Credentials"}
             {step === 3 && "Email OTP Verification"}
           </p>
           
           {/* Step Indicators */}
           <div className="flex items-center gap-3 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-10 h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#4d8eff] shadow-lg shadow-[#4d8eff]/50' : 'bg-white/10'}`}></div>
                </div>
              ))}
           </div>
        </div>

        {errorLine && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">error</span>
                {errorLine}
            </motion.div>
        )}

        <div className="bg-surface-container-low border border-white/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#adc6ff] ml-1">Full Name</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">badge</span>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="First Last" type="text" className="w-full bg-[#1b1f2c] border border-white/5 rounded-xl text-white py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-[#4d8eff] outline-none text-sm"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#adc6ff] ml-1">Age</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">cake</span>
                      <input name="age" value={formData.age} onChange={handleChange} placeholder="25" type="number" className="w-full bg-[#1b1f2c] border border-white/5 rounded-xl text-white py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-[#4d8eff] outline-none text-sm"/>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#adc6ff] ml-1">Gender</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">wc</span>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#1b1f2c] border border-white/5 rounded-xl text-white py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-[#4d8eff] outline-none text-sm appearance-none cursor-pointer">
                         <option disabled>Select Gender</option>
                         <option>Male</option>
                         <option>Female</option>
                         <option>Non-Binary</option>
                         <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <button onClick={handleNextStep} className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm">
                  Continue Form
                </button>
              </motion.div>
            )}

            {/* STEP 2: CREDENTIALS */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#adc6ff] ml-1">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">mail</span>
                    <input name="email" value={formData.email} onChange={handleChange} placeholder="name@domain.com" type="email" className="w-full bg-[#1b1f2c] border border-white/5 rounded-xl text-white py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-[#4d8eff] outline-none text-sm"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#adc6ff] ml-1">Password</label>
                      <input name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" type="password" className="w-full bg-[#1b1f2c] border border-white/5 rounded-xl text-white py-3.5 px-4 focus:ring-2 focus:ring-[#4d8eff] outline-none text-sm tracking-widest"/>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#adc6ff] ml-1">Verify</label>
                      <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" type="password" className="w-full bg-[#1b1f2c] border border-white/5 rounded-xl text-white py-3.5 px-4 focus:ring-2 focus:ring-[#4d8eff] outline-none text-sm tracking-widest"/>
                   </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={handlePreviousStep} className="w-14 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center rounded-xl transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <button onClick={handleNextStep} disabled={otpSending} className="flex-1 bg-gradient-to-r from-[#4d8eff] to-[#adc6ff] text-[#001a42] font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg text-sm flex justify-center items-center gap-2 disabled:opacity-50">
                    {otpSending ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-[#001a42]/30 border-t-[#001a42] rounded-full" />
                        Sending Codes...
                      </>
                    ) : (
                      <>
                        Request OTP
                        <span className="material-symbols-outlined text-sm">send</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: OTP VERIFICATION */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">security</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Authorization Sent</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      We've dispatched a 6-digit verification code to <strong className="text-white">{formData.email || 'your email'}</strong>. Enter it below to finalize registering.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                   <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 ml-1">Email Code</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/50 text-sm">mail</span>
                        <input name="emailOTP" value={formData.emailOTP} onChange={handleChange} placeholder="000000" maxLength={6} type="text" className="w-full bg-[#1b1f2c] border border-white/5 rounded-xl text-white py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-400/50 outline-none font-mono text-center tracking-[0.5em] text-lg"/>
                      </div>
                   </div>
                </div>

                <button
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || otpSending}
                  className="w-full text-center text-xs text-on-surface-variant hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {otpSending ? 'Resending...' : resendCooldown > 0 ? `Resend codes in ${resendCooldown}s` : 'Didn\'t receive codes? Resend'}
                </button>

                <div className="flex gap-4 mt-6">
                  <button onClick={handlePreviousStep} disabled={isLoading} className="w-14 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center rounded-xl transition-all disabled:opacity-50">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <button onClick={handleFinalSubmit} disabled={isLoading} className="flex-1 bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-400 transition-all shadow-lg text-sm flex justify-center items-center gap-2 disabled:opacity-50">
                    {isLoading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                        Verifying Network...
                      </>
                    ) : (
                      <>
                        Confirm Verification
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
          
        </div>
      </div>
    </div>
  )
}
