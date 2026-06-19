import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

const LOADING_HINTS = [
  'Warming up the acoustic engine…',
  'Loading cry pattern models…',
  'Preparing your baby profiles…',
  'Almost ready for you…',
];

const BAR_HEIGHTS = [18, 32, 22, 44, 28, 52, 34, 44, 26, 38, 20, 46, 30, 52, 24, 40, 28, 36, 22, 48];

export default function LoadingScreen() {
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex(i => (i + 1) % LOADING_HINTS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#FAFAF7' }}
    >
      {/* Subtle ambient glow behind logo */}
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(127,174,150,0.15) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-8">

        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #33614A 0%, #5C8A6B 100%)' }}
          >
            <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0">
              <img
                src="/src/asset/icon.png"
                alt="NurtureAI Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

          <div className="text-center">
            <h1
              className="text-[26px] font-bold text-[#1C1C18] tracking-tight"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Nurture
            </h1>
            <p className="text-xs text-[#9C9A8E] mt-0.5" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Baby Cry Analyzer
            </p>
          </div>
        </motion.div>

        {/* Animated waveform */}
        <div className="flex items-end gap-[3px] h-14">
          {BAR_HEIGHTS.map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h}%`, `${Math.min(h + 30, 95)}%`, `${h}%`] }}
              transition={{
                duration: 0.9 + (i % 4) * 0.15,
                repeat: Infinity,
                delay: i * 0.06,
                ease: 'easeInOut',
              }}
              className="w-[3px] rounded-full"
              style={{
                backgroundColor: i % 3 === 0 ? '#33614A' : i % 3 === 1 ? '#7FAE96' : '#BACFC1',
              }}
            />
          ))}
        </div>

        {/* Rotating hint text */}
        <div className="h-5 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={hintIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-[#9C9A8E] text-center"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {LOADING_HINTS[hintIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress track */}
        <motion.div
          className="w-48 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: '#EDE7DC' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #33614A, #7FAE96)' }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </motion.div>

      </div>

      {/* Bottom credit */}
      <motion.p
        className="absolute bottom-8 text-[16px] text-[#C0BDB4]"
        style={{ fontFamily: 'Nunito, sans-serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Built by Supreet Mohapatra
      </motion.p>
    </motion.div>
  );
}