import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mb-12 scroll-mt-24">
    <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-6 pb-3 border-b border-white/10">{title}</h2>
    <div className="space-y-4 text-[15px] text-on-surface-variant leading-relaxed">{children}</div>
  </section>
)

const CookieRow = ({ name, type, purpose, retention, party }: { name: string; type: string; purpose: string; retention: string; party: string }) => (
  <tr className="border-t border-white/5 hover:bg-white/2 transition-colors">
    <td className="py-3 pr-4"><code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">{name}</code></td>
    <td className="py-3 pr-4 text-xs font-bold uppercase tracking-widest" style={{ color: type === 'Essential' ? '#34A853' : type === 'Analytics' ? '#2D8CFF' : type === 'Functional' ? '#f59e0b' : '#94a3b8' }}>{type}</td>
    <td className="py-3 pr-4 text-sm text-on-surface-variant">{purpose}</td>
    <td className="py-3 pr-4 text-xs text-on-surface-variant">{retention}</td>
    <td className="py-3 text-xs text-on-surface-variant">{party}</td>
  </tr>
)

const TOC = [
  { id: 'what',      label: 'What Are Cookies?' },
  { id: 'types',     label: 'Types of Cookies We Use' },
  { id: 'table',     label: 'Cookie Reference Table' },
  { id: 'why',       label: 'Why We Use Cookies' },
  { id: 'third',     label: 'Third-Party Cookies' },
  { id: 'manage',    label: 'Managing Your Cookies' },
  { id: 'retention', label: 'Data Retention' },
  { id: 'rights',    label: 'Your Rights' },
  { id: 'updates',   label: 'Policy Updates' },
  { id: 'contact',   label: 'Contact Us' },
]

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white font-body">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#001a42] text-sm">waves</span>
            </div>
            <span className="font-bold tracking-tight text-white">SIGNETRA</span>
          </Link>
          <div className="flex items-center gap-4 text-xs text-on-surface-variant">
            <Link to="/terms" className="hover:text-primary transition-colors font-medium">Terms of Service</Link>
            <Link to="/login" className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-bold transition-colors">Back to Login</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 flex gap-12">

        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 opacity-60">On This Page</p>
            <nav className="space-y-1">
              {TOC.map(item => (
                <a key={item.id} href={`#${item.id}`} className="block text-sm py-1.5 px-3 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Last Updated</p>
              <p className="text-xs text-on-surface-variant">18 May 2026</p>
              <p className="text-[10px] text-on-surface-variant mt-2 opacity-60">Version 1.0</p>
            </div>
            {/* Cookie type legend */}
            <div className="mt-6 p-4 bg-surface-container-high rounded-xl border border-white/5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3 opacity-60">Cookie Types</p>
              {[
                { type: 'Essential', color: '#34A853' },
                { type: 'Analytics', color: '#2D8CFF' },
                { type: 'Functional', color: '#f59e0b' },
                { type: 'Performance', color: '#94a3b8' },
              ].map(c => (
                <div key={c.type} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                  <span className="text-xs text-on-surface-variant">{c.type}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-12">
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3 block">Legal Document</span>
              <h1 className="text-5xl font-black tracking-tight mb-4">Cookie Policy</h1>
              <p className="text-on-surface-variant text-lg max-w-2xl">
                This Cookie Policy explains what cookies are, how Signetra uses them, and your choices regarding cookies. Reading this policy in full will help you understand our commitment to transparency.
              </p>
            </div>

            <Section id="what" title="1. What Are Cookies?">
              <p>Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and supply information to site owners.</p>
              <p>Cookies do not contain malware and cannot access other data on your device. They simply hold a small amount of data specific to you and the website, which can be accessed by either the web server or your device's browser.</p>
              <p>Similar technologies such as <strong className="text-white">localStorage</strong> and <strong className="text-white">sessionStorage</strong> serve analogous functions and are also covered by this policy. Signetra primarily uses browser localStorage for storing user preferences and session state.</p>
            </Section>

            <Section id="types" title="2. Types of Cookies We Use">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {[
                  {
                    type: 'Essential Cookies',
                    color: '#34A853',
                    icon: 'lock',
                    desc: 'These cookies are strictly necessary for the platform to function. They enable core features such as authentication (JWT tokens), session management, and security controls. The platform cannot function without them.',
                    required: true,
                  },
                  {
                    type: 'Functional Cookies',
                    color: '#f59e0b',
                    icon: 'settings',
                    desc: 'These cookies remember your preferences and settings — such as camera configuration, confidence thresholds, output mode, mirror view preference, and your legal consent status — to provide a personalized experience.',
                    required: false,
                  },
                  {
                    type: 'Analytics Cookies',
                    color: '#2D8CFF',
                    icon: 'analytics',
                    desc: 'These cookies help us understand how users interact with the platform — which features are most used, which gestures are commonly practiced, and how users navigate through the learning modules. Data is anonymized.',
                    required: false,
                  },
                  {
                    type: 'Performance Cookies',
                    color: '#94a3b8',
                    icon: 'speed',
                    desc: 'These cookies collect information about how the platform performs — WebSocket latency, AI model response times, and error rates. This helps us optimize the system for a smoother experience.',
                    required: false,
                  },
                ].map(c => (
                  <div key={c.type} className="p-5 bg-surface-container-high rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.color}20` }}>
                        <span className="material-symbols-outlined text-sm" style={{ color: c.color }}>{c.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{c.type}</h4>
                        {c.required && <span className="text-[9px] font-black uppercase tracking-widest text-rose-400">Always Active</span>}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="table" title="3. Cookie Reference Table">
              <p>Below is a detailed table of the specific storage keys and cookies used by Signetra:</p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-surface-container-high">
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Key / Cookie</th>
                      <th className="text-left py-3 pr-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Type</th>
                      <th className="text-left py-3 pr-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Purpose</th>
                      <th className="text-left py-3 pr-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Retention</th>
                      <th className="text-left py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Party</th>
                    </tr>
                  </thead>
                  <tbody>
                    <CookieRow name="signetra_token" type="Essential" purpose="Stores your JWT authentication token to keep you logged in securely" retention="30 days" party="1st Party" />
                    <CookieRow name="signetra_legal_consent" type="Essential" purpose="Records that you have accepted our Terms of Service and Cookie Policy" retention="Permanent" party="1st Party" />
                    <CookieRow name="signetra_profile" type="Functional" purpose="Caches your profile data (name, avatar, role) for fast page loads" retention="Session / Until logout" party="1st Party" />
                    <CookieRow name="signetra_settings" type="Functional" purpose="Stores your platform preferences (camera, confidence threshold, output mode, integration toggles)" retention="Permanent" party="1st Party" />
                    <CookieRow name="signetra_achievements" type="Analytics" purpose="Tracks local achievement and XP progress to reduce API calls" retention="Permanent" party="1st Party" />
                    <CookieRow name="signetra_history_*" type="Analytics" purpose="Stores your recent gesture recognition history (per-user, anonymized)" retention="Up to last 1000 entries" party="1st Party" />
                    <CookieRow name="sidebar-open" type="Functional" purpose="Remembers whether the navigation sidebar is expanded or collapsed" retention="Session" party="1st Party" />
                    <CookieRow name="vercel_*" type="Performance" purpose="Vercel platform analytics for deployment performance monitoring" retention="Session" party="3rd Party (Vercel)" />
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs opacity-60">* All Signetra-specific data is stored in browser <strong>localStorage</strong>, not as HTTP cookies. This means they cannot be transmitted to third parties by your browser automatically.</p>
            </Section>

            <Section id="why" title="4. Why We Use Cookies">
              <p>Signetra uses cookies and similar technologies for the following core purposes:</p>
              <ul className="list-none space-y-3 mt-3">
                {[
                  { icon: 'verified_user', title: 'Authentication & Security', desc: 'To verify your identity across sessions without requiring you to log in every time you visit. Your JWT token is essential for accessing protected API endpoints.' },
                  { icon: 'tune', title: 'Personalization', desc: 'To remember your individual preferences, settings, and configurations so your experience is tailored from the moment you log in.' },
                  { icon: 'trending_up', title: 'Progress Tracking', desc: 'To maintain your learning progress, XP points, badges, and gesture history across sessions.' },
                  { icon: 'insights', title: 'Platform Improvement', desc: 'Anonymized usage data helps us understand which features are valuable, identify bugs, and improve the AI recognition accuracy.' },
                  { icon: 'gavel', title: 'Legal Compliance', desc: 'To record your consent to our Terms of Service and Cookie Policy as required by applicable regulations.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 p-4 bg-surface-container-high rounded-xl border border-white/5">
                    <span className="material-symbols-outlined text-primary shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-bold text-white text-sm">{item.title}</p>
                      <p className="text-sm mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="third" title="5. Third-Party Cookies & Services">
              <p>Signetra integrates with the following third-party services which may set their own cookies or storage entries. We do not control these third-party cookies.</p>
              <div className="space-y-4 mt-4">
                {[
                  {
                    name: 'Google (Gmail API)',
                    purpose: 'Used for sending OTP verification emails during registration and login. Google may collect data per their Privacy Policy.',
                    link: 'https://policies.google.com/privacy',
                    color: '#34A853',
                  },
                  {
                    name: 'Vercel',
                    purpose: 'Our frontend hosting provider. Vercel may collect deployment telemetry and performance analytics.',
                    link: 'https://vercel.com/legal/privacy-policy',
                    color: '#ffffff',
                  },
                  {
                    name: 'Railway',
                    purpose: 'Our backend infrastructure provider. Railway hosts our API and WebSocket server.',
                    link: 'https://railway.app/legal/privacy',
                    color: '#9333ea',
                  },
                ].map(svc => (
                  <div key={svc.name} className="p-5 bg-surface-container-high rounded-xl border border-white/5 flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: svc.color }}></div>
                    <div>
                      <p className="font-bold text-white text-sm">{svc.name}</p>
                      <p className="text-sm text-on-surface-variant mt-1">{svc.purpose}</p>
                      <a href={svc.link} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">View Privacy Policy →</a>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="manage" title="6. Managing Your Cookies">
              <p><strong className="text-white">Browser Controls:</strong> Most browsers allow you to control cookies through their settings. You can set your browser to refuse cookies, delete existing cookies, or be notified when a cookie is being sent. Note that disabling essential cookies may prevent Signetra from functioning correctly.</p>
              <div className="mt-4 space-y-2">
                {[
                  { browser: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                  { browser: 'Mozilla Firefox', url: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer' },
                  { browser: 'Safari', url: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac' },
                  { browser: 'Microsoft Edge', url: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
                ].map(b => (
                  <a key={b.browser} href={b.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-surface-container-high rounded-xl border border-white/5 hover:border-primary/30 transition-colors group">
                    <span className="text-sm font-medium">{b.browser}</span>
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">Cookie Settings →</span>
                  </a>
                ))}
              </div>
              <p className="mt-4"><strong className="text-white">Clearing Signetra Data:</strong> To clear all Signetra-specific data from your browser, open DevTools → Application → Local Storage → signetra-ebon.vercel.app → and delete all entries. This will log you out and reset all preferences.</p>
              <p><strong className="text-white">Withdrawing Consent:</strong> You may withdraw your cookie consent at any time by clearing your browser's localStorage for our domain. Note that this may affect your ability to use certain features of the platform.</p>
            </Section>

            <Section id="retention" title="7. Data Retention">
              <p>We retain cookie and localStorage data for the following periods:</p>
              <ul className="list-none space-y-2 mt-3">
                {[
                  { item: 'Authentication tokens (signetra_token)', retention: '30 days from last login, or until logout' },
                  { item: 'User preferences and settings', retention: 'Until manually cleared or account deletion' },
                  { item: 'Gesture history records', retention: 'Up to 1,000 most recent entries (older entries are automatically pruned)' },
                  { item: 'Legal consent record (signetra_legal_consent)', retention: 'Permanently stored until browser data is cleared' },
                  { item: 'Session data (temporary storage)', retention: 'Until browser tab or session is closed' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <div>
                      <strong className="text-white text-sm">{item.item}:</strong>
                      <span className="text-sm ml-1">{item.retention}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="rights" title="8. Your Rights">
              <p>Depending on your location and applicable law, you may have the following rights regarding your cookie data and personal information:</p>
              <ul className="list-none space-y-3 mt-3">
                {[
                  { right: 'Right to Access', desc: 'Request a copy of the data we hold about you.' },
                  { right: 'Right to Rectification', desc: 'Request correction of inaccurate or incomplete data.' },
                  { right: 'Right to Erasure', desc: 'Request deletion of your personal data ("right to be forgotten").' },
                  { right: 'Right to Restriction', desc: 'Request that we restrict processing of your personal data.' },
                  { right: 'Right to Object', desc: 'Object to our processing of your data for analytics purposes.' },
                  { right: 'Right to Withdraw Consent', desc: 'Withdraw consent to cookies at any time by clearing your localStorage.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 p-4 bg-surface-container-high rounded-xl border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <div>
                      <p className="font-bold text-white text-sm">{item.right}</p>
                      <p className="text-sm text-on-surface-variant">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4">To exercise any of these rights, please contact us at <a href="mailto:signetracare@gmail.com" className="text-primary hover:underline">signetracare@gmail.com</a>. We will respond within 30 days.</p>
            </Section>

            <Section id="updates" title="9. Policy Updates">
              <p>We may update this Cookie Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes, we will update the "Last Updated" date at the top of this policy.</p>
              <p>If we make material changes that significantly affect how we use cookies or your privacy rights, we will display a prominent notice within the Signetra platform and, where feasible, notify you by email.</p>
              <p>We encourage you to review this policy periodically to stay informed about our cookie practices.</p>
            </Section>

            <Section id="contact" title="10. Contact Us">
              <p>If you have questions, concerns, or requests regarding this Cookie Policy, please contact us:</p>
              <div className="mt-4 p-6 bg-surface-container-high rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">mail</span>
                  <a href="mailto:signetracare@gmail.com" className="text-primary hover:underline font-medium">signetracare@gmail.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">language</span>
                  <span className="text-on-surface-variant">signetra-ebon.vercel.app</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <span className="text-on-surface-variant">Pune, Maharashtra, India</span>
                </div>
              </div>
            </Section>

            {/* Footer CTA */}
            <div className="mt-16 p-8 bg-primary/5 border border-primary/20 rounded-3xl text-center">
              <h3 className="text-xl font-black text-white mb-2">Clear and transparent.</h3>
              <p className="text-on-surface-variant text-sm mb-6">We only use cookies that are necessary to deliver a secure and functional experience.</p>
              <div className="flex justify-center gap-4">
                <Link to="/terms" className="px-6 py-3 border border-white/10 rounded-xl text-sm font-bold text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors">Terms of Service</Link>
                <Link to="/login" className="px-6 py-3 bg-primary text-[#001a42] rounded-xl text-sm font-black hover:bg-primary/90 transition-colors">Back to Login</Link>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
