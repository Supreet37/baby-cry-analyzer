import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Activity, Music, Microscope } from 'lucide-react';
import { CryAnalysis } from '../types';

interface ScientificFeaturesProps {
  analysis: CryAnalysis;
}

export default function ScientificFeatures({ analysis }: ScientificFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'mfcc' | 'chroma' | 'mel'>('mfcc');

  const tabs = [
    { id: 'mfcc' as const, label: 'MFCC', icon: <Activity className="w-3.5 h-3.5" />, description: 'Mel-Frequency Cepstral Coefficients — timbral voice fingerprint across 40 spectral bands' },
    { id: 'chroma' as const, label: 'Chroma', icon: <Music className="w-3.5 h-3.5" />, description: '12 pitch-class energies (C to B) — harmonic energy signature of the cry' },
    { id: 'mel' as const, label: 'Mel Spectrum', icon: <BarChart2 className="w-3.5 h-3.5" />, description: '64-bin perceptual frequency distribution — frequency mass along the mel scale' },
  ];

  const { mfcc, chroma, mel } = analysis.features;

  const renderMFCC = () => {
    const displayData = mfcc.slice(0, 32);
    const min = Math.min(...displayData);
    const max = Math.max(...displayData);
    const range = max - min || 1;
    return (
      <div className="flex items-end gap-1 h-32 w-full" id="chart-mfcc">
        {displayData.map((val, i) => {
          const pct = ((val - min) / range) * 100;
          const isFirst = i === 0;
          return (
            <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.015, duration: 0.35, ease: 'easeOut' }}
              style={{ transformOrigin: 'bottom', height: `${Math.max(4, pct)}%`, flex: 1, borderRadius: '3px 3px 0 0',
                backgroundColor: isFirst ? '#D4833A' : `hsl(${154 - (i * 3)}, ${40 + (pct * 0.3)}%, ${50 + (pct * 0.15)}%)` }}
              title={`Band ${i + 1}: ${val.toFixed(2)}`}
            />
          );
        })}
      </div>
    );
  };

  const renderChroma = () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return (
      <div className="grid grid-cols-12 gap-1 h-28 items-end" id="chart-chroma">
        {chroma.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: 'easeOut' }}
              style={{ transformOrigin: 'bottom', height: `${Math.round(val * 100)}%`, borderRadius: '3px 3px 0 0',
                backgroundColor: `hsl(${204 - i * 10}, 60%, ${45 + val * 20}%)` }}
              title={`${notes[i]}: ${(val * 100).toFixed(1)}%`}
              className="w-full"
            />
            <span className="text-[9px] text-[#A8A09A] font-mono">{notes[i]}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderMel = () => {
    const displayData = mel.slice(0, 48);
    return (
      <div className="flex items-end gap-[2px] h-32 w-full" id="chart-mel">
        {displayData.map((val, i) => {
          const pct = val * 100;
          return (
            <motion.div key={i}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: i * 0.01, duration: 0.4, ease: 'easeOut' }}
              style={{ transformOrigin: 'bottom', height: `${Math.max(3, pct)}%`, flex: 1, borderRadius: '2px 2px 0 0',
                backgroundColor: `hsl(${160 + pct * 0.5}, ${50 + pct * 0.4}%, ${42 + pct * 0.2}%)` }}
              title={`Bin ${i + 1}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>
    );
  };

  const activeTabData = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="card p-5" id="scientific-deep-dive-container">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#EEF0FF] flex items-center justify-center">
          <Microscope className="w-4 h-4 text-[#5660BD]" strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-semibold text-[#1A1614]">Acoustic Feature Analysis</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F5F2EE] rounded-xl mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`tab-scientific-${tab.id}`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeTab === tab.id
              ? 'bg-white text-[#1A1614] shadow-sm'
              : 'text-[#7A716A] hover:text-[#4A4440]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#A8A09A] mb-4 leading-relaxed">{activeTabData.description}</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="px-1 pb-1"
        >
          {activeTab === 'mfcc' && renderMFCC()}
          {activeTab === 'chroma' && renderChroma()}
          {activeTab === 'mel' && renderMel()}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 pt-4 border-t border-[#F0EDE8] grid grid-cols-3 gap-2">
        {[
          { label: 'MFCC Bands', value: '40', sub: 'spectral' },
          { label: 'Pitch Classes', value: '12', sub: 'chromagram' },
          { label: 'Mel Bins', value: '64', sub: 'perceptual' },
        ].map(stat => (
          <div key={stat.label} className="text-center p-2.5 rounded-xl bg-[#F7F5F2]">
            <p className="text-lg font-bold text-[#1A1614]">{stat.value}</p>
            <p className="text-[10px] font-semibold text-[#7A716A] uppercase tracking-wide">{stat.label}</p>
            <p className="text-[10px] text-[#A8A09A]">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
