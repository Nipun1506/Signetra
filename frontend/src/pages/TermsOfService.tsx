import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mb-12 scroll-mt-24">
    <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-6 pb-3 border-b border-white/10">{title}</h2>
    <div className="space-y-4 text-[15px] text-on-surface-variant leading-relaxed">{children}</div>
  </section>
)

const TOC = [
  { id: 'acceptance',  label: 'Acceptance of Terms' },
  { id: 'service',     label: 'Description of Service' },
  { id: 'accounts',   label: 'User Accounts' },
  { id: 'acceptable', label: 'Acceptable Use' },
  { id: 'ip',         label: 'Intellectual Property' },
  { id: 'ai',         label: 'AI & Machine Learning' },
  { id: 'data',       label: 'Data & Privacy' },
  { id: 'disclaimer', label: 'Disclaimers' },
  { id: 'liability',  label: 'Limitation of Liability' },
  { id: 'termination',label: 'Termination' },
  { id: 'changes',    label: 'Changes to Terms' },
  { id: 'contact',    label: 'Contact Us' },
]

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState('')

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
            <Link to="/cookies" className="hover:text-primary transition-colors font-medium">Cookie Policy</Link>
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
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm py-1.5 px-3 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Last Updated</p>
              <p className="text-xs text-on-surface-variant">18 May 2026</p>
              <p className="text-[10px] text-on-surface-variant mt-2 opacity-60">Version 1.0</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-12">
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3 block">Legal Document</span>
              <h1 className="text-5xl font-black tracking-tight mb-4">Terms of Service</h1>
              <p className="text-on-surface-variant text-lg max-w-2xl">
                Please read these Terms of Service carefully before using the Signetra platform. By accessing or using our service, you agree to be bound by these terms.
              </p>
              <div className="flex items-center gap-3 mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="material-symbols-outlined text-amber-400">warning</span>
                <p className="text-sm text-amber-300 font-medium">You must accept these terms to use Signetra. If you do not agree, you may not access the platform.</p>
              </div>
            </div>

            <Section id="acceptance" title="1. Acceptance of Terms">
              <p>By creating an account, accessing, or using Signetra (referred to as "the Platform," "our Service," or "SIGNETRA"), you confirm that you are at least 13 years of age and have the legal capacity to enter into a binding contract.</p>
              <p>If you are accessing the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these Terms. These Terms constitute a legally binding agreement between you and Team Signetra ("we," "us," or "our").</p>
              <p>Your continued use of the Platform after any changes to these Terms constitutes your acceptance of the revised terms. We recommend checking this page periodically for updates.</p>
            </Section>

            <Section id="service" title="2. Description of Service">
              <p>Signetra is an AI-powered sign language recognition and translation platform. Our services include, but are not limited to:</p>
              <ul className="list-none space-y-2 mt-3">
                {[
                  'Real-time American Sign Language (ASL) gesture recognition via webcam',
                  'Live gesture-to-text subtitle injection into supported video conferencing platforms (Zoom, Google Meet, Microsoft Teams)',
                  'Interactive sign language learning modules and practice sessions',
                  'User progress tracking, achievement systems, and performance analytics',
                  'Administrative support ticketing and technical assistance',
                  'Chrome Extension for video call overlay integration',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4">Signetra is provided on an "as-is" and "as-available" basis. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.</p>
            </Section>

            <Section id="accounts" title="3. User Accounts">
              <p><strong className="text-white">Registration:</strong> To access core features, you must register for an account using a valid email address and complete OTP email verification. You agree to provide accurate, current, and complete information during registration.</p>
              <p><strong className="text-white">Security:</strong> You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify us at <a href="mailto:signetracare@gmail.com" className="text-primary hover:underline">signetracare@gmail.com</a> of any unauthorized use of your account.</p>
              <p><strong className="text-white">Account Types:</strong> Signetra offers Standard User and Administrator account roles. Role-based access controls restrict certain features. Misuse of elevated privileges constitutes a material breach of these Terms.</p>
              <p><strong className="text-white">Age Requirement:</strong> You must be at least 13 years old to use Signetra. Users under 18 require parental or guardian consent. We do not knowingly collect data from children under 13.</p>
              <p><strong className="text-white">One Account Per Person:</strong> Creating multiple accounts to circumvent restrictions is prohibited and may result in permanent suspension of all associated accounts.</p>
            </Section>

            <Section id="acceptable" title="4. Acceptable Use Policy">
              <p>You agree to use Signetra only for lawful purposes and in ways that do not infringe the rights of others. You expressly agree NOT to:</p>
              <ul className="list-none space-y-2 mt-3">
                {[
                  'Attempt to reverse-engineer, decompile, or extract the AI models, source code, or algorithms powering Signetra',
                  'Use the platform to collect, harvest, or store personal data about other users without their consent',
                  'Transmit any malware, viruses, or malicious code through the platform',
                  'Attempt unauthorized access to any part of the system, including administrative panels or backend services',
                  'Use automated scripts, bots, or scrapers to interact with Signetra',
                  'Impersonate any person or entity, or misrepresent your affiliation with any person or entity',
                  'Use the platform in any jurisdiction where its use would be illegal',
                  'Engage in any activity that disrupts, degrades, or impairs the performance of the Service',
                  'Share, sublicense, or resell access to Signetra without express written permission',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-rose-400 text-sm mt-0.5">cancel</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="ip" title="5. Intellectual Property">
              <p><strong className="text-white">Ownership:</strong> All content, features, and functionality of Signetra — including but not limited to the source code, AI models, gesture recognition algorithms, user interface designs, text, graphics, logos, and icons — are the exclusive intellectual property of Team Signetra and are protected by international copyright, trademark, and other intellectual property laws.</p>
              <p><strong className="text-white">Limited License:</strong> Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for your personal, non-commercial purposes.</p>
              <p><strong className="text-white">User Content:</strong> Gesture data captured during your sessions is processed in real-time. We do not store raw video footage. Aggregated, anonymized gesture recognition data may be used to improve our AI models.</p>
              <p><strong className="text-white">Feedback:</strong> Any feedback, suggestions, or ideas you submit to us may be used by us without any obligation to you, and you waive any claims relating to such use.</p>
            </Section>

            <Section id="ai" title="6. AI & Machine Learning">
              <p><strong className="text-white">AI-Powered Recognition:</strong> Signetra uses machine learning models trained on sign language datasets to recognize gestures. The accuracy of recognition varies based on environmental conditions, camera quality, lighting, and hand positioning.</p>
              <p><strong className="text-white">No Medical Use:</strong> Signetra is NOT a medical device or accessibility tool approved for clinical use. It must not be used as a substitute for professional sign language interpreters in critical situations such as medical appointments, legal proceedings, or emergency communications.</p>
              <p><strong className="text-white">AI Limitations:</strong> Our AI systems may occasionally misclassify gestures or fail to recognize signs. We are continuously improving our models. You acknowledge these limitations and agree not to rely solely on Signetra for critical communications.</p>
              <p><strong className="text-white">Model Improvement:</strong> Anonymized, aggregated interaction data (not personal identifiers or video) may be used to train and improve our recognition models. You may opt out by contacting us at <a href="mailto:signetracare@gmail.com" className="text-primary hover:underline">signetracare@gmail.com</a>.</p>
            </Section>

            <Section id="data" title="7. Data & Privacy">
              <p>Your privacy is important to us. Our use of your personal data is governed by our <Link to="/cookies" className="text-primary hover:underline font-medium">Cookie Policy</Link> and applicable data protection laws including GDPR (for EU residents) and applicable Indian privacy regulations.</p>
              <p><strong className="text-white">Data We Collect:</strong> Name, email address, age, gender (optional), gesture session metadata, achievement progress, and usage analytics. We do not sell your personal data to third parties.</p>
              <p><strong className="text-white">Data Retention:</strong> Your account data is retained as long as your account is active. You may request deletion of your data at any time by contacting us.</p>
              <p><strong className="text-white">Third-Party Services:</strong> We use Google OAuth2 for email-based OTP delivery, Railway for backend hosting, and Vercel for frontend deployment. These services have their own privacy policies.</p>
              <p><strong className="text-white">WebSocket Data:</strong> During recognition sessions, frame data is transmitted over a secure WebSocket connection to our AI backend. Frame data is processed in real-time and not permanently stored.</p>
            </Section>

            <Section id="disclaimer" title="8. Disclaimers">
              <p>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY.</p>
              <p>We do not warrant that: (a) the Service will be uninterrupted or error-free; (b) defects will be corrected; (c) the Service or the servers that make it available are free of viruses or other harmful components; or (d) the results of using the Service will meet your requirements.</p>
              <p>Sign language recognition accuracy is not guaranteed. Signetra is a learning and communication aid, not a certified accessibility or translation service.</p>
            </Section>

            <Section id="liability" title="9. Limitation of Liability">
              <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, TEAM SIGNETRA AND ITS FOUNDERS, DEVELOPERS, OFFICERS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:</p>
              <ul className="list-none space-y-2 mt-3">
                {[
                  'Your access to or use of (or inability to access or use) the Service',
                  'Any conduct or content of any third party on the Service',
                  'Unauthorized access, use, or alteration of your transmissions or content',
                  'Any errors or inaccuracies in the AI gesture recognition output',
                  'Loss of data resulting from delays, non-deliveries, or service interruptions',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4">IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE AMOUNT YOU PAID TO USE THE SERVICE (IF ANY) IN THE TWELVE MONTHS PRIOR TO THE CLAIM, OR INR 1,000, WHICHEVER IS GREATER.</p>
            </Section>

            <Section id="termination" title="10. Termination">
              <p><strong className="text-white">By You:</strong> You may terminate your account at any time by contacting us at <a href="mailto:signetracare@gmail.com" className="text-primary hover:underline">signetracare@gmail.com</a>. Upon termination, your right to use the Service will immediately cease.</p>
              <p><strong className="text-white">By Us:</strong> We reserve the right to suspend or terminate your account immediately, without notice, if we determine in our sole discretion that you have violated these Terms, engaged in fraudulent activity, or pose a risk to the security or integrity of the platform.</p>
              <p><strong className="text-white">Effect of Termination:</strong> Upon termination, your license to use Signetra is revoked. Provisions that by their nature should survive termination (including intellectual property, disclaimers, and limitation of liability) shall survive.</p>
            </Section>

            <Section id="changes" title="11. Changes to Terms">
              <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by displaying a prominent notice within the Platform or by sending an email to your registered address.</p>
              <p>Your continued use of Signetra after the effective date of revised Terms constitutes your acceptance. If you do not agree to the changes, you must discontinue use of the Platform.</p>
              <p>The date at the top of this page indicates when these Terms were last updated.</p>
            </Section>

            <Section id="contact" title="12. Contact Us">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
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
              <h3 className="text-xl font-black text-white mb-2">Ready to get started?</h3>
              <p className="text-on-surface-variant text-sm mb-6">By using Signetra, you agree to these Terms of Service and our Cookie Policy.</p>
              <div className="flex justify-center gap-4">
                <Link to="/cookies" className="px-6 py-3 border border-white/10 rounded-xl text-sm font-bold text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors">Cookie Policy</Link>
                <Link to="/login" className="px-6 py-3 bg-primary text-[#001a42] rounded-xl text-sm font-black hover:bg-primary/90 transition-colors">Back to Login</Link>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
