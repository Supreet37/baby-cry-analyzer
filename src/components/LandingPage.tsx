import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Mic, Activity, ShieldCheck, HeartPulse, Sparkles, Baby,
  BarChart3, Moon, Heart, ChevronDown, ChevronUp, Star, Zap,
  Volume2, Clock, Lock, CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string; key?: React.Key }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }} className={className}>
      {children}
    </motion.div>
  );
}

function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string; key?: React.Key }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className={className}>
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string; key?: React.Key }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }} className={className}>
      {children}
    </motion.div>
  );
}

const faqs = [
  { q: "How accurate is the cry detection?", a: "Our stacking ensemble model achieves 86.38% accuracy across 11 cry categories, trained on thousands of labeled infant vocalizations." },
  { q: "Is my baby's audio stored anywhere?", a: "No. All analysis runs entirely on your device. Your recordings never leave your browser — complete privacy by design." },
  { q: "What age range does this work for?", a: "Nurture works best for infants from newborn to 24 months, as their cry patterns are most acoustically consistent." },
  { q: "Can I use it offline?", a: "Yes! Nurture includes a full offline simulation mode and supports connecting to a local Python FastAPI server for full model inference." },
  { q: "How do I get the best results?", a: "Record 3–6 seconds of uninterrupted crying, hold your device 1–2 meters from your baby, and reduce background noise for best accuracy." },
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [animatedProgress, setAnimatedProgress] = useState(false);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1C1C18] overflow-x-hidden" id="landing-page-root">

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#ECE7DD]/80 glass">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#33614A] flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-[#1C1C18] text-[15px] tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Nurture</span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#6B6A61]">
            <a href="#how-it-works" className="hover:text-[#1C1C18] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[#1C1C18] transition-colors">Features</a>
            <a href="#accuracy" className="hover:text-[#1C1C18] transition-colors">Accuracy</a>
            <a href="#faq" className="hover:text-[#1C1C18] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button type="button" id="landing-btn-login" onClick={onGetStarted}
              className="text-[13px] font-semibold text-[#5C5A52] hover:text-[#1C1C18] px-3 py-2 transition-colors cursor-pointer">
              Log in
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="button" id="landing-btn-get-started-nav"
              onClick={onGetStarted}
              className="text-[13px] font-semibold bg-[#33614A] text-white px-5 py-2.5 rounded-full hover:bg-[#2A4F3D] transition-colors shadow-sm cursor-pointer">
              Get started
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Floating blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="float-a absolute top-20 left-[8%] w-28 h-28 rounded-full opacity-40" style={{ background: '#A7D8FF', filter: 'blur(40px)' }} />
          <div className="float-b absolute top-32 right-[12%] w-36 h-36 rounded-full opacity-30" style={{ background: '#DCCEF9', filter: 'blur(50px)' }} />
          <div className="float-c absolute bottom-20 left-[20%] w-24 h-24 rounded-full opacity-35" style={{ background: '#CDEFD6', filter: 'blur(35px)' }} />
          <div className="float-a absolute bottom-10 right-[8%] w-20 h-20 rounded-full opacity-40" style={{ background: '#FFDCC8', filter: 'blur(30px)', animationDelay: '2s' }} />

          {/* Decorative pill shapes */}
          <motion.div animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[15%] left-[5%] w-16 h-6 rounded-full opacity-60 hidden lg:block" style={{ background: '#CDEFD6', border: '1.5px solid #A8D8B4' }} />
          <motion.div animate={{ y: [0, 10, 0], rotate: [0, -4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-[25%] right-[6%] w-12 h-12 rounded-2xl opacity-50 hidden lg:block" style={{ background: '#DCCEF9', border: '1.5px solid #C8B8F0' }} />
          <motion.div animate={{ y: [0, -8, 0], x: [0, 5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-[30%] left-[3%] w-10 h-10 rounded-full opacity-50 hidden lg:block" style={{ background: '#FFDCC8', border: '1.5px solid #F5C4A8' }} />
        </div>

        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-20 md:pt-28 pb-20 md:pb-28">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-widest text-[#33614A] bg-[#E9F1EC] border border-[#C8DDCD] px-3.5 py-1.5 rounded-full"
                  style={{ fontFamily: 'Nunito, sans-serif' }}>
                  <Sparkles className="w-3.5 h-3.5" /> Built for sleepless nights
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.07 }}
                className="mt-5 text-[40px] sm:text-[52px] md:text-[56px] leading-[1.05] font-bold tracking-tight text-[#1C1C18]"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Understand what your baby is{' '}
                <span className="gradient-text">trying to tell you.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.14 }}
                className="mt-5 text-[17px] leading-relaxed text-[#6B6A61] max-w-md"
              >
                Nurture listens to your baby's cry and identifies whether they're hungry,
                tired, uncomfortable, or just need a little extra love — so you can respond
                with confidence, faster.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="button" id="landing-btn-get-started-hero"
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-2 bg-[#33614A] text-white text-[14.5px] font-semibold px-7 py-3.5 rounded-full hover:bg-[#2A4F3D] transition-colors shadow-md cursor-pointer">
                  Get started — it's free <ArrowRight className="w-4 h-4" />
                </motion.button>
                <a href="#how-it-works"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#3A3A33] px-6 py-3.5 rounded-full border border-[#DDD8CF] hover:bg-white hover:border-[#C8C4BB] transition-colors">
                  See how it works
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.32, duration: 0.5 }}
                className="mt-9 flex flex-wrap items-center gap-5 text-[13px] text-[#8A8878]"
              >
                {[
                  { icon: ShieldCheck, text: 'Private & on-device' },
                  { icon: Baby, text: '11 cry categories' },
                  { icon: Zap, text: '86.38% accuracy' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-[#33614A]" strokeWidth={1.75} />
                    <span>{text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: hero card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="relative"
            >
              {/* Main card */}
              <div className="relative rounded-[28px] border border-[#ECE7DD] bg-white shadow-[0_4px_6px_rgba(0,0,0,0.03),_0_24px_48px_-24px_rgba(35,35,31,0.14)] p-7 max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#E9F1EC] flex items-center justify-center text-[#33614A]">
                      <Mic className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>Listening…</p>
                      <p className="text-[11.5px] text-[#9C9A8E]">4.2s clip · processing</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#33614A] bg-[#E9F1EC] border border-[#C8DDCD] px-2.5 py-1 rounded-full"
                    style={{ fontFamily: 'Nunito, sans-serif' }}>Live</span>
                </div>

                {/* Animated waveform */}
<div className="mt-6 flex items-end gap-[3px] h-16">
  {[18,34,52,28,60,40,70,30,46,64,24,50,36,58,22,44,32,54,20,42].map((h, idx) => (
    <div 
      key={idx} 
      className="flex-1 rounded-full wave-bar"
      style={{ 
        height: `${h}%`, 
        backgroundColor: '#BFD8CB',
        transformOrigin: 'center bottom',
        animation: `barPulse 1.5s ease-in-out ${(idx * 0.065).toFixed(2)}s infinite`
      }} 
    />
  ))}
</div>

                <div className="mt-6 border-t border-[#F1EDE4] pt-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#9C9A8E] mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>Most likely</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FBF1E6] flex items-center justify-center text-[#C07E4B]">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>Hungry</p>
                        <p className="text-[12px] text-[#9C9A8E]">Rhythmic, repeating pattern</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[22px] font-bold text-[#33614A] tabular-nums" style={{ fontFamily: 'Poppins, sans-serif' }}>89%</p>
                      <p className="text-[11px] text-[#9C9A8E]">confidence</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-[#F1EDE4] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '89%' }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                      className="h-full bg-[#7FAE96] rounded-full" />
                  </div>
                </div>

                {/* Mini probability rows */}
                <div className="mt-4 space-y-2">
                  {[['Tired', '06%', '#A7D8FF'], ['Belly Pain', '03%', '#DCCEF9'], ['Discomfort', '02%', '#FFDCC8']].map(([label, pct, col]) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
                      <span className="text-[11.5px] text-[#9C9A8E] flex-1">{label}</span>
                      <span className="text-[11.5px] font-mono text-[#7A776C]">{pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge — calming sounds */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex absolute -bottom-6 -left-8 items-center gap-3 bg-white border border-[#ECE7DD] rounded-2xl px-4 py-3 shadow-[0_8px_24px_-8px_rgba(35,35,31,0.14)]"
              >
                <div className="w-9 h-9 rounded-full bg-[#EAF1F8] flex items-center justify-center text-[#5E84A8]">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[12.5px] font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>Calming sounds ready</p>
                  <p className="text-[11px] text-[#9C9A8E]">Heartbeat · Ocean · Lullaby</p>
                </div>
              </motion.div>

              {/* Floating badge — analysis speed */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex absolute -top-4 -right-6 items-center gap-2 bg-white border border-[#ECE7DD] rounded-2xl px-3.5 py-2.5 shadow-[0_8px_24px_-8px_rgba(35,35,31,0.14)]"
              >
                <Clock className="w-4 h-4 text-[#C07E4B]" />
                <div>
                  <p className="text-[11.5px] font-bold text-[#1C1C18]">Results in ~2s</p>
                  <p className="text-[10.5px] text-[#9C9A8E]">instant analysis</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-[#ECE7DD] bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <FadeIn>
            <span className="text-[11.5px] font-bold uppercase tracking-widest text-[#33614A]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              How it works
            </span>
            <h2 className="mt-3 text-[30px] sm:text-[38px] font-bold tracking-tight text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              From cry to clarity in seconds.
            </h2>
            <p className="mt-3 text-[16px] text-[#6B6A61] max-w-lg">
              Three simple steps that give you real answers, not just guesses.
            </p>
          </FadeIn>

          <StaggerContainer className="mt-12 grid sm:grid-cols-3 gap-6">
            {[
              { icon: Mic, num: '01', title: 'Record or upload', desc: 'Capture a few seconds of your baby crying — or upload an existing clip in any common audio format.', color: '#CDEFD6', iconColor: '#33614A' },
              { icon: Activity, num: '02', title: 'Acoustic analysis', desc: 'Our ML model extracts 40+ acoustic features — MFCC, Chroma, Mel spectrogram — and identifies the pattern.', color: '#A7D8FF', iconColor: '#3A7AB8' },
              { icon: BarChart3, num: '03', title: 'Clear guidance', desc: 'See the most likely reason your baby is crying, with confidence scores and gentle, practical soothing tips.', color: '#DCCEF9', iconColor: '#6B4EC4' },
            ].map((step) => (
              <StaggerItem key={step.title}>
                <div className="relative rounded-2xl border border-[#ECE7DD] bg-white p-7 hover:border-[#D0CAC0] hover:shadow-md transition-all group">
                  <span className="absolute top-5 right-5 text-[11px] font-bold text-[#C8C4BC]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{step.num}</span>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: step.color }}>
                    <step.icon className="w-5.5 h-5.5" style={{ color: step.iconColor }} />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>{step.title}</h3>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#7A776C]">{step.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <FadeIn>
          <span className="text-[11.5px] font-bold uppercase tracking-widest text-[#33614A]" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Everything in one place
          </span>
          <h2 className="mt-3 text-[30px] sm:text-[38px] font-bold tracking-tight text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Designed around real parenting moments.
          </h2>
          <p className="mt-3 text-[16px] text-[#6B6A61] max-w-lg">
            Everything a new parent needs to feel calm, confident, and supported.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Baby, title: 'Multiple baby profiles', desc: 'Keep separate histories for each little one, with their own timeline and notes.', bg: '#CDEFD6', ic: '#33614A' },
            { icon: Activity, title: 'Acoustic feature breakdown', desc: 'See MFCC, Chroma, and Mel spectrograms behind every prediction — for the curious parent.', bg: '#A7D8FF', ic: '#3A7AB8' },
            { icon: Volume2, title: 'Soothing soundscapes', desc: 'Heartbeat, ocean waves, and gentle lullabies, ready whenever your baby needs comfort.', bg: '#DCCEF9', ic: '#6B4EC4' },
            { icon: BarChart3, title: 'A history you can trust', desc: 'Save analyses with notes, and look back on patterns over days and weeks.', bg: '#FFDCC8', ic: '#C07E4B' },
            { icon: Lock, title: 'Private by design', desc: 'Recordings are processed entirely on your device — nothing is shared without your say.', bg: '#E9F1EC', ic: '#33614A' },
            { icon: Sparkles, title: '11 cry categories', desc: 'Hungry, tired, belly pain, scared, lonely — we recognize them all with detailed soothing guidance.', bg: '#FEF9EC', ic: '#B8840F' },
          ].map((f) => (
            <StaggerItem key={f.title}>
              <div className="rounded-2xl border border-[#ECE7DD] bg-[#FAFAF7] p-6 hover:bg-white hover:border-[#D0CAC0] hover:shadow-sm transition-all h-full">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                  <f.icon className="w-5 h-5" style={{ color: f.ic }} strokeWidth={1.75} />
                </div>
                <h3 className="text-[15px] font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>{f.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#7A776C]">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── Why Parents Trust Us ─────────────────────────────────── */}
      <section id="trust" className="border-t border-[#ECE7DD] bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11.5px] font-bold uppercase tracking-widest text-[#33614A]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Why parents trust us
            </span>
            <h2 className="mt-3 text-[30px] sm:text-[38px] font-bold tracking-tight text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Science + empathy, for parents who need both.
            </h2>
            <p className="mt-3 text-[16px] text-[#6B6A61]">
              Nurture was built by people who've been up at 3am, too.
            </p>
          </FadeIn>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { icon: ShieldCheck, label: 'On-device only', desc: 'Your recordings never leave your browser. Zero server uploads, zero privacy concerns.', color: '#CDEFD6' },
              { icon: Zap, label: '~2 second analysis', desc: 'Results in under 2 seconds with our offline acoustic model — no internet lag.', color: '#A7D8FF' },
              { icon: Heart, label: 'Calm, warm guidance', desc: 'Every result comes with gentle, evidence-based soothing techniques — not cold medical jargon.', color: '#FFDCC8' },
              { icon: CheckCircle, label: '11 recognized patterns', desc: 'From hunger to belly pain to loneliness — Nurture covers the full spectrum of infant needs.', color: '#DCCEF9' },
              { icon: Clock, label: 'History & notes', desc: 'Build a log of your baby\'s patterns over time, with optional personal notes for each session.', color: '#FEF9EC' },
              { icon: Star, label: 'Trusted by parents', desc: 'Designed to reduce stress, not add it — clear results you can act on immediately.', color: '#E9F1EC' },
            ].map((item) => (
              <StaggerItem key={item.label}>
                <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#ECE7DD] bg-[#FAFAF7] hover:bg-white transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.color }}>
                    <item.icon className="w-4.5 h-4.5 text-[#33614A]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.label}</h4>
                    <p className="mt-1 text-[13px] text-[#7A776C] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Testimonials strip */}
          <StaggerContainer className="grid sm:grid-cols-3 gap-5">
            {[
              { name: 'Priya M.', role: 'Mom of 3-month-old', text: '"It actually helped me figure out the difference between his hunger cry and his tired cry. Total game changer at 2am."' },
              { name: 'Daniel K.', role: 'First-time dad', text: '"I was skeptical, but it correctly identified a belly pain cry I would\'ve missed. The soothing tips were spot-on too."' },
              { name: 'Amara S.', role: 'Parent of twins', text: '"Having separate profiles for each baby and seeing their individual patterns over time is incredibly reassuring."' },
            ].map((t) => (
              <StaggerItem key={t.name}>
                <div className="p-5 rounded-2xl border border-[#ECE7DD] bg-white h-full">
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-[#D4AA4B] text-[#D4AA4B]" />)}
                  </div>
                  <p className="text-[13.5px] text-[#554A3C] leading-relaxed italic">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-[#F1EDE4]">
                    <p className="text-[13px] font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>{t.name}</p>
                    <p className="text-[11.5px] text-[#9C9A8E]">{t.role}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Model Accuracy ───────────────────────────────────────── */}
      <section id="accuracy" ref={statsRef}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <FadeIn className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[11.5px] font-bold uppercase tracking-widest text-[#33614A]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Model accuracy
              </span>
              <h2 className="mt-3 text-[30px] sm:text-[38px] font-bold tracking-tight text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Built on real science.
              </h2>
              <p className="mt-4 text-[16px] text-[#6B6A61] leading-relaxed">
                Our stacking ensemble model combines multiple classifiers trained on thousands of labeled infant vocalizations.
                It analyzes pitch, rhythm, and tonal features to deliver consistent, reliable predictions.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { label: 'Overall accuracy', value: 86.38, color: '#33614A' },
                  { label: 'Hunger detection', value: 91.2, color: '#3A7AB8' },
                  { label: 'Pain/discomfort', value: 83.5, color: '#C07E4B' },
                  { label: 'Sleep/tired', value: 88.7, color: '#6B4EC4' },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1.5">
                    <div className="flex justify-between text-[13.5px]">
                      <span className="font-medium text-[#4A4840]">{stat.label}</span>
                      <span className="font-bold tabular-nums text-[#1C1C18]">{stat.value}%</span>
                    </div>
                    <div className="h-2.5 bg-[#F0EDE6] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={statsInView ? { width: `${stat.value}%` } : { width: 0 }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: stat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <StaggerContainer className="grid grid-cols-2 gap-4">
                {[
                  { value: '86.38%', label: 'Overall accuracy', sub: 'Stacking ensemble', color: '#CDEFD6' },
                  { value: '11', label: 'Cry categories', sub: 'Fully labeled', color: '#A7D8FF' },
                  { value: '40+', label: 'Acoustic features', sub: 'MFCC, Chroma, Mel', color: '#DCCEF9' },
                  { value: '<2s', label: 'Analysis time', sub: 'On-device inference', color: '#FFDCC8' },
                ].map((stat) => (
                  <StaggerItem key={stat.label}>
                    <div className="p-6 rounded-2xl border border-[#ECE7DD] text-center" style={{ background: stat.color + '40' }}>
                      <p className="text-[28px] font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>{stat.value}</p>
                      <p className="mt-1 text-[13px] font-bold text-[#1C1C18]">{stat.label}</p>
                      <p className="text-[11.5px] text-[#9C9A8E] mt-0.5">{stat.sub}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-[#ECE7DD] bg-white">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <FadeIn className="text-center mb-12">
            <span className="text-[11.5px] font-bold uppercase tracking-widest text-[#33614A]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              FAQ
            </span>
            <h2 className="mt-3 text-[30px] sm:text-[38px] font-bold tracking-tight text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Common questions.
            </h2>
          </FadeIn>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div className="border border-[#ECE7DD] rounded-2xl overflow-hidden bg-white hover:border-[#D0CAC0] transition-colors">
                  <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer">
                    <span className="text-[14.5px] font-semibold text-[#1C1C18] pr-6" style={{ fontFamily: 'Poppins, sans-serif' }}>{faq.q}</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${openFaq === i ? 'bg-[#33614A] text-white' : 'bg-[#F1EDE4] text-[#7A776C]'}`}>
                      {openFaq === i ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <p className="px-6 pb-5 text-[14px] text-[#6B6A61] leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20 pb-24">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden px-8 md:px-16 py-14 md:py-18 text-center"
            style={{ background: 'linear-gradient(135deg, #1E4A35 0%, #2A4F3D 40%, #33614A 100%)' }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#A7D8FF', filter: 'blur(60px)', transform: 'translate(-30%, -30%)' }} />
            <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: '#DCCEF9', filter: 'blur(50px)', transform: 'translate(20%, 20%)' }} />

            <div className="relative z-10">
              <h2 className="text-[28px] sm:text-[38px] font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                You know your baby best.<br />We're just here to help you trust that.
              </h2>
              <p className="mt-4 text-[15px] text-[#A8C4B4] max-w-md mx-auto">
                Join parents who use Nurture to feel a little more confident, one cry at a time.
              </p>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button"
                id="landing-btn-get-started-footer" onClick={onGetStarted}
                className="mt-8 inline-flex items-center gap-2 bg-white text-[#1C1C18] text-[14.5px] font-bold px-8 py-4 rounded-full hover:bg-[#F5F2EE] transition-colors shadow-lg cursor-pointer">
                Get started — it's free <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[#ECE7DD] bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12.5px] text-[#9C9A8E]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#33614A] flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-[#5C5A52]" style={{ fontFamily: 'Poppins, sans-serif' }}>Nurture</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <span className="font-medium text-[#7A776C]">Model accuracy: 86.38%</span>
            <span className="text-[#ECE7DD] hidden sm:inline">•</span>
            <span>Local secure session storage</span>
            <span className="text-[#ECE7DD] hidden sm:inline">•</span>
            <span>© 2026 Nurture. For guidance only — always consult a pediatrician.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}