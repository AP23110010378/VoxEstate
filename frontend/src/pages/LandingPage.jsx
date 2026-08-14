import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  PhoneCall, CheckCircle2, ArrowRight, Building2,
  BarChart, ShieldCheck, Sparkles, Mic, Brain,
  Users, TrendingUp, Headphones
} from 'lucide-react';

/* ---- Reusable: Reveal on scroll ---- */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage({ onEnterDashboard }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      // Track which section is active for nav highlights
      const sections = ['hero', 'features', 'how-it-works', 'stats', 'cta'];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 300) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Results', href: '#stats' },
  ];

  const features = [
    {
      icon: PhoneCall,
      title: 'Instant Outreach',
      desc: 'AI agents call your property leads the second you click Launch. No more cold call burnout.',
      accent: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
    {
      icon: Brain,
      title: 'AI Qualification',
      desc: 'Each conversation is analyzed in real-time. Leads are tagged as Buyer, Seller, or Not Interested.',
      accent: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      icon: Building2,
      title: 'Multi-Agency',
      desc: 'Manage Sunrise Realty, Urban Nest, and more from one platform. Each gets their own AI persona.',
      accent: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    {
      icon: BarChart,
      title: 'Live Dashboard',
      desc: 'Watch call statuses flip from Pending to Qualified in real-time as conversations finish.',
      accent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
  ];

  const steps = [
    {
      title: 'Upload Your Lead List',
      desc: 'Import contacts from your CRM or add them manually. Each lead gets a profile in the system.',
    },
    {
      title: 'Choose Your Agency',
      desc: 'Pick which real estate branch runs the campaign. The AI adopts that agency\'s custom persona.',
    },
    {
      title: 'Launch the Campaign',
      desc: 'One click. The AI dials each lead, holds a natural conversation about their property interests.',
    },
    {
      title: 'Review Qualified Leads',
      desc: 'Check transcripts, see who\'s interested, and focus your human agents on warm prospects only.',
    },
  ];

  return (
    <div className="relative w-full overflow-hidden mesh-gradient">

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="orb orb-gold"></div>
        <div className="orb orb-teal"></div>
        <div className="orb orb-navy"></div>
        <div className="grid-bg"></div>
      </div>

      {/* ===== NAVBAR ===== */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[var(--color-navy-950)]/85 backdrop-blur-2xl border-b border-white/5 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--color-gold-500)] to-[var(--color-gold-400)] shadow-lg shadow-[var(--color-gold-500)]/20 group-hover:shadow-[var(--color-gold-500)]/40 transition-shadow">
              <Mic size={22} className="text-[var(--color-navy-950)]" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-[var(--color-text-primary)]">
              Prop<span className="gradient-text">Voice</span>
            </span>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`nav-link text-sm ${
                  activeSection === link.href.slice(1) ? 'text-[var(--color-gold-400)]' : ''
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onEnterDashboard}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-[var(--color-text-primary)] hover:bg-[var(--color-gold-500)]/10 hover:border-[var(--color-gold-500)]/30 hover:text-[var(--color-gold-400)] transition-all cursor-pointer"
          >
            Open Dashboard
          </button>
        </div>
      </motion.nav>

      {/* ===== HERO ===== */}
      <section id="hero" className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <Reveal>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[var(--color-gold-500)]/8 border border-[var(--color-gold-500)]/15 text-[var(--color-gold-400)] font-medium text-sm mb-10 backdrop-blur-sm">
            <Sparkles size={16} />
            AI-Powered Real Estate Lead Qualification
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold font-display tracking-tight leading-[1.05] mb-8 max-w-5xl">
            Your leads called.
            <br />
            <span className="gradient-text">They're qualified.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mb-14 leading-relaxed">
            PropVoice uses conversational AI to call, engage, and qualify your property leads automatically — so your agents only talk to people who are ready to buy or sell.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-5">
            <button onClick={onEnterDashboard} className="cta-button group cursor-pointer">
              Launch Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-xl text-[var(--color-text-primary)] font-semibold border border-white/10 hover:border-[var(--color-gold-500)]/30 hover:bg-white/[0.03] transition-all flex items-center justify-center gap-2"
            >
              See How It Works
            </a>
          </div>
        </Reveal>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-white/15 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-400)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative z-10 py-28 md:py-36">
        <div className="page-container">
          <Reveal>
            <div className="text-center mb-20">
              <div className="section-line mx-auto mb-6"></div>
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-5">
                Built for modern agencies
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
                Everything your real estate team needs to scale outreach without scaling headcount.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.08} className="h-full">
                <div className="glass-card p-8 h-full">
                  <div className={`feature-icon border ${f.accent} mb-7`}>
                    <f.icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold font-display mb-3">{f.title}</h3>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="relative z-10 py-28 md:py-36">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            {/* Left — Steps */}
            <div>
              <Reveal>
                <div className="section-line mb-6"></div>
                <h2 className="text-4xl md:text-5xl font-bold font-display mb-5">
                  From cold list to<br />warm handshake.
                </h2>
                <p className="text-[var(--color-text-secondary)] text-lg mb-14 leading-relaxed max-w-lg">
                  Our agentic pipeline connects Vapi voice AI with LangGraph orchestration to handle every call intelligently.
                </p>
              </Reveal>

              <div className="space-y-8">
                {steps.map((step, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div className="flex gap-5 group">
                      <div className="step-number group-hover:bg-[var(--color-gold-500)]/15 group-hover:border-[var(--color-gold-500)]/30 transition-all">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold font-display mb-1.5 group-hover:text-[var(--color-gold-400)] transition-colors">
                          {step.title}
                        </h4>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Right — Tech Card */}
            <Reveal delay={0.2}>
              <div className="glass-card p-10 lg:p-12 border-[var(--color-gold-500)]/10 sticky top-32">
                {/* Architecture visual */}
                <div className="space-y-5 mb-10">
                  {[
                    { icon: Mic, label: 'Vapi Voice AI', sub: 'Natural phone conversations', color: 'text-teal-400 bg-teal-500/10' },
                    { icon: Brain, label: 'LangGraph Agent', sub: 'Orchestrates the call pipeline', color: 'text-amber-400 bg-amber-500/10' },
                    { icon: Headphones, label: 'Groq LLM', sub: 'Classifies lead transcripts', color: 'text-violet-400 bg-violet-500/10' },
                    { icon: BarChart, label: 'React Dashboard', sub: 'Real-time campaign monitoring', color: 'text-rose-400 bg-rose-500/10' },
                  ].map((tech, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[var(--color-gold-500)]/15 transition-all"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tech.color}`}>
                        <tech.icon size={22} />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--color-text-primary)] text-sm">{tech.label}</div>
                        <div className="text-xs text-[var(--color-text-secondary)]">{tech.sub}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

                <p className="text-center text-[var(--color-text-secondary)] text-sm mb-6">
                  End-to-end automated. Zero manual dialing.
                </p>
                <button
                  onClick={onEnterDashboard}
                  className="w-full cta-button justify-center cursor-pointer"
                >
                  Try It Now
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section id="stats" className="relative z-10 py-28 md:py-36">
        <div className="page-container" style={{ maxWidth: '1024px' }}>
          <Reveal>
            <div className="glass-card p-10 md:p-16 text-center border-white/[0.04]">
              <div className="section-line mx-auto mb-8"></div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                Numbers that speak volumes
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-14 max-w-lg mx-auto">
                See what happens when AI handles your outreach pipeline.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { val: '10x', label: 'Faster Outreach', icon: TrendingUp },
                  { val: '342+', label: 'Leads Qualified', icon: CheckCircle2 },
                  { val: '98%', label: 'Call Completion', icon: PhoneCall },
                  { val: '5', label: 'Agencies Active', icon: Users },
                ].map((s, i) => (
                  <Reveal key={i} delay={i * 0.08} className="text-center">
                    <div>
                      <s.icon size={24} className="mx-auto mb-3 text-[var(--color-gold-400)]" />
                      <div className="text-3xl md:text-4xl font-extrabold font-display stat-glow text-[var(--color-text-primary)]">
                        {s.val}
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)] mt-2 font-medium">{s.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section id="cta" className="relative z-10 py-28 md:py-36">
        <div className="page-container" style={{ maxWidth: '768px', textAlign: 'center' }}>
          <Reveal>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-gold-500)] to-[var(--color-teal-500)] mb-10 shadow-lg shadow-[var(--color-gold-500)]/20">
              <ShieldCheck size={40} className="text-[var(--color-navy-950)]" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Ready to close more deals?
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[var(--color-text-secondary)] text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Stop wasting hours on cold calls. Let your AI voice agent do the heavy lifting while your team focuses on closing.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <button onClick={onEnterDashboard} className="cta-button group cursor-pointer text-lg px-10 py-5">
              Go to Dashboard
              <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-white/5 py-10 bg-[var(--color-navy-950)]/60 backdrop-blur-md">
        <div className="page-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div className="flex items-center gap-2.5">
            <Mic size={20} className="text-[var(--color-gold-500)]" />
            <span className="text-lg font-bold font-display text-[var(--color-text-primary)]">
              Prop<span className="gradient-text">Voice</span>
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            © {new Date().getFullYear()} PropVoice. Built with FastAPI · LangGraph · Vapi · React
          </p>
        </div>
      </footer>
    </div>
  );
}
