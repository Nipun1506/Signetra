import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const DEFAULT_SETTINGS = {
  mirrorView: true,
  confidenceThreshold: 75,
  outputMode: 'both',
  zoomBridge: true,
  whatsAppWeb: false,
  sourceDevice: 'default',
  outputResolution: '720p'
};

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('signetra_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const initDevices = async () => {
      try {
        // Request temporary access to get labels
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const devs = await navigator.mediaDevices.enumerateDevices();
        setDevices(devs.filter(d => d.kind === 'videoinput'));
        // Stop the temporary stream
        stream.getTracks().forEach(t => t.stop());
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };
    initDevices();
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('signetra_settings', JSON.stringify(settings));
    setHasChanges(false);
    alert('Settings saved successfully!');
  };

  const resetDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('signetra_settings', JSON.stringify(DEFAULT_SETTINGS));
      setHasChanges(false);
    }
  };

  return (
    <div className="pt-24 pb-12 px-8 md:px-12 w-full font-body">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-2 block">System Configuration</span>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Settings</h2>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={resetDefaults}
              className="px-6 py-2 rounded-full border border-outline-variant/20 text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-all"
            >
              Reset Default
            </button>
            <button 
              onClick={saveSettings}
              className={`px-8 py-2 rounded-full text-[#001a42] text-sm font-bold shadow-lg transition-all ${
                hasChanges 
                  ? 'bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-surface-container-highest opacity-50 cursor-not-allowed'
              }`}
              disabled={!hasChanges}
            >
              Save Changes
            </button>
          </div>
        </header>

        {/* Settings Grid */}
        <div className="space-y-8 pb-20">
          {/* Camera Section */}
          <section className="bg-surface-container-low rounded-[1.5rem] p-8 border border-outline-variant/10 shadow-xl shadow-blue-500/5">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary">photo_camera</span>
              <h3 className="text-xl font-bold tracking-tight text-white">Camera Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Source Device</label>
                  <select 
                    value={settings.sourceDevice}
                    onChange={(e) => updateSetting('sourceDevice', e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-xl text-on-surface p-3 focus:ring-2 focus:ring-primary/30 appearance-none text-sm transition-all hover:bg-surface-container-high cursor-pointer"
                  >
                    <option value="default">Default System Camera</option>
                    {devices.map(dev => (
                      <option key={dev.deviceId} value={dev.deviceId}>{dev.label || `Camera ${dev.deviceId.slice(0, 5)}`}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Output Resolution</label>
                  <select 
                    value={settings.outputResolution}
                    onChange={(e) => updateSetting('outputResolution', e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-xl text-on-surface p-3 focus:ring-2 focus:ring-primary/30 appearance-none text-sm transition-all hover:bg-surface-container-high cursor-pointer"
                  >
                    <option value="1080p">1080p (1920x1080) @ 60fps</option>
                    <option value="720p">720p (1280x720) @ 60fps</option>
                    <option value="480p">480p (640x480) @ 30fps</option>
                  </select>
                </div>
                 <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant/5">
                  <div>
                    <span className="block text-sm font-semibold text-white">Mirror View</span>
                    <span className="text-xs text-on-surface-variant italic">Flip video horizontally</span>
                  </div>
                  <div 
                    onClick={() => updateSetting('mirrorView', !settings.mirrorView)}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${settings.mirrorView ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.mirrorView ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>
               <div className="md:col-span-7">
                <div className="relative w-full aspect-video rounded-[1rem] overflow-hidden bg-surface-container-lowest group border border-outline-variant/10 shadow-2xl">
                  <img 
                    className={`w-full h-full object-cover opacity-60 grayscale-[0.2] transition-transform duration-500 ${settings.mirrorView ? '-scale-x-100' : ''}`} 
                    alt="Workspace preview" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY0BNQZy2cIXiwMyF4jxVL0Yllw90Ff6GLOMiejDxmH8CWaX9Ym9CqIqK05QwGkkf8FJF6hHZ_GRhpm9dfZ_5QvtySqRZMMRvb5OPCEC9gEN90XRU3_hSTfUu5JyKeskQHV7ju07Y0fJm0uxbsY75x-yTaIge4xrk_VtNRdr-zNvn66h56Muv7z0APhWzZkpthoCF1k5FzlAD5DZpWmK6Mm1txQ1fcZeS1gX5RjQNS2Kt8UF6XzqfWd95XrFi7gvEqNcmCgDF7dzc"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-500/80 backdrop-blur-md rounded-full">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recognition Settings */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface-container-low rounded-[1.5rem] p-8 border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary">gesture</span>
                <h3 className="text-xl font-bold tracking-tight text-white">Recognition</h3>
              </div>
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    <label>Confidence Threshold</label>
                    <span className="text-primary">{settings.confidenceThreshold}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="99" 
                    className="w-full accent-primary bg-surface-container-highest h-2 rounded-lg" 
                    value={settings.confidenceThreshold} 
                    onChange={(e) => updateSetting('confidenceThreshold', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    <label>Default Output Mode</label>
                  </div>
                  <div className="flex bg-surface-container rounded-xl p-1 gap-1">
                    {[
                      { id: 'text', label: 'Text' },
                      { id: 'speech', label: 'Speech' },
                      { id: 'both', label: 'Both' }
                    ].map(m => (
                      <button 
                        key={m.id}
                        onClick={() => updateSetting('outputMode', m.id)}
                        className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${
                          settings.outputMode === m.id 
                            ? 'bg-primary text-[#001a42] shadow-md' 
                            : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-[1.5rem] p-8 border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary">hub</span>
                <h3 className="text-xl font-bold tracking-tight text-white">Integrations</h3>
              </div>
               <div className="space-y-4">
                {[
                  { id: 'zoomBridge', name: 'Zoom Bridge', icon: 'videocam', color: '#2D8CFF' },
                  { id: 'whatsAppWeb', name: 'WhatsApp Web', icon: 'chat', color: '#25D366' }
                ].map((int) => (
                  <div key={int.id} className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined" style={{ color: int.color }}>{int.icon}</span>
                      <span className="text-sm font-semibold text-white">{int.name}</span>
                    </div>
                    <div 
                      onClick={() => updateSetting(int.id, !settings[int.id as keyof typeof settings])}
                      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${settings[int.id as keyof typeof settings] ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings[int.id as keyof typeof settings] ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
