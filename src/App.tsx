import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Baby, History, Wrench, LogOut,
  ChevronRight, Clock, Loader2, Sparkles, Activity, TrendingUp,
  Info, ChevronDown
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import AudioUploader from './components/AudioUploader';
import AnalysisResults from './components/AnalysisResults';
import BabyProfiles from './components/BabyProfiles';
import ParentToolkit from './components/ParentToolkit';
import ScientificFeatures from './components/ScientificFeatures';
import { UserSession, BabyProfile, CryAnalysis, CryLabel } from './types';
import { simulateAudioAnalysis } from './utils/audioSimulation';
import { cryTypeDetails, emoji_map } from './constants/cryData';
import CryIcon from './components/CryIcon';

type AppMode = 'simulation' | 'localserver';
type Tab = 'analyze' | 'history' | 'toolkit' | 'babies';

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab>('analyze');
  const [selectedBabyId, setSelectedBabyId] = useState<string>('');

  const [apiMode, setApiMode] = useState<AppMode>('simulation');
  const [localServerUrl, setLocalServerUrl] = useState<string>('http://127.0.0.1:8000');
  const [localServerStatus, setLocalServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [apiError, setApiError] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<CryAnalysis | null>(null);
  const [activeAnalysisFile, setActiveAnalysisFile] = useState<{ name: string; duration: number } | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(null);

  const checkLocalServerHealth = async (urlToCheck: string = localServerUrl) => {
    setLocalServerStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${urlToCheck}/health`, { method: 'GET', mode: 'cors', signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) { setLocalServerStatus('connected'); setApiError(null); }
      else { setLocalServerStatus('disconnected'); }
    } catch { setLocalServerStatus('disconnected'); }
  };

  useEffect(() => {
    if (apiMode === 'localserver') checkLocalServerHealth();
  }, [apiMode, localServerUrl]);

  useEffect(() => {
    const saved = localStorage.getItem('nurture_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserSession(parsed);
        if (parsed.babies?.length > 0) setSelectedBabyId(parsed.babies[0].id);
      } catch { localStorage.removeItem('nurture_user_session'); }
    }
  }, []);

  const handleAuthSuccess = (session: UserSession) => {
    setUserSession(session);
    if (session.babies?.length > 0) setSelectedBabyId(session.babies[0].id);
  };

  const handleSignOut = () => {
    localStorage.removeItem('nurture_user_session');
    setUserSession(null); setShowAuth(false);
    setCurrentAnalysis(null); setActiveAnalysisFile(null); setSelectedBabyId('');
  };

  const handleSelectBaby = (babyId: string) => {
    setSelectedBabyId(babyId);
    setCurrentAnalysis(null); setActiveAnalysisFile(null);
  };

  const handleAddBabyProfile = (babyData: Omit<BabyProfile, 'id' | 'createdAt'>) => {
    if (!userSession) return;
    const newBaby: BabyProfile = { ...babyData, id: 'baby_' + Date.now(), createdAt: new Date().toISOString() };
    const updated: UserSession = { ...userSession, babies: [...userSession.babies, newBaby] };
    setUserSession(updated); setSelectedBabyId(newBaby.id);
    localStorage.setItem('nurture_user_session', JSON.stringify(updated));
    const saved = localStorage.getItem(`account_${userSession.email}`);
    if (saved) { try { const p = JSON.parse(saved); p.session = updated; localStorage.setItem(`account_${userSession.email}`, JSON.stringify(p)); } catch {} }
  };

  const handleSaveToHistory = () => {
    if (!userSession || !currentAnalysis || isSaved) return;
    const savedAnalysis: CryAnalysis = { ...currentAnalysis};
    const updated: UserSession = { ...userSession, history: [savedAnalysis, ...(userSession.history || [])] };
    setUserSession(updated); setIsSaved(true);
    localStorage.setItem('nurture_user_session', JSON.stringify(updated));
    const saved = localStorage.getItem(`account_${userSession.email}`);
    if (saved) { try { const p = JSON.parse(saved); p.session = updated; localStorage.setItem(`account_${userSession.email}`, JSON.stringify(p)); } catch {} }
  };

  const handleAnalyzeAnother = () => {
    setCurrentAnalysis(null); setActiveAnalysisFile(null); setApiError(null); setIsSaved(false);
  };

  const handleAnalyzeAudio = async (fileName: string, durationSec: number, fileObj?: File | Blob) => {
    setIsAnalyzing(true); setCurrentAnalysis(null); setApiError(null);
    setActiveAnalysisFile({ name: fileName, duration: durationSec }); setIsSaved(false);
    setAnalysisProgress(0);

    if (apiMode === 'localserver') {
      try {
        let binaryFile = fileObj;
        if (!binaryFile) binaryFile = new Blob([new Uint8Array([0,1,2,3,4])], { type: 'audio/wav' });
        const formData = new FormData(); formData.append('file', binaryFile, fileName);
        const response = await fetch(`${localServerUrl}/predict`, { method: 'POST', body: formData });
        if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
        const results = await response.json();
        setCurrentAnalysis({ id: 'ana_' + Date.now(), babyId: selectedBabyId, timestamp: new Date().toISOString(), fileName, durationSec, matchedLabel: results.matchedLabel as CryLabel, confidence: results.confidence, probabilities: results.probabilities, features: results.features });
        setIsAnalyzing(false); setAnalysisProgress(100);
      } catch (err: any) {
        setApiError(`Could not reach Python server (${localServerUrl}). Falling back to simulation…`);
        let progress = 0;
        const interval = setInterval(() => { progress += 10 + Math.random() * 8; if (progress >= 100) { progress = 100; clearInterval(interval); } setAnalysisProgress(Math.min(progress, 100)); }, 130);
        await new Promise(r => setTimeout(r, 1500));
        clearInterval(interval); setAnalysisProgress(100);
        const results = simulateAudioAnalysis(fileName, durationSec);
        setCurrentAnalysis({ id: 'ana_' + Date.now(), babyId: selectedBabyId, timestamp: new Date().toISOString(), fileName, durationSec, ...results });
        setIsAnalyzing(false);
      }
    } else {
      let progress = 0;
      const interval = setInterval(() => { progress += 10 + Math.random() * 8; if (progress >= 100) { progress = 100; clearInterval(interval); } setAnalysisProgress(Math.min(progress, 100)); }, 130);
      await new Promise(r => setTimeout(r, 1800));
      clearInterval(interval); setAnalysisProgress(100);
      const results = simulateAudioAnalysis(fileName, durationSec);
      setCurrentAnalysis({ id: 'ana_' + Date.now(), babyId: selectedBabyId, timestamp: new Date().toISOString(), fileName, durationSec, ...results });
      setIsAnalyzing(false);
    }
  };

  // ── Unauthenticated views ─────────────────────────────────────────
  if (!userSession) {
    if (!showAuth) return <LandingPage onGetStarted={() => setShowAuth(true)} />;
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // ── Authenticated dashboard ───────────────────────────────────────
  const selectedBaby = userSession.babies.find(b => b.id === selectedBabyId);
  const babyFilteredHistory = (userSession.history || []).filter(h => h.babyId === selectedBabyId);
  const allHistory = (userSession.history || []).slice(0, 30);

  const navTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'analyze', label: 'Analyze', icon: <Activity className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'toolkit', label: 'Sounds', icon: <Wrench className="w-4 h-4" /> },
    { id: 'babies', label: 'Babies', icon: <Baby className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FAFAF7' }}>

      {/* ── Top Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#ECE7DD] glass">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#33614A] flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[14.5px] font-bold text-[#1C1C18] tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Nurture</span>
            {apiMode === 'localserver' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>Python API</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedBaby && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => setActiveTab('babies')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F5F2EE] hover:bg-[#EDE8E2] border border-[#E8E2D8] cursor-pointer transition-all">
                <Baby className="w-3.5 h-3.5 text-[#33614A]" strokeWidth={1.75} />
                <span className="text-xs font-semibold text-[#3A3A33]">{selectedBaby.name}</span>
                <span className="text-[10px] text-[#9C9A8E]">{selectedBaby.ageMonths}mo</span>
              </motion.button>
            )}
            <button type="button" onClick={handleSignOut} title="Sign out"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9C9A8E] hover:text-[#6B6A61] hover:bg-[#F5F2EE] cursor-pointer transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-7 pb-28">
        <AnimatePresence mode="wait">

          {/* ━━ ANALYZE TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'analyze' && (
            <React.Fragment key="analyze">
            <motion.div  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>

              <div className="mb-6">
                <h1 className="text-[22px] font-bold text-[#1C1C18] tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Cry Analysis</h1>
                <p className="text-sm text-[#7A776C] mt-0.5">Upload or record audio to decode your baby's need</p>
              </div>

              {/* Desktop: 2-col, mobile: stack */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left panel */}
                <div className="lg:col-span-5 space-y-5">

                  {/* Baby selector */}
                  {userSession.babies.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {userSession.babies.map(baby => {
                        const isActive = baby.id === selectedBabyId;
                        return (
                          <motion.button key={baby.id} whileTap={{ scale: 0.95 }} type="button" onClick={() => handleSelectBaby(baby.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isActive ? 'bg-[#33614A] text-white border-[#33614A] shadow-sm' : 'bg-white text-[#4A4840] border-[#E8E2D8] hover:border-[#C8C4BC]'}`}>
                            <Baby className="w-3 h-3" strokeWidth={2} /> {baby.name} · {baby.ageMonths}mo
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {!selectedBabyId && userSession.babies.length === 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FBF1E6] border border-[#F0D9BC] text-sm text-[#7A4A20]">
                      <Sparkles className="w-4 h-4 shrink-0 text-[#C07E4B]" />
                      Add a baby profile first.
                      <button type="button" onClick={() => setActiveTab('babies')} className="ml-auto text-xs font-bold text-[#C07E4B] hover:text-[#9A5E30] cursor-pointer">Add baby →</button>
                    </div>
                  )}

                  {/* API mode toggle */}
                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#9C9A8E]" style={{ fontFamily: 'Nunito, sans-serif' }}>Analysis Mode</span>
                      <div className="flex bg-[#F5F2EE] border border-[#E8E2D8] p-0.5 rounded-xl gap-0.5">
                        {[{ id: 'simulation', label: 'Sandbox' }, { id: 'localserver', label: 'Python API' }].map(m => (
                          <button key={m.id} type="button" id={`api-mode-btn-${m.id}`}
                            onClick={() => { setApiMode(m.id as AppMode); setApiError(null); }}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${apiMode === m.id ? (m.id === 'simulation' ? 'bg-[#7FAE96] text-white shadow-sm' : 'bg-[#C07E4B] text-white shadow-sm') : 'text-[#7A776C] hover:text-[#4A4840]'}`}>
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {apiMode === 'localserver' && (
                      <div className="space-y-2.5 p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE7DC]">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-[#5C5A52] uppercase tracking-wider" style={{ fontFamily: 'Nunito, sans-serif' }}>FastAPI Endpoint</span>
                          <span className={`flex items-center gap-1.5 font-bold ${localServerStatus === 'connected' ? 'text-emerald-600' : localServerStatus === 'checking' ? 'text-blue-500' : 'text-red-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${localServerStatus === 'connected' ? 'bg-emerald-500' : localServerStatus === 'checking' ? 'bg-blue-500 animate-ping' : 'bg-red-500'}`} />
                            {localServerStatus === 'connected' ? 'Connected' : localServerStatus === 'checking' ? 'Checking…' : 'Offline'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={localServerUrl} onChange={e => setLocalServerUrl(e.target.value)}
                            className="flex-1 bg-white border border-[#E9E1D6] rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-[#4A4840] focus:ring-1 focus:ring-[#C07E4B] outline-none" />
                          <button type="button" onClick={() => checkLocalServerHealth()}
                            className="px-3 bg-white text-[#6C5F4F] border border-[#E8E2D8] hover:bg-[#F5F2EE] rounded-lg text-[11px] font-bold cursor-pointer transition-all">Ping</button>
                        </div>
                        {localServerStatus === 'disconnected' && (
                          <p className="text-[11px] text-red-700 bg-red-50 border border-red-100 rounded-lg p-2.5 leading-relaxed">
                            Place <code className="font-mono">best_model.pkl</code> &amp; <code className="font-mono">scaler.pkl</code> in <code className="font-mono">/backend</code> then run: <code className="font-mono block mt-1 text-[10px] bg-red-100 p-1 rounded">uvicorn main:app --reload</code>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {apiError && (
                    <div className="flex items-start gap-2 p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                      <p className="leading-relaxed">{apiError}</p>
                    </div>
                  )}

                  {/* Audio uploader */}
                  <AudioUploader onAudioReady={handleAnalyzeAudio} isAnalyzing={isAnalyzing} />

                  {/* Soothing Toolkit */}
                  <ParentToolkit />
                </div>

                {/* Right panel */}
                <div className="lg:col-span-7 space-y-5">
                  <AnimatePresence mode="wait">
                    {isAnalyzing ? (
                      <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                        className="card p-10 text-center min-h-[380px] flex flex-col items-center justify-center gap-5">
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="#F0EDE6" strokeWidth="5" />
                            <motion.circle cx="32" cy="32" r="28" fill="none" stroke="#33614A" strokeWidth="5" strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 28}
                              animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - analysisProgress / 100) }}
                              transition={{ duration: 0.2 }} />
                          </svg>
                          <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-[#33614A] animate-spin" />
                        </div>
                        <div>
                          <h3 className="text-[16px] font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>Analyzing Sound Signature…</h3>
                          <p className="text-sm text-[#9C9A8E] mt-1">Processing: <span className="font-mono font-bold text-[#33614A]">{activeAnalysisFile?.name}</span></p>
                          <p className="text-xs text-[#C07E4B] font-bold bg-[#FBF1E6] border border-[#EDD9C0] py-1.5 px-3.5 rounded-full mt-3 inline-block" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            Extracting MFCC · Chroma · Mel features
                          </p>
                        </div>
                        <div className="w-full max-w-xs">
                          <div className="h-1.5 bg-[#F0EDE6] rounded-full overflow-hidden">
                            <motion.div className="h-full bg-[#33614A] rounded-full" animate={{ width: `${analysisProgress}%` }} transition={{ duration: 0.2 }} />
                          </div>
                          <p className="text-xs font-mono text-[#C8C4BC] mt-1.5 text-center">{Math.round(analysisProgress)}%</p>
                        </div>
                      </motion.div>
                    ) : currentAnalysis ? (
                      <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                        <AnalysisResults
                          result={currentAnalysis}
                          onSaveToHistory={handleSaveToHistory}
                          onAnalyzeAnother={handleAnalyzeAnother}
                          isSaved={isSaved}
                        />
                        <ScientificFeatures analysis={currentAnalysis} />
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="card p-10 text-center min-h-[380px] flex flex-col items-center justify-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-[#E9F1EC] flex items-center justify-center">
                          <Baby className="w-8 h-8 text-[#33614A]" strokeWidth={1.5} />
                        </div>
                        <div className="max-w-sm">
                          <h3 className="text-[16px] font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Ready to listen to {selectedBaby?.name || 'your baby'}'s voice
                          </h3>
                          <p className="text-sm text-[#9C9A8E] mt-2 leading-relaxed">
                            Select a sample from the library, upload a recording, or tap Record to analyze frequency patterns.
                          </p>
                        </div>
                        <div className="w-full max-w-sm border border-[#E8E2D8] bg-[#FAFAF7] p-4 rounded-2xl text-left text-sm text-[#6C5F4F] space-y-2.5">
                          <p className="font-bold text-[#3B4E3F] text-xs uppercase tracking-wider mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>Recording tips</p>
                          {['Hold device 1–2m from your baby', 'Reduce background noise (fans, screens)', 'Aim for 3–6 seconds of uninterrupted sound'].map((tip, i) => (
                            <div key={i} className="flex gap-2 items-start text-xs">
                              <span className="text-[#7FAE96] font-black">✓</span><span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* History log for selected baby */}
                  <div className="card p-5">
                    <h3 className="text-[14px] font-bold text-[#1C1C18] flex items-center gap-2 border-b border-[#F1EDE4] pb-3 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <History className="w-4 h-4 text-[#7FAE96]" />
                      {selectedBaby?.name || 'Baby'}'s History ({babyFilteredHistory.length})
                    </h3>
                    {babyFilteredHistory.length === 0 ? (
                      <p className="text-xs text-[#9C9A8E] italic text-center py-4">No saved logs yet. Save an analysis above.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {babyFilteredHistory.slice(0, 10).map(item => (
                          <div key={item.id} className="p-3 bg-[#FAFAF7] border border-[#EDE7DC] rounded-xl flex justify-between items-start text-xs hover:border-[#7FAE96] transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <CryIcon label={item.matchedLabel} size={14} />
                              <span className="font-bold text-[#3B4E3F] truncate">{emoji_map[item.matchedLabel] || item.matchedLabel}</span>
                              <span className="font-mono font-bold text-[#7FAE96] shrink-0">{item.confidence.toFixed(1)}%</span>
                            </div>
                            <span className="text-[10px] text-[#9C9A8E] font-mono shrink-0 ml-2">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cry Encyclopedia section */}
              <section className="mt-12 border-t-2 border-[#EDE7DC] pt-10" id="cry-dictionary-index">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <span className="text-[11px] bg-[#E3EBE6] text-[#2E5E41] px-4 py-1.5 rounded-full font-bold uppercase tracking-wider" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      Pediatric Reference
                    </span>
                    <h2 className="text-[22px] font-bold text-[#1C1C18] mt-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Infant Cry Encyclopedia</h2>
                    <p className="text-sm text-[#9C9A8E] mt-1.5 max-w-lg mx-auto leading-relaxed">
                      Signs, acoustic patterns, and soothing techniques for all 11 cry categories.
                    </p>
                  </div>

                  <div className="space-y-1.5 card p-4">
                    {cryTypeDetails.map((detail) => {
                      const isExpanded = expandedCatalogId === detail.label;
                      return (
                        <div key={detail.label} id={`dict-accordion-item-${detail.label}`} className="border-b last:border-0 border-[#F5EDE2] last:pb-0 pb-2.5 mb-2.5 last:mb-0">
                          <button type="button" id={`dict-btn-toggle-${detail.label}`}
                            onClick={() => setExpandedCatalogId(isExpanded ? null : detail.label)}
                            className="w-full flex items-center justify-between py-2 text-left cursor-pointer">
                            <span className="flex items-center gap-2.5">
                              <CryIcon label={detail.label} size={18} />
                              <span className="text-sm font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>{detail.emoji} {emoji_map[detail.label]}</span>
                            </span>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown className="w-4 h-4 text-[#9C9A8E]" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }} className="overflow-hidden" id={`expanded-desc-${detail.label}`}>
                                <div className="pl-6 pr-2 pb-3 space-y-3 text-xs text-[#554A3C]">
                                  <p className="text-sm text-[#4A4840] leading-relaxed bg-[#FFFDFB] border border-[#EDE7DC] p-3 rounded-xl">{detail.description}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-[#FAFAF7] border border-[#E9E1D6] p-3 rounded-xl">
                                      <h4 className="font-bold text-[#3B4E3F] uppercase text-[10px] tracking-wider mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Observable Signs</h4>
                                      <ul className="list-disc pl-4 space-y-1 text-sm text-[#6C5F4F]">{detail.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                    </div>
                                    <div className="bg-[#F2FAF6] border border-[#BACFC1] p-3 rounded-xl">
                                      <h4 className="font-bold text-[#2E5E41] uppercase text-[10px] tracking-wider mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Soothing Steps</h4>
                                      <ul className="list-disc pl-4 space-y-1 text-sm text-[#3B5C46]">{detail.soothingTechniques.map((st, i) => <li key={i}>{st}</li>)}</ul>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </motion.div>
            </React.Fragment>
          )}

          {/* ━━ HISTORY TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-5">
              <div>
                <h1 className="text-[22px] font-bold text-[#1C1C18] tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Analysis History</h1>
                <p className="text-sm text-[#7A776C] mt-0.5">{allHistory.length} saved recording{allHistory.length !== 1 ? 's' : ''} across all profiles</p>
              </div>

              {allHistory.length === 0 ? (
                <div className="card p-14 text-center">
                  <div className="w-12 h-12 bg-[#F5F2EE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <History className="w-6 h-6 text-[#C8C4BC]" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-bold text-[#4A4840]" style={{ fontFamily: 'Poppins, sans-serif' }}>No recordings yet</p>
                  <p className="text-xs text-[#9C9A8E] mt-1">Analyze a cry and save it to see your history here</p>
                  <button type="button" onClick={() => setActiveTab('analyze')} className="mt-4 text-xs font-bold text-[#33614A] hover:text-[#2A4F3D] cursor-pointer">Start analyzing →</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {allHistory.map((h, idx) => {
                    const baby = userSession.babies.find(b => b.id === h.babyId);
                    const date = new Date(h.timestamp);
                    return (
                      <motion.div key={h.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.25 }}
                        className="card p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F5F2EE] flex items-center justify-center shrink-0">
                            <CryIcon label={h.matchedLabel} size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-[#1C1C18] capitalize" style={{ fontFamily: 'Poppins, sans-serif' }}>{emoji_map[h.matchedLabel] || h.matchedLabel}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#E9F1EC] text-[#2E5E41] font-bold tabular-nums" style={{ fontFamily: 'Nunito, sans-serif' }}>{h.confidence}%</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {baby && <span className="text-xs text-[#9C9A8E]">{baby.name}</span>}
                              {baby && <span className="text-[#DDD8CF] text-xs">·</span>}
                              <Clock className="w-3 h-3 text-[#C8C4BC]" />
                              <span className="text-xs text-[#9C9A8E]">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#C8C4BC] shrink-0" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {allHistory.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#33614A]" />
                    <h3 className="text-sm font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>Most common patterns</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(allHistory.reduce((acc, h) => { acc[h.matchedLabel as string] = (acc[h.matchedLabel as string] || 0) + 1; return acc; }, {} as Record<string, number>))
                      .sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 5).map(([label, count]) => (
                        <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F2EE] border border-[#E8E2D8]">
                          <CryIcon label={label as CryLabel} size={12} />
                          <span className="text-xs text-[#4A4840] capitalize font-medium">{emoji_map[label as CryLabel] || label}</span>
                          <span className="text-[10px] text-[#9C9A8E] tabular-nums">×{count}</span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ━━ TOOLKIT TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'toolkit' && (
            <motion.div key="toolkit" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-5 max-w-xl">
              <div>
                <h1 className="text-[22px] font-bold text-[#1C1C18] tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Soothing Toolkit</h1>
                <p className="text-sm text-[#7A776C] mt-0.5">Calming soundscapes to help your baby settle</p>
              </div>
              <ParentToolkit />
            </motion.div>
          )}

          {/* ━━ BABIES TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'babies' && (
            <motion.div key="babies" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-5 max-w-2xl">
              <div>
                <h1 className="text-[22px] font-bold text-[#1C1C18] tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Baby Profiles</h1>
                <p className="text-sm text-[#7A776C] mt-0.5">Manage your little ones</p>
              </div>
              <BabyProfiles babies={userSession.babies} selectedBabyId={selectedBabyId} onSelectBaby={handleSelectBaby} onAddBaby={handleAddBabyProfile} />
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#9C9A8E] uppercase tracking-widest font-bold mb-0.5" style={{ fontFamily: 'Nunito, sans-serif' }}>Signed in as</p>
                    <p className="text-sm font-bold text-[#1C1C18]" style={{ fontFamily: 'Poppins, sans-serif' }}>{userSession.name}</p>
                    <p className="text-xs text-[#7A776C]">{userSession.email}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="button" onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#7A776C] border border-[#E8E2D8] rounded-xl hover:bg-[#F5F2EE] cursor-pointer transition-all">
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Bottom Nav ───────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-[#ECE7DD] bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex">
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} type="button" id={`nav-tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 relative cursor-pointer transition-all ${isActive ? 'text-[#33614A]' : 'text-[#B0A89A] hover:text-[#7A776C]'}`}>
                  {isActive && (
                    <motion.div layoutId="navIndicator" className="absolute top-0 left-2 right-2 h-[2px] bg-[#33614A] rounded-b-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                  <motion.div animate={{ scale: isActive ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                    {tab.icon}
                  </motion.div>
                  <span className={`text-[10px] font-bold ${isActive ? 'text-[#33614A]' : 'text-[#B0A89A]'}`} style={{ fontFamily: 'Nunito, sans-serif' }}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}