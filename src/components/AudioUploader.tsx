import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Mic, Square, AlertCircle, Volume2, Play, Sparkles } from 'lucide-react';
import { SAMPLE_CRY_LIBRARY, BabySoundSample } from '../utils/audioSimulation';
import SoundWaveform from './SoundWaveform';
import { CryLabel } from '../types';

interface AudioUploaderProps {
  onAudioReady: (fileName: string, durationSec: number, fileObj?: File | Blob) => void;
  isAnalyzing: boolean;
}

export default function AudioUploader({ onAudioReady, isAnalyzing }: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [selectedSample, setSelectedSample] = useState<BabySoundSample | null>(null);
  const [isPlayingSample, setIsPlayingSample] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const synthGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const recordTimerRef = useRef<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); setErrorText('');
    if (isAnalyzing) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('audio/') || /\.(wav|mp3|ogg|m4a)$/i.test(file.name)) {
        setSelectedSample(null);
        onAudioReady(file.name, Math.round(file.size / 48000) || 5.0, file);
      } else { setErrorText('Please upload a WAV, MP3, OGG, or M4A audio file.'); }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorText('');
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedSample(null);
      onAudioReady(file.name, Math.min(10, Math.max(3, Math.round(file.size / 40000))) || 4.5, file);
    }
  };

  const startRecording = async () => {
    setErrorText(''); setIsRecording(true); setRecordDuration(0); setSelectedSample(null);
    audioChunksRef.current = [];
    recordTimerRef.current = window.setInterval(() => {
      setRecordDuration(d => { if (d >= 10) { stopRecording(); return 10; } return d + 1; });
    }, 1000);
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        let recorder: MediaRecorder;
        try { recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); }
        catch (e) { recorder = new MediaRecorder(stream); }
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (event) => { if (event.data?.size > 0) audioChunksRef.current.push(event.data); };
        recorder.start();
      }
    } catch (e) { console.log('Mic unavailable, using simulation.', e); }
  };

  const stopRecording = () => {
    if (recordTimerRef.current) { window.clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
    const finalLen = recordDuration || 4.2;
    const fileName = `vocal_recording_${Date.now() % 100000}.wav`;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setIsRecording(false);
        onAudioReady(fileName, finalLen, audioBlob);
        audioStreamRef.current?.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
        mediaRecorderRef.current = null;
      };
      mediaRecorderRef.current.stop();
    } else { setIsRecording(false); onAudioReady(fileName, finalLen); }
  };

  const playSampleSoundSynth = (sample: BabySoundSample) => {
    if (isPlayingSample) { stopSamplePlayback(); return; }
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    contextRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
    gain.connect(ctx.destination);
    synthGainRef.current = gain;
    setIsPlayingSample(true); setSelectedSample(sample);
    const now = ctx.currentTime;

    const playNote = (freq: number, type: OscillatorType, duration: number, interval: number) => {
      const play = () => {
        if (!contextRef.current) return;
        const cNow = ctx.currentTime;
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, cNow);
        g.gain.setValueAtTime(0.001, cNow); g.gain.linearRampToValueAtTime(1.0, cNow + 0.08); g.gain.exponentialRampToValueAtTime(0.001, cNow + duration);
        osc.connect(g); g.connect(gain); osc.start(cNow); osc.stop(cNow + duration + 0.05);
      };
      play();
      timerRef.current = window.setInterval(play, interval);
    };

    if (sample.label === CryLabel.HUNGRY) playNote(410, 'triangle', 0.45, 750);
    else if (sample.label === CryLabel.BELLY_PAIN) playNote(580, 'sawtooth', 1.2, 1400);
    else if (sample.label === CryLabel.TIRED) playNote(360, 'sine', 1.8, 2400);
    else if (sample.label === CryLabel.LAUGH) playNote(650 + Math.random() * 150, 'sine', 0.2, 300);
    else playNote(400, 'sine', 0.8, 1600);

    setTimeout(() => stopSamplePlayback(), 4500);
  };

  const stopSamplePlayback = () => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    if (contextRef.current) { try { contextRef.current.close(); } catch (e) {} contextRef.current = null; }
    setIsPlayingSample(false);
  };

  const handleTriggerAnalysis = (sample: BabySoundSample) => {
    stopSamplePlayback(); setSelectedSample(sample);
    onAudioReady(`${sample.label}_sample_file.wav`, sample.durationSec);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4" id="audio-selection-hub">
      {/* Drop Zone */}
      <motion.div
        animate={{ borderColor: isDragging ? '#5C8A6B' : isRecording ? '#ef4444' : '#E8E4DE', backgroundColor: isDragging ? '#EBF4EE' : isRecording ? '#fef2f2' : '#FAFAF8' }}
        transition={{ duration: 0.15 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        id="uploader-main-dropzone"
        className="relative border-2 border-dashed rounded-2xl p-7 text-center"
      >
        <input id="audio-uploader-hidden-input" type="file" accept="audio/*" className="hidden" onChange={handleFileChange} disabled={isRecording || isAnalyzing} />

        <AnimatePresence mode="wait">
          {errorText && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-3 inset-x-3 p-2.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorText}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3" id="recording-active-view">
              <div className="flex items-center justify-center gap-2 mb-1">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                <span className="text-xs font-semibold text-red-600">Recording</span>
              </div>
              <p className="text-3xl font-bold font-mono text-[#1A1614] tabular-nums">
                00:{recordDuration.toString().padStart(2, '0')}
              </p>
              <div className="max-w-xs mx-auto">
                <SoundWaveform isActive={true} color="#ef4444" count={28} speedMs={90} />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="button" id="uploader-btn-stop" onClick={stopRecording}
                className="px-5 py-2.5 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-600 cursor-pointer inline-flex items-center gap-1.5 shadow-sm">
                <Square className="w-3.5 h-3.5 fill-white" /> Stop & Analyze
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3" id="standard-onboarding-view">
              <motion.div animate={{ y: isDragging ? -4 : 0 }} className="mx-auto w-14 h-14 rounded-2xl bg-white border border-[#E8E4DE] shadow-sm flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#7A716A]" strokeWidth={1.5} />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-[#1A1614]">
                  {isDragging ? 'Drop your audio file here' : 'Upload or record a cry audio'}
                </p>
                <p className="text-xs text-[#A8A09A] mt-1">WAV, MP3, OGG · max 10 seconds</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="button" id="uploader-btn-file-select"
                  onClick={() => document.getElementById('audio-uploader-hidden-input')?.click()}
                  disabled={isAnalyzing}
                  className="px-4 py-2.5 text-xs font-semibold bg-white text-[#4A4440] border border-[#E8E4DE] rounded-xl hover:bg-[#F5F2EE] cursor-pointer transition-all shadow-sm">
                  Choose File
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="button" id="uploader-btn-mic"
                  onClick={startRecording} disabled={isAnalyzing}
                  className="px-4 py-2.5 text-xs font-semibold bg-[#EBF4EE] text-[#3A6349] border border-[#A8CCAF] rounded-xl hover:bg-[#D6EAD9] cursor-pointer transition-all inline-flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" /> Record
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sample Library */}
      {/* <div className="bg-[#F7F5F2] border border-[#EAE6E0] p-5 rounded-2xl" id="preloaded-samples-playground">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#D4833A]" />
          <h3 className="text-sm font-semibold text-[#1A1614]">Sample Library</h3>
        </div>
        <p className="text-xs text-[#A8A09A] mb-4 pl-6">Listen to simulated cry types and trigger analysis</p>

        <div className="space-y-2">
          {SAMPLE_CRY_LIBRARY.map((sample, idx) => {
            const isThisSelected = selectedSample?.id === sample.id;
            const isThisPlaying = isPlayingSample && isThisSelected;
            return (
              <motion.div
                key={sample.id}
                id={`sample-row-${sample.id}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.25 }}
                className={`p-3.5 rounded-xl border bg-white transition-all ${isThisSelected ? 'border-[#A8CCAF] shadow-sm' : 'border-[#E8E4DE] hover:border-[#D5CFC8]'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF3E8] text-[#8C5420] font-semibold uppercase tracking-wide">{sample.label}</span>
                      <span className="text-sm font-medium text-[#1A1614] truncate">{sample.title}</span>
                    </div>
                    <p className="text-xs text-[#A8A09A] mt-0.5 pl-0.5 leading-relaxed">{sample.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" id={`btn-listen-${sample.id}`}
                      onClick={() => playSampleSoundSynth(sample)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border inline-flex items-center gap-1.5 cursor-pointer transition-all ${isThisPlaying ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-[#4A4440] border-[#E8E4DE] hover:bg-[#F5F2EE]'}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {isThisPlaying ? 'Stop' : 'Listen'}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" id={`btn-analyze-${sample.id}`}
                      onClick={() => handleTriggerAnalysis(sample)} disabled={isAnalyzing}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#5C8A6B] text-white rounded-lg hover:bg-[#4E7A5C] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                      Analyze
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div> */}
    </div>
  );
}
