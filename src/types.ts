/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CryLabel {
  BELLY_PAIN = 'belly pain',
  BURPING = 'burping',
  COLD_HOT = 'cold_hot',
  DISCOMFORT = 'discomfort',
  HUNGRY = 'hungry',
  LAUGH = 'laugh',
  LONELY = 'lonely',
  NOISE = 'noise',
  SCARED = 'scared',
  SILENCE = 'silence',
  TIRED = 'tired'
}

export interface BabyProfile {
  id: string;
  name: string;
  ageMonths: number;
  gender: 'boy' | 'girl' | 'surprise';
  createdAt: string;
}

export interface CryAnalysis {
  id: string;
  babyId: string;
  timestamp: string;
  fileName: string;
  durationSec: number;
  matchedLabel: CryLabel;
  confidence: number;
  probabilities: Record<CryLabel, number>;
  features: {
    mfcc: number[];    // representation of first few mfcc bands
    chroma: number[];  // representation of pitch classes
    mel: number[];     // representation of mel spectral energy
  };
  notes?: string;
}

export interface UserSession {
  uid: string; 
  email: string;
  name: string;
  babies: BabyProfile[];
  history: CryAnalysis[];
}

export interface CryTypeDetails {
  label: CryLabel;
  name: string;
  emoji: string;
  advice?: string;
  description: string;
  symptoms: string[];
  soothingTechniques: string[];
}
