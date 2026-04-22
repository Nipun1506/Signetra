import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'

interface Stats {
  gestures_today: number;
  total_learned: number;
  active_sessions: number;
  accuracy_rate: number;
}

interface Activity {
  id: number;
  phrase: string;
  confidence: number;
  category: string;
  platform: string;
  timestamp: string;
}

export const Home = () => {
  const [stats, setStats] = useState<Stats>({
    gestures_today: 0,
    total_learned: 0,
    active_sessions: 0,
    accuracy_rate: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/stats`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/history/recent`);
        const data = await res.json();
        setActivities(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };

    fetchStats();
    fetchHistory();

    // Poll every 5 seconds for live updates
    const interval = setInterval(() => {
      fetchStats();
      fetchHistory();
    }, 5000);

    return () => clearInterval(interval);
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

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    return `${diffMins} mins ago`;
  };

  return (
    <div className="pt-24 pb-12 px-10 min-h-screen w-full">
      {/* Hero Section: Asymmetrical Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-6xl font-extrabold text-on-background tracking-tighter leading-none">
            Welcome to <span className="text-primary">SIGNETRA</span>
          </h2>
          <p className="text-xl text-on-surface-variant max-w-xl font-light">
            Real-time sign language recognition for everyone. Bridging the gap between sound and silence with advanced AI curation.
          </p>
          <div className="flex gap-4 pt-4">
            <Link to="/recognize">
              <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold tracking-wide hover:scale-105 active:opacity-80 transition-all">
                Start Recognizing
              </button>
            </Link>
            <Link to="/learn">
              <button className="border border-outline-variant hover:bg-surface-container-high text-primary px-8 py-4 rounded-xl font-bold tracking-wide transition-all">
                Learn Signs
              </button>
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 relative group">
          <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <img alt="Sign Language Illustration" className="relative z-10 w-full aspect-square object-contain drop-shadow-[0_0_30px_rgba(173,198,255,0.3)]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKOSXCrp-hwsEVlYjUc1XFIndviPiV6-iUkc11S4IAc-wylf2yNH4L-bl1rNQIxk2Q_06nExynsJeGJPwWv4O2ilzZWWJbUQWfA6jtPWmoXl6TgkQY3OO0qbnR9Tx9JoNBxFJeoqWCsN3T6PuPUHDQiL4qFYf63Y4D_JFR7DQW_2MPY3x7dGHRFG3WoVNHAzuXNx5oeAOlKQ4aGv9h5UnDnafSRfmoGt5-ienELwl-1GsUTWoaact4d54tRKvaubgjAiHj6aOzdaE" />
        </div>
      </section>

      {/* Stats Grid: Tonal Layering */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-surface-container-low p-6 rounded-xl border-l-2 border-primary/20 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-primary mb-4 block">gesture</span>
          <div className="text-3xl font-bold text-on-surface leading-none mb-2">{stats.gestures_today}</div>
          <div className="text-sm font-medium text-on-surface-variant tracking-wider uppercase">Gestures Recognized Today</div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border-l-2 border-primary/20 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-primary mb-4 block">book</span>
          <div className="text-3xl font-bold text-on-surface leading-none mb-2">{stats.total_learned}</div>
          <div className="text-sm font-medium text-on-surface-variant tracking-wider uppercase">Total Signs Learned</div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border-l-2 border-primary/20 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-primary mb-4 block">sensors</span>
          <div className="text-3xl font-bold text-on-surface leading-none mb-2">{stats.active_sessions}</div>
          <div className="text-sm font-medium text-on-surface-variant tracking-wider uppercase">Active Sessions</div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border-l-2 border-primary/20 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-primary mb-4 block">leaderboard</span>
          <div className="text-3xl font-bold text-on-surface leading-none mb-2">{stats.accuracy_rate}%</div>
          <div className="text-sm font-medium text-on-surface-variant tracking-wider uppercase">Accuracy Rate</div>
        </div>
      </section>

      {/* Quick Access: Bento Grid Inspired */}
      <section className="mb-16">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-on-background">Quick Access</h3>
          <a className="text-primary text-sm font-semibold hover:underline" href="#">View All Features</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/recognize">
            <div className="group cursor-pointer relative overflow-hidden rounded-xl bg-surface-container-high border-b-4 border-primary p-8 transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-12">
                <div className="bg-primary-container/20 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-primary text-3xl">camera</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_outward</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Live Recognition</h4>
              <p className="text-on-surface-variant text-sm">Instant translation from camera feed to text and audio.</p>
            </div>
          </Link>
          <Link to="/learn">
            <div className="group cursor-pointer relative overflow-hidden rounded-xl bg-surface-container-high border-b-4 border-tertiary-container p-8 transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-12">
                <div className="bg-tertiary-container/20 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-tertiary text-3xl">menu_book</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-tertiary transition-colors">arrow_outward</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Learning Module</h4>
              <p className="text-on-surface-variant text-sm">Interactive curriculum to master ASL and regional sign languages.</p>
            </div>
          </Link>
          <Link to="/zoom">
            <div className="group cursor-pointer relative overflow-hidden rounded-xl bg-surface-container-high border-b-4 border-[#4ADE80] p-8 transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-12">
                <div className="bg-[#4ADE80]/10 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-[#4ADE80] text-3xl">video_call</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-[#4ADE80] transition-colors">arrow_outward</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Video Call Overlay</h4>
              <p className="text-on-surface-variant text-sm">Seamless integration for Zoom, Teams, and WhatsApp Web.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Activity Feed: Editorial Style */}
      <section className="max-w-4xl">
        <h3 className="text-2xl font-bold tracking-tight text-on-background mb-8">Recent Activity</h3>
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="divide-y divide-outline-variant/10">
            {activities.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant italic">
                No recent activity. Start recognizing to see your log here!
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center gap-6 hover:bg-surface-container transition-colors">
                  <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{getIcon(activity.phrase)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-on-surface font-semibold text-lg">"{activity.phrase}"</div>
                    <div className="text-on-surface-variant text-xs">
                      Detected {getTimeAgo(activity.timestamp)} • {activity.platform}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                    {activity.confidence}% Conf.
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
