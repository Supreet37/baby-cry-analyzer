import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Github, Linkedin, Mail, GraduationCap, Layers, Cpu,
  CheckCircle2, Image as ImageIcon, Sparkles, Server
} from 'lucide-react';

const features: string[] = [
  'Live recording or WAV / MP3 / OGG / M4A upload',
  '11-category cry classification with confidence scores',
  'MFCC, Chroma & Mel Spectrogram acoustic feature visualization',
  'Multiple baby profiles with per-baby history',
  'Built-in soothing soundscapes — white, pink & brown noise, lullabies, womb heartbeat',
  'Fully on-device — audio never leaves the browser',
  'Optional FastAPI backend for real stacking-ensemble predictions',
];

const baseModels: { tag: string; name: string; detail: string }[] = [
  { tag: 'SVM', name: 'Support Vector Machine', detail: "RBF kernel, C=100, gamma='scale'" },
  { tag: 'KNN', name: 'K-Nearest Neighbors', detail: 'k=3, distance-weighted' },
  { tag: 'ET', name: 'Extra Trees Classifier', detail: '300 estimators' },
  { tag: 'XGB', name: 'XGBoost Classifier', detail: '300 estimators, max depth 6, lr 0.1' },
  { tag: 'MLP', name: 'Multi-Layer Perceptron', detail: '256 → 128 hidden units, early stopping' },
];

const techStack: string[] = ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'FastAPI', 'scikit-learn', 'XGBoost'];

export default function Developer() {
  const [imgError, setImgError] = useState<boolean>(false);

  return (
    <div className="space-y-5 max-w-4xl mx-auto px-4 sm:px-0">

      {/* ── Developer profile ─────────────────────────────────────── */}
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-10">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-50 md:h-50 rounded-2xl bg-[#33614A] flex items-center justify-center shrink-0">
            <img 
              src="src/asset/supreet.png" 
              alt="Profile Picture" 
              className="w-full h-full object-cover rounded-2xl" 
              onError={() => setImgError(true)} 
            />
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 flex-wrap">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Supreet Mohapatra
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9F1EC] text-[#2E5E41] font-bold uppercase tracking-wide" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Project Developer
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-xs text-[#7A776C]">
              <GraduationCap className="w-3.5 h-3.5" />
              B.Tech CSE — 3rd Year Student
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 flex-wrap">
              <a href="https://github.com/Supreet37" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F2EE] hover:bg-[#EDE8E2] border border-[#E8E2D8] text-xs font-semibold text-[#3A3A33] transition-all cursor-pointer">
                <Github className="w-3.5 h-3.5" /> GitHub
              </a>
              <a href="https://www.linkedin.com/in/supreet-mohapatra" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F2EE] hover:bg-[#EDE8E2] border border-[#E8E2D8] text-xs font-semibold text-[#3A3A33] transition-all cursor-pointer">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
              <a href="mailto:supreetmohapatra06@gmail.com"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F2EE] hover:bg-[#EDE8E2] border border-[#E8E2D8] text-xs font-semibold text-[#3A3A33] transition-all cursor-pointer">
                <Mail className="w-3.5 h-3.5" /> Email
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── About the project ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }} className="card p-4 sm:p-5">
        <h3 className="text-[14px] font-bold text-[#1C1C18] flex items-center gap-2 border-b border-[#F1EDE4] pb-3 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <Sparkles className="w-4 h-4 text-[#7FAE96]" />
          About Nurture
        </h3>
        <p className="text-sm text-[#4A4840] leading-relaxed">
          Nurture is a baby cry analyzer built to help parents understand what their little one needs.
          The app records or accepts uploaded cry audio, extracts acoustic features, and classifies the
          sound into one of 11 categories — hungry, tired, belly pain, discomfort, scared, lonely, cold or
          hot, burping, background noise, laugh, or silence — alongside a confidence score and practical
          soothing tips.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#6C5F4F] bg-[#FAFAF7] border border-[#EDE7DC] rounded-xl p-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7FAE96] shrink-0 mt-0.5" />
              <span className="text-[11px] sm:text-xs">{f}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Model & architecture ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }} className="card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-2 border-b border-[#F1EDE4] pb-3 mb-3">
          <h3 className="text-[14px] font-bold text-[#1C1C18] flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Cpu className="w-4 h-4 text-[#7FAE96]" />
            Model — Tuned Stacking Ensemble
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#E9F1EC] text-[#2E5E41] font-bold tabular-nums" style={{ fontFamily: 'Nunito, sans-serif' }}>
            86.38% accuracy
          </span>
        </div>

        <p className="text-xs text-[#9C9A8E] uppercase tracking-widest font-bold mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Base estimators
        </p>
        <div className="space-y-2">
          {baseModels.map((m) => (
            <div key={m.tag} className="flex items-center gap-3 p-3 bg-[#FAFAF7] border border-[#EDE7DC] rounded-xl">
              <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-[#E8E2D8] text-[#33614A] shrink-0" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {m.tag}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1C1C18]">{m.name}</p>
                <p className="text-xs text-[#9C9A8E]">{m.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start sm:items-center gap-3 p-3 mt-3 bg-[#F2FAF6] border border-[#BACFC1] rounded-xl">
          <Layers className="w-4 h-4 text-[#2E5E41] shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs text-[#3B5C46]">
            <span className="font-bold">Meta-learner:</span> SVM (RBF kernel, C=10) combines all five base predictions into the final cry label, with 5-fold cross-validation during training.
          </p>
        </div>

        <p className="text-xs text-[#9C9A8E] uppercase tracking-widest font-bold mt-4 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Built with
        </p>
        <div className="flex flex-wrap gap-1.5">
          {techStack.map((t) => (
            <span key={t} className="text-[10px] px-2.5 py-1 rounded-full bg-[#F5F2EE] border border-[#E8E2D8] text-[#4A4840] font-semibold">
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── How Nurture Works ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
        className="card p-4 sm:p-5"
      >
        <h3
          className="text-[14px] font-bold text-[#1C1C18] flex items-center gap-2 border-b border-[#F1EDE4] pb-3 mb-5"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <Server className="w-4 h-4 text-[#7FAE96]" />
          How Nurture Works
        </h3>

        <div className="relative flex flex-col items-center gap-4 sm:gap-6">

          {/* Animated Waveform */}
          <div className="flex items-end gap-1 h-12 sm:h-14">
            {[12, 28, 18, 36, 22, 42, 25, 32, 16].map((h, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [h, h + 12, h],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.08,
                }}
                className="w-1.5 sm:w-2 rounded-full bg-[#7FAE96]"
              />
            ))}
          </div>

          <p className="text-xs font-semibold text-[#6C5F4F]">
            Baby Cry Audio
          </p>

          {/* Arrow */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
            }}
            className="text-[#7FAE96] text-xl sm:text-2xl"
          >
            ↓
          </motion.div>

          {/* AI Brain */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-[#E9F1EC] border border-[#BACFC1] flex flex-col items-center justify-center"
          >
            <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-[#2E5E41]" />
            <span className="text-[9px] sm:text-[10px] mt-1 font-bold text-[#2E5E41]">
              AI Analyzer
            </span>
          </motion.div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {['MFCC', 'Chroma', 'Mel'].map((item) => (
              <span
                key={item}
                className="text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#F5F2EE] border border-[#E8E2D8] text-[#4A4840] font-semibold"
              >
                {item}
              </span>
            ))}
          </div>

          {/* Arrow */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
            }}
            className="text-[#7FAE96] text-xl sm:text-2xl"
          >
            ↓
          </motion.div>

          {/* Prediction Card */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 rgba(127,174,150,0)',
                '0 0 20px rgba(127,174,150,0.25)',
                '0 0 0 rgba(127,174,150,0)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="w-full max-w-sm rounded-2xl border border-[#BACFC1] bg-[#F2FAF6] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#2E5E41]">
                Predicted Cry
              </span>

              <span className="text-xs px-2 py-1 rounded-full bg-white border border-[#BACFC1]">
                87%
              </span>
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-[#2E5E41] mt-2">
              🍼 Hungry
            </h4>

            <p className="text-xs text-[#6C5F4F] mt-2">
              Suggested action: Try feeding the baby and observe rooting or sucking
              cues.
            </p>
          </motion.div>
        </div>
      </motion.div>

      
    </div>
  );
}