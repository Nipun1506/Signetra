import React, { useState, useEffect, useRef } from 'react'

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'system' | 'achievement' | 'alert';
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Signetra!',
    message: 'Start by practicing your first sign language gestures in the Learn module.',
    time: new Date().toISOString(),
    read: false,
    type: 'system'
  },
  {
    id: '2',
    title: 'New Feature Available',
    message: 'Try the new Zoom integration for real-time translation during video calls.',
    time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: false,
    type: 'system'
  }
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load from local storage or set defaults
    const stored = localStorage.getItem('signetra_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(DEFAULT_NOTIFICATIONS);
      localStorage.setItem('signetra_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
    }

    // Handle clicking outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('signetra_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('signetra_notifications', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    return `${diffDays}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement': return 'emoji_events';
      case 'alert': return 'warning';
      default: return 'info';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'text-[#25D366] bg-[#25D366]/10';
      case 'alert': return 'text-error bg-error/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#c2c6d6] hover:text-white transition-colors flex items-center relative cursor-pointer"
        title="Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-error-container text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#0a0e1a]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 w-80 bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[400px]">
          <div className="px-4 py-3 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/50">
            <h3 className="font-bold text-on-surface text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] text-primary hover:underline font-medium uppercase tracking-wider cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-xs italic">
                You have no notifications.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/5">
                {notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).map(notification => (
                  <div 
                    key={notification.id} 
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-surface-container-highest/30 ${!notification.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getIconColor(notification.type)}`}>
                      <span className="material-symbols-outlined text-[16px]">{getIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-xs font-bold truncate pr-2 ${!notification.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-[9px] text-on-surface-variant whitespace-nowrap mt-0.5">
                          {formatTime(notification.time)}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-tight ${!notification.read ? 'text-on-surface-variant' : 'text-outline'}`}>
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
