import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '../config'

export interface HistoryEntry {
  id: string;
  time: string;
  gesture: string;
  icon: string;
  phrase: string;
  confidenceStr: string;
  platform: string;
  duration: string;
  status: 'high' | 'med' | 'low';
  rawConfidence: number;
}

export default function History() {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/history/all`);
        const data = await res.json();
        
        const mapped: HistoryEntry[] = data.map((item: any) => ({
          id: String(item.id),
          time: new Date(item.timestamp).toLocaleString(),
          gesture: item.phrase,
          icon: getIcon(item.phrase),
          phrase: item.phrase,
          confidenceStr: `${item.confidence}%`,
          platform: item.platform,
          duration: 'Real-time',
          status: item.confidence >= 90 ? 'high' : item.confidence >= 70 ? 'med' : 'low',
          rawConfidence: item.confidence
        }));
        
        setHistoryData(mapped);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };

    fetchHistory();
  }, []);

  const getIcon = (phrase: string) => {
    const iconMap: Record<string, string> = {
      'STOP': 'back_hand',
      'HELP': 'sports_mma',
      'YES': 'thumb_up',
      'NO': 'swipe_down',
      'HELLO': 'front_hand',
      'THANK YOU': 'pan_tool',
      'SORRY': 'sign_language',
      'I LOVE YOU': 'favorite',
      'PLEASE': 'volunteer_activism',
      'WATER': 'water_drop'
    };
    return iconMap[phrase.toUpperCase()] || 'gesture';
  };

  const handleExportCSV = () => {
    if (historyData.length === 0) return;

    const headers = ['Time', 'Gesture', 'Phrase', 'Confidence', 'Platform', 'Duration'];
    const rows = historyData.map(entry => [
      entry.time,
      entry.gesture,
      entry.phrase,
      entry.confidenceStr,
      entry.platform,
      entry.duration
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `signetra_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived Statistics
  const totalDetections = historyData.length

  const avgConfidence = totalDetections > 0 
    ? (historyData.reduce((acc, curr) => acc + (curr.rawConfidence || 0), 0) / totalDetections).toFixed(1)
    : 0

  // Find most used gesture using a frequency map
  const getMostUsed = () => {
    if (historyData.length === 0) return { gesture: "None", count: 0, icon: "front_hand" }
    
    const freq: Record<string, { count: number, icon: string }> = {}
    historyData.forEach(entry => {
      const g = entry.gesture
      if (!freq[g]) {
        freq[g] = { count: 0, icon: entry.icon }
      }
      freq[g].count += 1
    })

    let maxKey = ""
    let maxCount = -1
    for (const key in freq) {
      if (freq[key].count > maxCount) {
        maxCount = freq[key].count
        maxKey = key
      }
    }
    
    return {
      gesture: maxKey,
      count: maxCount,
      icon: freq[maxKey].icon
    }
  }

  const mostUsed = getMostUsed()

  // Pagination states
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.max(1, Math.ceil(totalDetections / itemsPerPage))
  
  const currentEntries = historyData.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="pt-24 pb-12 px-10 w-full font-body">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-on-surface">Detection History</h2>
            <p className="text-on-surface-variant mt-1 italic">Review and audit your past sign language interactions.</p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-primary text-[#001a42] px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            disabled={historyData.length === 0}
          >
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
        </header>

        {/* Summary Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between border border-outline-variant/10 shadow-xl shadow-blue-500/5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Total Detections</span>
              <h3 className="text-4xl font-extrabold mt-2 text-on-surface">
                {totalDetections.toLocaleString()}
              </h3>
            </div>
            <div className="mt-4 text-sm text-on-surface-variant flex items-center gap-1">
              {totalDetections > 0 ? (
                <><span className="text-[#25D366] font-bold">LIVE</span> capturing active</>
              ) : (
                <span className="italic">No detections yet</span>
              )}
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between border border-outline-variant/10 shadow-xl shadow-blue-500/5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Avg Confidence</span>
              <h3 className="text-4xl font-extrabold mt-2 text-on-surface">{avgConfidence}%</h3>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Number(avgConfidence))}%` }}
                className="bg-primary h-full"
              ></motion.div>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between border border-outline-variant/10 shadow-xl shadow-blue-500/5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Most Used Gesture</span>
              <div className="flex items-center gap-3 mt-2">
                <span className="material-symbols-outlined text-4xl text-primary">{mostUsed.icon}</span>
                <h3 className="text-3xl font-extrabold text-on-surface capitalize">{mostUsed.gesture}</h3>
              </div>
            </div>
            <div className="mt-4 text-sm text-on-surface-variant italic">{mostUsed.count} occurrences</div>
          </div>
        </section>

        {/* Data Table */}
        <section className="bg-[#1b1f2c]/40 rounded-2xl overflow-hidden border border-outline-variant/10 backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant uppercase text-[10px] font-bold tracking-[0.1em]">
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Gesture</th>
                <th className="px-6 py-4">Output Phrase</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant italic">
                    No history recorded. Visit the Practice or Recognize modules to start mapping gestures.
                  </td>
                </tr>
              ) : (
                currentEntries.map((row, idx) => (
                  <tr key={row.id || idx} className="bg-surface-container-lowest/20 hover:bg-surface-container-high/40 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{row.time}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">{row.icon}</span>
                        <span className="text-sm font-semibold text-white capitalize">{row.gesture}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm italic text-on-surface-variant">{row.phrase}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        row.status === 'high' ? 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20' :
                        row.status === 'med' ? 'bg-primary/10 text-primary border-primary/20' :
                        'bg-error-container text-error border-error/20'
                      }`}>
                        {row.confidenceStr}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{row.platform}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{row.duration}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {totalDetections > 0 && (
            <div className="px-6 py-4 flex justify-between items-center text-sm border-t border-outline-variant/10">
              <span className="text-on-surface-variant italic text-xs">
                Showing {((page - 1) * itemsPerPage) + 1}-{Math.min(page * itemsPerPage, totalDetections)} of {totalDetections.toLocaleString()} total detections
              </span>
              <div className="flex gap-2 text-xs font-bold">
                 <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-surface-container-high hover:bg-primary hover:text-[#001a42] disabled:opacity-50 disabled:hover:bg-surface-container-high disabled:hover:text-white px-3 py-1.5 rounded transition-all"
                 >
                   Previous
                 </button>
                 <button className="bg-primary text-[#001a42] px-3 py-1.5 rounded transition-all">
                   {page} / {totalPages}
                 </button>
                 <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-surface-container-high hover:bg-primary hover:text-[#001a42] disabled:opacity-50 disabled:hover:bg-surface-container-high disabled:hover:text-white px-3 py-1.5 rounded transition-all"
                 >
                   Next
                 </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
