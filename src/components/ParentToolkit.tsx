import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sliders, Wind, Waves, Music2, CloudRain, Flame, Play, Square } from 'lucide-react';
import SoundWaveform from './SoundWaveform';

interface SoundOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  baseFreq: number;
  color: string;
  bgColor: string;
  borderColor: string;
  noiseType?: 'white' | 'pink' | 'brown';
  type?: OscillatorType;
}

const SOUND_OPTIONS: SoundOption[] = [
  { id: 'white', label: 'White Noise', description: 'All frequencies — pure masking sound', icon: <Wind className="w-4 h-4" />, baseFreq: 300, color: '#7A716A', bgColor: '#F5F2EE', borderColor: '#E0DBD5', noiseType: 'white' },
  { id: 'pink', label: 'Pink Noise', description: 'Warm frequency balance, deeply soothing', icon: <Waves className="w-4 h-4" />, baseFreq: 200, color: '#5C8A6B', bgColor: '#EBF4EE', borderColor: '#A8CCAF', noiseType: 'pink' },
  { id: 'brown', label: 'Brown Noise', description: 'Deep rumble like in-womb sounds', icon: <CloudRain className="w-4 h-4" />, baseFreq: 100, color: '#8B5E3C', bgColor: '#F5EEE7', borderColor: '#DCC4A8', noiseType: 'brown' },
  { id: 'lullaby', label: 'Lullaby Tones', description: 'Gentle sine wave melody, sleep-inducing', icon: <Music2 className="w-4 h-4" />, baseFreq: 220, color: '#7C5CBF', bgColor: '#F0EBF8', borderColor: '#C9B8E8', type: 'sine' },
  { id: 'heartbeat', label: 'Womb Heartbeat', description: 'Rhythmic maternal heartbeat simulation', icon: <Flame className="w-4 h-4" />, baseFreq: 1.17, color: '#C4445E', bgColor: '#FCE8ED', borderColor: '#F0B8C4', type: 'sine' },
];

export default function ParentToolkit() {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const [showVolumeControl, setShowVolumeControl] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  const stopAllSounds = () => {
    try { noiseSourceRef.current?.stop(); } catch {}
    try { oscRef.current?.stop(); } catch {}
    try { lfoRef.current?.stop(); } catch {}
    noiseSourceRef.current = null; oscRef.current = null; lfoRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null; gainNodeRef.current = null;
    setActiveSoundId(null);
  };

  const startNoise = (option: SoundOption) => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    const gain = ctx.createGain(); gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + 0.3);
    gain.connect(ctx.destination); gainNodeRef.current = gain;

    if (option.noiseType) {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      if (option.noiseType === 'white') {
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      } else if (option.noiseType === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520; b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      } else {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02; lastOut = data[i]; data[i] *= 3.5;
        }
      }
      const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true;
      source.connect(gain); source.start(); noiseSourceRef.current = source;
    } else if (option.id === 'lullaby') {
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 349.23, 293.66];
      let i = 0;
      const playNextNote = () => {
        if (!audioCtxRef.current) return;
        const osc = ctx.createOscillator(); const noteGain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = notes[i % notes.length];
        noteGain.gain.setValueAtTime(0, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.1);
        noteGain.gain.setValueAtTime(volume * 0.3, ctx.currentTime + 0.4);
        noteGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.65);
        osc.connect(noteGain); noteGain.connect(gain);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.7);
        i++; oscRef.current = osc;
        setTimeout(playNextNote, 700);
      };
      playNextNote();
    } else if (option.id === 'heartbeat') {
      const playBeat = () => {
        if (!audioCtxRef.current) return;
        const osc = ctx.createOscillator(); const beatGain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
        beatGain.gain.setValueAtTime(0, ctx.currentTime);
        beatGain.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.04);
        beatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(beatGain); beatGain.connect(gain);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25); oscRef.current = osc;
        setTimeout(playBeat, 850);
      };
      playBeat();
    }
  };

  const handleToggleSound = (option: SoundOption) => {
    if (activeSoundId === option.id) { stopAllSounds(); return; }
    stopAllSounds();
    startNoise(option); setActiveSoundId(option.id);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (gainNodeRef.current) gainNodeRef.current.gain.setValueAtTime(v * 0.4, gainNodeRef.current.context.currentTime);
  };

  const activeOption = SOUND_OPTIONS.find(o => o.id === activeSoundId);

  return (
    <div className="card p-6" id="parent-toolkit-container">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F0EBF8] flex items-center justify-center">
            <Music2 className="w-4 h-4 text-[#7C5CBF]" strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-semibold text-[#1A1614]">Soothing Soundscape</h3>
        </div>
        <button type="button" onClick={() => setShowVolumeControl(v => !v)} id="btn-toggle-volume-panel"
          className="text-xs flex items-center gap-1.5 text-[#7A716A] hover:text-[#4A4440] cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-[#F5F2EE] transition-all">
          <Sliders className="w-3.5 h-3.5" /> Volume
        </button>
      </div>

      {/* Waveform & active status */}
      <div className="mb-5 p-3.5 rounded-xl border border-[#EAE6E0] bg-[#F7F5F2] min-h-[80px] flex items-center">
        {activeSoundId && activeOption ? (
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-[#5C8A6B]" />
                <span className="text-xs font-semibold text-[#1A1614]">{activeOption.label}</span>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} id="btn-stop-toolkit-audio" type="button" onClick={stopAllSounds}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 cursor-pointer transition-all">
                <Square className="w-3 h-3 fill-current" /> Stop
              </motion.button>
            </div>
            <SoundWaveform isActive={true} color={activeOption.color} count={30} speedMs={70} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
            <VolumeX className="w-6 h-6 text-[#C4BAB0] mb-1.5" strokeWidth={1.5} />
            <p className="text-xs text-[#A8A09A]">Select a sound to begin</p>
          </div>
        )}
      </div>

      {/* Volume Control */}
      <AnimatePresence>
        {showVolumeControl && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
            <div className="flex items-center gap-3 p-3.5 bg-[#F7F5F2] rounded-xl border border-[#EAE6E0]">
              <VolumeX className="w-4 h-4 text-[#A8A09A] shrink-0" />
              <input id="volume-range" type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} className="flex-1" />
              <Volume2 className="w-4 h-4 text-[#7A716A] shrink-0" />
              <span className="text-xs font-mono text-[#7A716A] w-8 text-right">{Math.round(volume * 100)}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound buttons grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {SOUND_OPTIONS.map((opt, idx) => {
          const isActive = activeSoundId === opt.id;
          return (
            <motion.button
              key={opt.id}
              id={`toolkit-sound-btn-${opt.id}`}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleToggleSound(opt)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all text-left ${isActive
                ? `border-[${opt.borderColor}] shadow-sm`
                : 'border-[#EAE6E0] hover:border-[#D5CFC8] bg-white'
              }`}
              style={isActive ? { backgroundColor: opt.bgColor, borderColor: opt.borderColor } : {}}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
                  style={isActive ? { backgroundColor: opt.bgColor, borderColor: opt.borderColor, color: opt.color } : { backgroundColor: '#F5F2EE', borderColor: '#E0DBD5', color: '#7A716A' }}>
                  {opt.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1614]">{opt.label}</p>
                  <p className="text-xs text-[#A8A09A]">{opt.description}</p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? 'text-white' : 'bg-[#F5F2EE] text-[#7A716A]'}`}
                style={isActive ? { backgroundColor: opt.color } : {}}>
                {isActive ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
