/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CryLabel } from '../types';

export interface SimulatedAnalysisResult {
  matchedLabel: CryLabel;
  confidence: number;
  probabilities: Record<CryLabel, number>;
  features: {
    mfcc: number[];
    chroma: number[];
    mel: number[];
  };
}

// Emulate the Python scaler & model behavior on the client with scientific visual simulations
export function simulateAudioAnalysis(fileName: string, durationSec: number): SimulatedAnalysisResult {
  // We can seed the random generation based on file name longitudes so it is consistent
  let seed = 0;
  for (let i = 0; i < fileName.length; i++) {
    seed += fileName.charCodeAt(i);
  }

  const seededRandom = (shift: number) => {
    const x = Math.sin(seed + shift) * 10000;
    return x - Math.floor(x);
  };

  // Determine primary kind based on name keys as an easter egg, or randomize
  const labels = Object.values(CryLabel);
  let primaryIndex = Math.floor(seededRandom(4) * labels.length);
  
  // Custom smart overrides based on filename clues
  const lowercaseName = fileName.toLowerCase();
  if (lowercaseName.includes('hungry') || lowercaseName.includes('hunger') || lowercaseName.includes('mil')) {
    primaryIndex = labels.indexOf(CryLabel.HUNGRY);
  } else if (lowercaseName.includes('tired') || lowercaseName.includes('sleep') || lowercaseName.includes('yaw')) {
    primaryIndex = labels.indexOf(CryLabel.TIRED);
  } else if (lowercaseName.includes('belly') || lowercaseName.includes('pain') || lowercaseName.includes('colic') || lowercaseName.includes('tummy')) {
    primaryIndex = labels.indexOf(CryLabel.BELLY_PAIN);
  } else if (lowercaseName.includes('burp')) {
    primaryIndex = labels.indexOf(CryLabel.BURPING);
  } else if (lowercaseName.includes('cold') || lowercaseName.includes('hot') || lowercaseName.includes('temp')) {
    primaryIndex = labels.indexOf(CryLabel.COLD_HOT);
  } else if (lowercaseName.includes('comfort') || lowercaseName.includes('diaper')) {
    primaryIndex = labels.indexOf(CryLabel.DISCOMFORT);
  } else if (lowercaseName.includes('scare') || lowercaseName.includes('startle') || lowercaseName.includes('loud')) {
    primaryIndex = labels.indexOf(CryLabel.SCARED);
  } else if (lowercaseName.includes('silence') || lowercaseName.includes('quiet')) {
    primaryIndex = labels.indexOf(CryLabel.SILENCE);
  } else if (lowercaseName.includes('laugh') || lowercaseName.includes('gigg')) {
    primaryIndex = labels.indexOf(CryLabel.LAUGH);
  }

  if (primaryIndex < 0 || primaryIndex >= labels.length) {
    primaryIndex = 4; // fallback to hungry
  }

  // Generate scientific random-looking MFCC, Chroma and Mel sequences
  // MFCC holds 40 bands (first is generally negative/larger, others fluctuate)
  const mfcc: number[] = [];
  for (let i = 0; i < 40; i++) {
    if (i === 0) {
      mfcc.push(-200 - seededRandom(i) * 150);
    } else {
      mfcc.push((seededRandom(i) - 0.5) * 40 - (i * 0.4));
    }
  }

  // Chroma represents 12 pitch classes (normalized 0 to 1)
  const chroma: number[] = [];
  for (let i = 0; i < 12; i++) {
    const isPrimaryPitch = i === (primaryIndex % 12) || i === ((primaryIndex + 4) % 12);
    const val = isPrimaryPitch 
      ? 0.7 + seededRandom(i * 10) * 0.3
      : seededRandom(i * 10) * 0.4;
    chroma.push(Math.round(val * 100) / 100);
  }

  // Mel spectrogram representation (simplified to 64 bins for clean plotting)
  const mel: number[] = [];
  for (let i = 0; i < 64; i++) {
    const center = 15 + (primaryIndex * 3);
    const distance = Math.abs(i - center);
    const baseVal = Math.max(0.01, 1 - (distance / 25));
    const finalVal = baseVal * (0.6 + seededRandom(i * 2) * 0.4);
    mel.push(Math.round(finalVal * 100) / 100);
  }

  // Generate structured probabilities matching the 86.38% tuned stacking ensemble
  const probabilities: Record<CryLabel, number> = {} as any;
  let sum = 0;
  
  labels.forEach((l, idx) => {
    let rawScore = 0;
    if (idx === primaryIndex) {
      rawScore = 0.65 + seededRandom(99) * 0.25; // Primary confidence 65% - 90%
    } else {
      rawScore = seededRandom(idx * 7) * 0.08;   // Small distribute
    }
    probabilities[l] = rawScore;
    sum += rawScore;
  });

  // Normalize
  labels.forEach(l => {
    probabilities[l] = Math.max(0.005, probabilities[l] / sum);
  });

  const matchedLabel = labels[primaryIndex];
  const sortedProbs = Object.keys(probabilities).map(k => ({
    label: k as CryLabel,
    prob: probabilities[k as CryLabel]
  })).sort((a, b) => b.prob - a.prob);

  // Exact math checks
  const finalMatched = sortedProbs[0].label;
  const confidence = Math.round(sortedProbs[0].prob * 1000) / 10;

  return {
    matchedLabel: finalMatched,
    confidence,
    probabilities,
    features: {
      mfcc,
      chroma,
      mel
    }
  };
}

// Predefined system library of real-world sound simulation options
export interface BabySoundSample {
  id: string;
  title: string;
  label: CryLabel;
  description: string;
  durationSec: number;
}

export const SAMPLE_CRY_LIBRARY: BabySoundSample[] = [
  {
    id: 'sample_hungry',
    title: 'High pitch rhythmic crying (Hunger cues)',
    label: CryLabel.HUNGRY,
    description: 'Often repetitive, with an "neh" sound caused by sucking reflex',
    durationSec: 4.8
  },
  {
    id: 'sample_belly',
    title: 'Intense, high-pitched screaming (Belly Pain / Colic)',
    label: CryLabel.BELLY_PAIN,
    description: 'Sudden onset, full-bodied wailing, legs drawn up to the chest',
    durationSec: 5.0
  },
  {
    id: 'sample_tired',
    title: 'Slow, nasal whiny cry (Sleep deprivation)',
    label: CryLabel.TIRED,
    description: 'Stretched-out wailing showing sleep pressure and heavy eyelids',
    durationSec: 4.2
  },
  {
    id: 'sample_lonely',
    title: 'Intermittent whimpering (Loneliness)',
    label: CryLabel.LONELY,
    description: 'Soft quiet calls followed by silences, waiting for a hug or presence',
    durationSec: 3.5
  },
  {
    id: 'sample_laugh',
    title: 'Giggling and cooing sound (Happy Playtime)',
    label: CryLabel.LAUGH,
    description: 'Harmonious cooing, bubbling breath with sudden pitch variations',
    durationSec: 2.8
  }
];
