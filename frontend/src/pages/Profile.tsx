import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'
import { getAchievementState, getLevelProgress } from '../utils/achievementSystem'

export default function Profile() {
  const { role, baseRole, setRole } = useAuth()
  const achievements = getAchievementState()
  const { progress, nextThreshold } = getLevelProgress(achievements.totalXP)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFAInput, setTwoFAInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load exact user profile from local storage to ensure each user sees their own
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('signetra_profile')
    if (saved) return JSON.parse(saved)
    return {
      firstName: 'Nipun',
      lastName: '',
      email: 'nipun@signetra.local',
      role: 'Lead Administrator',
      joinDate: 'April 22, 2026',
      avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      age: 20,
      gender: 'Male'
    }
  })

  // Preferences State
  const [preferences, setPreferences] = useState({
    publicProfile: true,
    emailNotifications: true,
    weeklyReports: false,
    twoFactorEnabled: false
  })

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return false;
    let types = 0;
    if (/[a-zA-Z]/.test(pwd)) types++;
    if (/[0-9]/.test(pwd)) types++;
    if (/[^a-zA-Z0-9]/.test(pwd)) types++;
    return types >= 2;
  }

  const handleAvatarChange = () => {
    if (!isEditing) return;
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  }

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
          alert("Invalid file format. Please upload a .jpg, .jpeg, or .png image.");
          return;
      }

      if (file.size > 5 * 1024 * 1024) {
          alert("File is too large. Maximum size is 5MB.");
          return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
          if (event.target?.result && typeof event.target.result === 'string') {
              setProfileData({...profileData, avatarUrl: event.target.result});
          }
      };
      reader.readAsDataURL(file);
  }

  const handleSave = () => {
    setIsEditing(false)
    localStorage.setItem('signetra_profile', JSON.stringify(profileData))
    // Changes saved securely to local device
  }

  const handleLogout = () => {
    // Clear tokens and role
    setRole('none')
  }

  return (
    <div className="pt-24 pb-12 px-8 md:px-12 w-full font-body relative overflow-x-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-2 block">User Account</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Your Profile</h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Profile Identity Column */}
          <section className="lg:col-span-8 space-y-8">
            <div className="bg-surface-container-low rounded-[1.5rem] p-8 border border-outline-variant/10 shadow-xl shadow-blue-500/5 relative overflow-hidden">
              {/* Cover Banner Mock */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-surface-container-high via-[#2d3a5a] to-surface-container-highest opacity-70"></div>
              
              <div className="relative pt-12 flex flex-col md:flex-row gap-8 items-start md:items-end mb-10">
                <div className="relative">
                  <div onClick={handleAvatarChange} className={`w-32 h-32 rounded-full border-4 border-surface-container-low bg-surface-container-highest shadow-2xl overflow-hidden flex items-center justify-center relative ${isEditing ? 'cursor-pointer group' : ''}`}>
                    <img src={profileData.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} alt="Profile Avatar" className="w-full h-full object-cover" />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-3xl">cloud_upload</span>
                        <span className="text-[9px] font-black uppercase text-white mt-1 tracking-widest text-center px-2">Upload<br/>JPEG / PNG</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} hidden accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleFileDrop} />
                  <span className="absolute bottom-2 right-2 w-5 h-5 bg-[#25D366] border-2 border-surface-container-low rounded-full"></span>
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-end w-full">
                    <div>
                      <h3 className="text-3xl font-extrabold text-white tracking-tight">{profileData.firstName} {profileData.lastName}</h3>
                      <p className="text-primary font-medium mt-1">{profileData.role}</p>
                    </div>
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-bold hover:text-white transition-all shadow-md flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span> Edit
                      </button>
                    ) : (
                      <button 
                        onClick={handleSave}
                        className="px-6 py-2 rounded-full bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] text-[#001a42] text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">check</span> Save
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">First Name</label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3.5 focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Last Name</label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3.5 focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Email Address</label>
                  <input 
                    type="email" 
                    disabled={!isEditing}
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3.5 focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Age</label>
                  <input 
                    type="number" 
                    disabled={!isEditing}
                    value={profileData.age || ''}
                    onChange={(e) => setProfileData({...profileData, age: parseInt(e.target.value) || 0})}
                    className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3.5 focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Gender</label>
                  <select 
                    disabled={!isEditing}
                    value={profileData.gender || 'Not Specified'}
                    onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3.5 focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-Binary</option>
                    <option>Prefer not to say</option>
                    <option>Not Specified</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Settings Box */}
            <div className="bg-surface-container-low rounded-[1.5rem] p-8 border border-outline-variant/10 shadow-xl shadow-blue-500/5">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">security</span>
                <h3 className="text-xl font-bold tracking-tight text-white">Security & Login</h3>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-surface-container rounded-xl border border-outline-variant/5 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Password</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Last changed 3 months ago</p>
                </div>
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant/20 text-on-surface text-xs font-bold hover:bg-surface-container-highest transition-all"
                >
                  Change Password
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-surface-container rounded-xl border border-outline-variant/5 gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Two-Factor Authentication</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {preferences.twoFactorEnabled ? 'Your account is secured with 2FA.' : 'Add an extra layer of security'}
                  </p>
                </div>
                {preferences.twoFactorEnabled ? (
                  <button 
                    onClick={() => setPreferences({ ...preferences, twoFactorEnabled: false })}
                    className="px-5 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all"
                  >
                    Disable 2FA
                  </button>
                ) : (
                  <button 
                    onClick={() => { setTwoFAInput(''); setShow2FAModal(true); }}
                    className="px-5 py-2.5 rounded-lg bg-surface-container-highest text-primary text-xs font-bold hover:bg-primary/10 transition-all"
                  >
                    Enable 2FA
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Level & Achievements */}
            <div className="bg-surface-container-low rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-xl shadow-blue-500/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">military_tech</span>
                  <h3 className="text-lg font-bold tracking-tight text-white">Mastery Level</h3>
                </div>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Level {achievements.level}</span>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  <span>Progress to Next Rank</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-primary to-[#4d8eff] shadow-[0_0_15px_rgba(173,198,255,0.3)]"
                  />
                </div>
                <p className="text-[9px] text-on-surface-variant mt-2 text-right italic">{achievements.totalXP} / {nextThreshold} XP</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Badges Earned</p>
                <div className="flex flex-wrap gap-3">
                  {achievements.badges.map(badge => (
                    <div 
                      key={badge.id} 
                      title={badge.unlockedAt ? `Unlocked on ${new Date(badge.unlockedAt).toLocaleDateString()}` : `Unlocks at Level ${badge.level}`}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${badge.unlockedAt ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-container-highest border-white/5 text-white/10 grayscale'}`}
                    >
                      <span className="material-symbols-outlined text-2xl">{badge.icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-surface-container-low rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-xl shadow-blue-500/5">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">tune</span>
                <h3 className="text-lg font-bold tracking-tight text-white">Preferences</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-white">Public Profile</span>
                    <span className="text-xs text-on-surface-variant italic">Let others find you</span>
                  </div>
                  <div 
                    onClick={() => setPreferences({...preferences, publicProfile: !preferences.publicProfile})}
                    className={`w-11 h-6 rounded-full relative cursor-pointer ${preferences.publicProfile ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.publicProfile ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-white">Email Alerts</span>
                    <span className="text-xs text-on-surface-variant italic">System notifications</span>
                  </div>
                  <div 
                    onClick={() => setPreferences({...preferences, emailNotifications: !preferences.emailNotifications})}
                    className={`w-11 h-6 rounded-full relative cursor-pointer ${preferences.emailNotifications ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.emailNotifications ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-white">Weekly Report</span>
                    <span className="text-xs text-on-surface-variant italic">Practice analytics</span>
                  </div>
                  <div 
                    onClick={() => setPreferences({...preferences, weeklyReports: !preferences.weeklyReports})}
                    className={`w-11 h-6 rounded-full relative cursor-pointer ${preferences.weeklyReports ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.weeklyReports ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Meta & Danger Zone */}
            <div className="bg-surface-container-low rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Account Status</p>
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-sm">verified</span>
                    <span className="text-sm font-bold text-primary">Pro Tier Active</span>
                  </div>
                  <span className="text-xs text-on-surface-variant">Member since {profileData.joinDate}</span>
                </div>
              </div>

              {/* Developer Role Switcher */}
              {baseRole !== 'user' && (
                <div className="mb-6 border-t border-white/10 pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#adc6ff] mb-3">Dev Role Switcher</p>
                  <div className="flex gap-2 p-1 bg-surface-container-highest rounded-xl">
                    {(['user', 'admin', 'lead_admin'] as UserRole[])
                      .filter(r => baseRole === 'lead_admin' || (baseRole === 'admin' && r !== 'lead_admin'))
                      .map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setRole(r)
                          setProfileData({...profileData, role: r === 'lead_admin' ? 'Lead Administrator' : r === 'admin' ? 'Administrator' : 'Standard User'})
                        }}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors ${role === r ? 'bg-primary text-[#001a42] shadow-md' : 'text-on-surface-variant hover:text-white'}`}
                      >
                        {r === 'lead_admin' ? 'LEAD' : r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-error-container text-error hover:bg-error hover:text-white transition-all font-bold text-sm"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Log Out Instead
              </button>
            </div>
            
          </aside>
        </div>
      </div>

      {/* Password Modal Overlay */}
      <AnimatePresence>
        {showPasswordModal && (
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
              className="bg-surface-container-low max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-outline-variant/10"
            >
              <h3 className="text-xl font-bold text-white mb-2">Change Password</h3>
              <p className="text-xs text-on-surface-variant mb-4">Enter your new credentials below securely.</p>
              
              {pwdError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  {pwdError}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <input type="password" placeholder="Current Password" className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3 text-sm focus:ring-2 focus:ring-primary/30" />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPwdError(''); }}
                  placeholder="New Password" 
                  className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3 text-sm focus:ring-2 focus:ring-primary/30" 
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => { setShowPasswordModal(false); setPwdError(''); setNewPassword(''); }}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-white transition-colors"
                >Cancel</button>
                <button 
                  onClick={() => {
                    if (!validatePassword(newPassword)) {
                      setPwdError('Password must be at least 8 characters and contain at least 2 types (letters, numbers, special characters).');
                      return;
                    }
                    setShowPasswordModal(false);
                    setPwdError('');
                    setNewPassword('');
                  }}
                  className="px-5 py-2 text-sm font-bold bg-primary text-[#001a42] rounded-lg hover:brightness-110 transition-all"
                >Update</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 2FA Setup Modal */}
        {show2FAModal && (
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
              className="bg-surface-container-low max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-outline-variant/10 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                 <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Setup 2FA</h3>
              <p className="text-xs text-on-surface-variant mb-6 px-4">Scan this QR code with Google Authenticator or Authy, then enter the 6-digit code below.</p>
              
              <div className="w-32 h-32 bg-white rounded-xl p-2 mb-6 shadow-inner flex items-center justify-center">
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Signetra:User?secret=JBSWY3DPEHPK3PXP&issuer=Signetra" alt="Mock QR Code" className="w-full h-full mix-blend-multiply" />
              </div>

              <div className="w-full space-y-4 mb-8 text-left">
                <input 
                  type="text" 
                  maxLength={6}
                  value={twoFAInput}
                  onChange={(e) => setTwoFAInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000 000" 
                  className="w-full bg-surface-container-highest border border-outline-variant/5 rounded-xl text-on-surface p-3 text-2xl tracking-[0.5em] text-center font-mono focus:ring-2 focus:ring-primary/30 outline-none" 
                />
              </div>

              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1 py-3 text-sm font-semibold border border-white/10 text-on-surface-variant hover:text-white rounded-xl transition-colors"
                >Cancel</button>
                <button 
                  onClick={() => {
                    if (twoFAInput.length === 6) {
                      setPreferences({...preferences, twoFactorEnabled: true})
                      setShow2FAModal(false)
                    } else {
                      alert('Please enter a 6 digit code.')
                    }
                  }}
                  className={`flex-1 py-3 text-sm font-bold bg-primary text-[#001a42] rounded-xl transition-all ${twoFAInput.length === 6 ? 'hover:brightness-110 shadow-lg shadow-blue-500/20' : 'opacity-50 cursor-not-allowed'}`}
                >Verify</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
