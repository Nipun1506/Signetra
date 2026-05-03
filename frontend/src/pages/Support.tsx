import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import { useAuth } from '../context/AuthContext'

export default function Support() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'lead_admin';
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [tickets, setTickets] = useState<any[]>([]);
  const [formData, setFormData] = useState({ subject: '', description: '', priority: 'Medium - UX Issue' });
  
  // Resolution Workspace State
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [activeTab, setActiveTab] = useState<'Open' | 'Pending' | 'Resolved'>('Open');

  const healthChecks = [
    { label: 'AI Inference Pipeline', status: 'Operational', latency: '24ms', color: 'text-emerald-400' },
    { label: 'WebSocket Signal Server', status: 'Online', latency: '12ms', color: 'text-emerald-400' },
    { label: 'SQLite Persistence', status: 'Healthy', latency: '4ms', color: 'text-emerald-400' },
    { label: 'MediaPipe Engine', status: 'Active', latency: '31ms', color: 'text-emerald-400' },
  ];

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('signetra_token');
      const res = await fetch(`${API_BASE_URL}/api/support/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Unauthorized or Server Error');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        console.warn("Tickets response is not an array:", data);
        setTickets([]);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
      setTickets([]);
    }
  };

  const fetchReplies = async (ticketId: number) => {
    try {
      const token = localStorage.getItem('signetra_token');
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/replies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setReplies(data);
      } else {
        setReplies([]);
      }
    } catch (err) {
      console.error("Failed to fetch replies", err);
      setReplies([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus('sending');
    
    try {
      const token = localStorage.getItem('signetra_token');
      const res = await fetch(`${API_BASE_URL}/api/support/tickets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          admin_id: 'RA-9921'
        })
      });
      if (!res.ok) throw new Error('Failed to create ticket');
      setTicketStatus('success');
      fetchTickets();
    } catch (err) {
      alert("Failed to transmit ticket. Check server connection.");
      setTicketStatus('idle');
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setIsSendingReply(true);
    try {
      const token = localStorage.getItem('signetra_token');
      await fetch(`${API_BASE_URL}/api/support/tickets/${selectedTicket.id}/replies`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: replyText,
          author: 'Engineering Support'
        })
      });
      setReplyText('');
      fetchReplies(selectedTicket.id);
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus: any) => {
    if (!selectedTicket) return;
    try {
      const token = localStorage.getItem('signetra_token');
      await fetch(`${API_BASE_URL}/api/support/tickets/${selectedTicket.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      fetchTickets();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getPriorityColor = (p: string) => {
    if (p.includes('Critical')) return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    if (p.includes('High')) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-primary bg-primary/10 border-primary/20';
  };

  const getStatusColor = (s: string) => {
    if (s === 'Resolved') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (s === 'Pending') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-primary bg-primary/10 border-primary/20';
  };

  const filteredTickets = tickets.filter(t => t.status === activeTab);
  const counts = {
    Open: tickets.filter(t => t.status === 'Open').length,
    Pending: tickets.filter(t => t.status === 'Pending').length,
    Resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-[#0f131f] text-white p-10 pt-24 font-inter">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-6xl mx-auto flex items-center gap-6 mb-12"
      >
        <button 
          onClick={() => navigate(isAdmin ? '/admin' : '/')}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all group"
        >
          <span className="material-symbols-outlined text-xl opacity-40 group-hover:opacity-100 transition-opacity">arrow_back</span>
        </button>
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Support Hub</h1>
           <p className="text-xs opacity-40 uppercase tracking-[0.3em] mt-1">{isAdmin ? 'Global Response Center' : 'Technical & UX Support'}</p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Admin Dashboard Layout */}
        {isAdmin ? (
          <>
            {/* Left Column: Diagnostics & System Stats */}
            <div className="lg:col-span-4 space-y-8">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-[#1b2235] rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <span className="material-symbols-outlined text-6xl">network_check</span>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-8">System Health</h3>
                  <div className="space-y-4">
                     {healthChecks.map((check) => (
                       <div key={check.label} className="bg-[#0a0e1a] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                          <div>
                             <p className="text-[9px] uppercase tracking-widest opacity-40 mb-0.5">{check.label}</p>
                             <p className={`text-xs font-bold ${check.color}`}>{check.status}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[7px] uppercase tracking-widest opacity-20 mb-0.5">Latency</p>
                             <p className="text-[10px] font-mono opacity-60">{check.latency}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </motion.div>

               <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-6">Management Tools</h3>
                  <div className="space-y-4">
                     <button 
                       onClick={() => setTicketStatus('idle')}
                       className="w-full py-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-3"
                     >
                       <span className="material-symbols-outlined text-sm">add</span>
                       Create Internal Ticket
                     </button>
                     <button className="w-full py-4 bg-white/5 border border-white/5 text-white/40 rounded-2xl font-bold uppercase text-[10px] tracking-widest cursor-not-allowed flex items-center justify-center gap-3">
                       <span className="material-symbols-outlined text-sm">history</span>
                       Export Ticket Logs
                     </button>
                  </div>
               </div>
            </div>

            {/* Right Column: Ticket Inbox & Form */}
            <div className="lg:col-span-8 space-y-8">
               {/* Administrative Ticket Inbox */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-[#1b2235] rounded-[3rem] p-10 border border-white/5 shadow-2xl overflow-hidden min-h-[600px] flex flex-col"
               >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Global Response Queue</h3>
                    <span className="text-[10px] font-mono opacity-40">{tickets.length} Active Tickets</span>
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-2xl border border-white/5">
                     {(['Open', 'Pending', 'Resolved'] as const).map(tab => (
                       <button 
                         key={tab}
                         onClick={() => setActiveTab(tab)}
                         className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white/10 text-white shadow-xl shadow-black/20' : 'opacity-30 hover:opacity-100'}`}
                       >
                         {tab}
                         <span className={`px-2 py-0.5 rounded-md text-[8px] ${activeTab === tab ? 'bg-primary text-black' : 'bg-white/5'}`}>
                            {counts[tab]}
                         </span>
                       </button>
                     ))}
                  </div>

                  <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                     {filteredTickets.map((t) => (
                       <div 
                         key={t.id} 
                         onClick={() => setSelectedTicket(t)}
                         className="bg-[#0a0e1a] p-6 rounded-2xl border border-white/5 hover:border-primary/40 transition-all cursor-pointer group"
                       >
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <h4 className="text-xs font-bold mb-1 group-hover:text-primary transition-colors">{t.subject}</h4>
                                <p className="text-[10px] opacity-40">{new Date(t.created_at).toLocaleString()}</p>
                             </div>
                             <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getPriorityColor(t.priority)}`}>
                                {t.priority.split(' - ')[0]}
                             </span>
                          </div>
                          <p className="text-[11px] opacity-60 leading-relaxed bg-white/5 p-4 rounded-xl italic line-clamp-2">
                             "{t.description}"
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                             <span className="text-[9px] font-bold opacity-30 uppercase">Origin: {t.admin_id}</span>
                             <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${getStatusColor(t.status).split(' ')[0]}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(t.status).split(' ')[1].replace('bg-', '')}`} />
                                {t.status}
                             </span>
                          </div>
                       </div>
                     ))}
                     {filteredTickets.length === 0 && (
                       <div className="py-20 text-center opacity-20 uppercase tracking-widest text-xs">
                          No {activeTab.toLowerCase()} tickets found
                       </div>
                     )}
                  </div>
               </motion.div>

               {/* Collapsible Internal Ticket Form */}
               <AnimatePresence>
                 {(ticketStatus === 'idle' || ticketStatus === 'sending' || ticketStatus === 'success') && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="bg-white/[0.02] backdrop-blur-xl rounded-[3rem] p-10 border border-white/5 overflow-hidden shadow-2xl relative"
                   >
                     <button 
                       onClick={() => setTicketStatus('idle')} // This is just to close/reset for now, maybe use another state for collapse
                       className="absolute top-8 right-10 text-white/20 hover:text-white"
                     >
                        <span className="material-symbols-outlined text-sm" onClick={() => setTicketStatus('idle')}>close</span>
                     </button>

                     <div className="mb-8">
                        <h3 className="text-lg font-bold">New Internal Task</h3>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest">Route directly to engineering pipeline</p>
                     </div>

                     {ticketStatus !== 'success' ? (
                       <form onSubmit={handleSubmit} className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[9px] font-bold uppercase tracking-widest opacity-30">Priority</label>
                               <select 
                                 value={formData.priority}
                                 onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                 className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none"
                               >
                                  <option>Low - Question</option>
                                  <option>Medium - UX Issue</option>
                                  <option>High - AI Failure</option>
                                  <option value="Critical - System Down">CRITICAL - System Down</option>
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-bold uppercase tracking-widest opacity-30">Subject</label>
                               <input 
                                 required 
                                 type="text" 
                                 value={formData.subject}
                                 onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                 className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none" 
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest opacity-30">Description</label>
                            <textarea 
                              required 
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              className="w-full h-24 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none resize-none" 
                            />
                         </div>
                         <button 
                           disabled={ticketStatus === 'sending'}
                           className="w-full py-4 bg-primary text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.01] transition-all disabled:opacity-50"
                         >
                            {ticketStatus === 'sending' ? 'Transmitting...' : 'Initialize Secure Connection'}
                         </button>
                       </form>
                     ) : (
                       <div className="text-center py-10">
                          <span className="material-symbols-outlined text-4xl text-emerald-400 mb-4">check_circle</span>
                          <h4 className="font-bold">Ticket Created</h4>
                          <button onClick={() => setTicketStatus('idle')} className="mt-4 text-[10px] uppercase tracking-widest text-primary border-b border-primary/20">Create Another</button>
                       </div>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </>
        ) : (
          /* Normal User Layout: Big Support Form */
          <div className="lg:col-span-12 space-y-8">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white/[0.02] backdrop-blur-xl rounded-[3rem] p-12 border border-white/5 shadow-2xl flex flex-col"
             >
                <div className="mb-10 text-center">
                   <h2 className="text-2xl font-bold mb-2">Submit a Support Ticket</h2>
                   <p className="text-xs opacity-40 uppercase tracking-widest">Typical response time: &lt; 2 Hours</p>
                </div>

                <AnimatePresence mode="wait">
                  {ticketStatus === 'idle' || ticketStatus === 'sending' ? (
                    <motion.form 
                      key="form"
                      exit={{ opacity: 0, y: -20 }}
                      onSubmit={handleSubmit} 
                      className="space-y-8 flex-1"
                    >
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">User ID</label>
                             <input type="text" value={role === 'lead_admin' ? 'LEAD-9921' : isAdmin ? 'RA-9921' : 'USR-SIGNETRA'} readOnly className="w-full bg-black/20 border border-white/5 rounded-xl px-6 py-4 text-xs font-mono opacity-60" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Priority</label>
                             <select 
                               value={formData.priority}
                               onChange={(e) => setFormData({...formData, priority: e.target.value})}
                               className="w-full bg-black/20 border border-white/5 rounded-xl px-6 py-4 text-xs appearance-none cursor-pointer outline-none"
                             >
                                <option>Low - Question</option>
                                <option>Medium - UX Issue</option>
                                <option>High - AI Failure</option>
                                <option value="Critical - System Down" className="text-rose-400 font-bold">CRITICAL - System Down</option>
                             </select>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Subject</label>
                          <input 
                            required 
                            type="text" 
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            placeholder="e.g. Mediapipe Detection Lag" 
                            className="w-full bg-black/20 border border-white/5 rounded-xl px-6 py-4 text-xs focus:ring-1 focus:ring-primary/40 transition-all outline-none" 
                          />
                       </div>
                       <div className="space-y-2 flex-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Detailed Description</label>
                          <textarea 
                            required 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Explain the behavior..." 
                            className="w-full h-40 bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-xs focus:ring-1 focus:ring-primary/40 transition-all outline-none resize-none" 
                          />
                       </div>
                       
                       <button 
                         disabled={ticketStatus === 'sending'}
                         className="w-full py-5 bg-gradient-to-r from-primary to-[#4d8eff] text-[#001a42] rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                       >
                          {ticketStatus === 'sending' ? 'Transmitting...' : 'Initialize Secure Connection'}
                       </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col items-center justify-center text-center p-12"
                    >
                       <div className="w-24 h-24 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-8">
                          <span className="material-symbols-outlined text-5xl text-emerald-400">check_circle</span>
                       </div>
                       <h3 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Connection Established</h3>
                       <p className="text-xs opacity-60 leading-relaxed max-w-sm font-medium">
                          Your request has been routed to the Signetra Core Engineering team. You will receive a response in the notification panel shortly.
                       </p>
                       <button 
                         onClick={() => {
                           setTicketStatus('idle');
                           setFormData({ subject: '', description: '', priority: 'Medium - UX Issue' });
                         }}
                         className="mt-10 text-xs font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-1"
                       >
                          Submit another report
                       </button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </motion.div>
          </div>
        )}
      </div>

      {/* Resolution Workspace Sidebar Drawer */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-screen w-[520px] bg-[#1b2235] border-l border-white/5 z-[201] flex flex-col shadow-2xl"
            >
               {/* Drawer Header */}
               <div className="p-10 border-b border-white/5">
                  <div className="flex justify-between items-center mb-10">
                    <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 group transition-all">
                       <span className="material-symbols-outlined opacity-40 group-hover:opacity-100 group-hover:translate-x-[-2px] transition-all">arrow_back</span>
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-20 group-hover:opacity-100">Back to Inbox</span>
                    </button>
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Internal Routing</p>
                       <p className="text-xs font-mono text-primary font-bold">#SIG-{selectedTicket.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>

                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-4 mb-10">
                     <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getPriorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</span>
                  </div>

                  {/* HIGH VISIBILITY STATUS CONTROL */}
                  <div className="bg-black/30 rounded-3xl p-6 border border-white/5">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4 text-center">Set Resolution Status</p>
                     <div className="flex gap-2">
                        {(['Open', 'Pending', 'Resolved'] as const).map(s => (
                          <button 
                            key={s}
                            onClick={() => handleUpdateStatus(s)}
                            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedTicket.status === s ? `${getStatusColor(s).replace('/10', '/100')} border-white/20 shadow-lg` : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100'}`}
                          >
                            {s}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Conversation Thread */}
               <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-black/10">
                  {/* Original Complaint */}
                  <div className="bg-[#0a0e1a] p-8 rounded-[2.5rem] border border-white/5 relative">
                     <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[#001a42] shadow-xl">
                        <span className="material-symbols-outlined text-sm">person</span>
                     </div>
                     <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Initial Report</p>
                        <p className="text-[9px] opacity-30 uppercase font-mono">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                     </div>
                     <p className="text-sm leading-relaxed opacity-80 font-medium">"{selectedTicket.description}"</p>
                  </div>

                  {/* Replies */}
                  {replies.map((reply) => (
                    <motion.div 
                      key={reply.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-8 rounded-[2.5rem] border ${reply.author === 'Engineering Support' ? 'bg-primary/5 border-primary/20 ml-12' : 'bg-white/5 border-white/10 mr-12'}`}
                    >
                       <div className="flex items-center gap-3 mb-4">
                          <div className={`w-2 h-2 rounded-full ${reply.author === 'Engineering Support' ? 'bg-primary' : 'bg-white/40'}`} />
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{reply.author}</p>
                       </div>
                       <p className="text-sm leading-relaxed opacity-80">{reply.message}</p>
                       <p className="text-[9px] opacity-30 mt-6 text-right uppercase font-mono">{new Date(reply.created_at).toLocaleTimeString()}</p>
                    </motion.div>
                  ))}
                  {replies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                       <span className="material-symbols-outlined text-4xl mb-4">chat_bubble</span>
                       <p className="italic text-xs font-bold uppercase tracking-widest">Awaiting Engineering Input</p>
                    </div>
                  )}
               </div>

               {/* Reply Compose Area */}
               <div className="p-10 bg-[#0a0e1a] border-t border-white/5">
                  <div className="relative">
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your official response..."
                      className="w-full h-32 bg-white/5 rounded-3xl border border-white/5 p-8 text-sm focus:ring-1 focus:ring-primary/40 outline-none resize-none transition-all placeholder:opacity-20 font-medium"
                    />
                    <div className="absolute bottom-6 right-6 flex items-center gap-4">
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-20">{replyText.length} Characters</p>
                       <button 
                         onClick={handleSendReply}
                         disabled={isSendingReply || !replyText.trim()}
                         className="bg-primary text-[#001a42] px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-primary/20"
                       >
                         {isSendingReply ? 'Transmitting...' : 'Transmit Reply'}
                       </button>
                    </div>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
