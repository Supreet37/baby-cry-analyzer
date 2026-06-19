import React from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Activity, TrendingUp, AlertCircle, CheckCircle, Volume2 } from 'lucide-react';
import { CryAnalysis, CryLabel } from '../types';
import { cryTypeDetails, emoji_map } from '../constants/cryData';
import CryIcon from './CryIcon';

interface AnalysisResultsProps {
  result: CryAnalysis;
  onSaveToHistory: () => void;
  onAnalyzeAnother: () => void;
  isSaved: boolean;
  audioBlob?: File | Blob | null;
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-emerald-600 bg-emerald-50';
  if (confidence >= 60) return 'text-amber-600 bg-amber-50';
  return 'text-orange-600 bg-orange-50';
};

const getConfidenceLevel = (confidence: number) => {
  if (confidence >= 80) return 'High confidence';
  if (confidence >= 60) return 'Medium confidence';
  return 'Low confidence - observe more';
};

export default function AnalysisResults({ 
  result, 
  onSaveToHistory, 
  onAnalyzeAnother, 
  isSaved,
  audioBlob
}: AnalysisResultsProps) {
  // Format confidence to 1 decimal place
  const formattedConfidence = result.confidence.toFixed(1);
  const confidenceNumber = parseFloat(formattedConfidence);
  const confidenceColor = getConfidenceColor(confidenceNumber);
  const confidenceLevel = getConfidenceLevel(confidenceNumber);
  
  const cryDetail = cryTypeDetails.find(d => d.label === result.matchedLabel);
  const emoji = emoji_map[result.matchedLabel] || result.matchedLabel;
  
  // Get top 3 probabilities
  const topProbabilities = result.probabilities 
    ? Object.entries(result.probabilities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  // Create a playable URL from the blob if available
  const audioUrl = React.useMemo(() => {
    if (!audioBlob) return null;
    return URL.createObjectURL(audioBlob);
  }, [audioBlob]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 space-y-5"
    >
      {/* Header with confidence - FULLY RESPONSIVE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#33614A] to-[#7FAE96] flex items-center justify-center shrink-0">
            <CryIcon label={result.matchedLabel} size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-lg font-bold text-[#1C1C18] truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {emoji} {result.matchedLabel}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${confidenceColor} whitespace-nowrap`}>
                {formattedConfidence}% confidence
              </span>
              <span className="text-xs text-[#9C9A8E] break-words">{confidenceLevel}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto">
          {!isSaved && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSaveToHistory}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#33614A] text-white rounded-lg hover:bg-[#2A4F3D] transition-colors flex-1 sm:flex-none"
            >
              <Save className="w-3.5 h-3.5" />
              Save to History
            </motion.button>
          )}
          {isSaved && (
            <div className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg flex-1 sm:flex-none">
              <CheckCircle className="w-3.5 h-3.5" />
              Saved
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAnalyzeAnother}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#7A776C] bg-[#F5F2EE] rounded-lg hover:bg-[#EDE8E2] transition-colors flex-1 sm:flex-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Analyze Another
          </motion.button>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[#7A776C]">
          <span>Confidence score</span>
          <span className="font-bold text-[#33614A]">{formattedConfidence}%</span>
        </div>
        <div className="h-2 bg-[#F0EDE6] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidenceNumber}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              confidenceNumber >= 80 ? 'bg-emerald-500' :
              confidenceNumber >= 60 ? 'bg-amber-500' : 'bg-orange-500'
            }`}
          />
        </div>
      </div>

      {/* Audio Playback */}
      {audioUrl && (
        <div className="p-4 rounded-xl bg-[#F7F5F2] border border-[#EAE6E0] space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-[#5C8A6B]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#9C9A8E]">Playback</span>
          </div>
          <audio
            controls
            src={audioUrl}
            className="w-full h-10 rounded-lg"
            style={{ 
              accentColor: '#33614A',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px'
            }}
          />
        </div>
      )}

      {/* Description */}
      {cryDetail && (
        <div className="p-4 rounded-xl bg-[#FAFAF7] border border-[#EDE7DC]">
          <p className="text-sm text-[#4A4840] leading-relaxed">{cryDetail.description}</p>
        </div>
      )}

      {/* Top probabilities */}
      {topProbabilities.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#9C9A8E]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9C9A8E]">Other possibilities</h4>
          </div>
          <div className="space-y-1.5">
            {topProbabilities.map(([label, prob]) => {
              if (label === result.matchedLabel) return null;
              return (
                <div key={label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CryIcon label={label as CryLabel} size={14} />
                    <span className="text-[#6B6A61] capitalize">{emoji_map[label as CryLabel] || label}</span>
                  </div>
                  <span className="font-mono text-xs text-[#9C9A8E]">{(prob * 100).toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recording info */}
      <div className="pt-3 border-t border-[#EDE7DC] flex items-center justify-between text-xs text-[#9C9A8E]">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" />
          <span>{result.fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{result.durationSec.toFixed(1)}s recording</span>
          <span>•</span>
          <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Soothing tips */}
      {cryDetail && cryDetail.soothingTechniques && (
        <div className="p-4 rounded-xl bg-[#F2FAF6] border border-[#BACFC1]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E5E41] mb-2">Soothing Tips</h4>
          <ul className="space-y-1.5">
            {cryDetail.soothingTechniques.slice(0, 3).map((tip, idx) => (
              <li key={idx} className="text-sm text-[#3B5C46] flex items-start gap-2">
                <span className="text-[#7FAE96]">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}