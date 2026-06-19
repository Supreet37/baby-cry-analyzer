import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Baby,
  History,
  Wrench,
  LogOut,
  ChevronRight,
  Clock,
  Loader2,
  Sparkles,
  Activity,
  TrendingUp,
  Info,
  ChevronDown,
  Code2,
  BookOpen,
} from "lucide-react";
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import AudioUploader from "./components/AudioUploader";
import AnalysisResults from "./components/AnalysisResults";
import BabyProfiles from "./components/BabyProfiles";
import ParentToolkit from "./components/ParentToolkit";
import ScientificFeatures from "./components/ScientificFeatures";
import Developer from "./components/Developer";
import LoadingScreen from "./pages/LoadingScreen"
import { UserSession, BabyProfile, CryAnalysis, CryLabel } from "./types";
import { cryTypeDetails, emoji_map } from "./constants/cryData";
import CryIcon from "./components/CryIcon";

type Tab = "analyze" | "history" | "toolkit" | "babies" | "developer";

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab>("analyze");
  const [selectedBabyId, setSelectedBabyId] = useState<string>("");

  const [localServerUrl] = useState<string>("http://127.0.0.1:8000");
  //const [localServerUrl] = useState<string>("https://babycryai.pythonanywhere.com");
  const [localServerStatus, setLocalServerStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const [apiError, setApiError] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<CryAnalysis | null>(
    null,
  );
  const [activeAnalysisFile, setActiveAnalysisFile] = useState<{
    name: string;
    duration: number;
  } | null>(null);
  const [currentAudioBlob, setCurrentAudioBlob] = useState<File | Blob | null>(
    null,
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(
    null,
  );

  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  const checkLocalServerHealth = async () => {
    setLocalServerStatus("checking");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${localServerUrl}/health`, {
        method: "GET",
        mode: "cors",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        setLocalServerStatus("connected");
        setApiError(null);
      } else {
        setLocalServerStatus("disconnected");
      }
    } catch {
      setLocalServerStatus("disconnected");
    }
  };

  useEffect(() => {
    checkLocalServerHealth();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("nurture_user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserSession(parsed);
        if (parsed.babies?.length > 0) setSelectedBabyId(parsed.babies[0].id);
      } catch {
        localStorage.removeItem("nurture_user_session");
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // ── SHOW LOADING SCREEN ──────────────────────────────────────────
  if (isAppLoading) {
    return <LoadingScreen />;
  }

  const handleAuthSuccess = (session: UserSession) => {
    setUserSession(session);
    if (session.babies?.length > 0) setSelectedBabyId(session.babies[0].id);
  };

  const handleSignOut = () => {
    localStorage.removeItem("nurture_user_session");
    setUserSession(null);
    setShowAuth(false);
    setCurrentAnalysis(null);
    setActiveAnalysisFile(null);
    setSelectedBabyId("");
  };

  const handleSelectBaby = (babyId: string) => {
    setSelectedBabyId(babyId);
    setCurrentAnalysis(null);
    setActiveAnalysisFile(null);
  };

  const handleAddBabyProfile = (
    babyData: Omit<BabyProfile, "id" | "createdAt">,
  ) => {
    if (!userSession) return;
    const newBaby: BabyProfile = {
      ...babyData,
      id: "baby_" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated: UserSession = {
      ...userSession,
      babies: [...userSession.babies, newBaby],
    };
    setUserSession(updated);
    setSelectedBabyId(newBaby.id);
    localStorage.setItem("nurture_user_session", JSON.stringify(updated));
    const saved = localStorage.getItem(`account_${userSession.email}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        p.session = updated;
        localStorage.setItem(`account_${userSession.email}`, JSON.stringify(p));
      } catch {}
    }
  };

  const handleEditBaby = (babyId: string, babyData: Omit<BabyProfile, 'id' | 'createdAt'>) => {
  if (!userSession) return;
  
  const updatedBabies = userSession.babies.map(baby => 
    baby.id === babyId 
      ? { ...baby, ...babyData }
      : baby
  );
  
  const updated: UserSession = {
    ...userSession,
    babies: updatedBabies,
  };
  
  setUserSession(updated);
  localStorage.setItem('nurture_user_session', JSON.stringify(updated));
};

const handleDeleteBaby = (babyId: string) => {
  if (!userSession) return;
  
  // Don't delete if it's the only baby
  if (userSession.babies.length <= 1) {
    alert('You need at least one baby profile.');
    return;
  }
  
  const updatedBabies = userSession.babies.filter(baby => baby.id !== babyId);
  
  // If the selected baby was deleted, select the first available baby
  let newSelectedId = selectedBabyId;
  if (selectedBabyId === babyId) {
    newSelectedId = updatedBabies[0]?.id || '';
  }
  
  const updated: UserSession = {
    ...userSession,
    babies: updatedBabies,
  };
  
  setUserSession(updated);
  setSelectedBabyId(newSelectedId);
  localStorage.setItem('nurture_user_session', JSON.stringify(updated));
};

  const handleSaveToHistory = () => {
    if (!userSession || !currentAnalysis || isSaved) return;
    const savedAnalysis: CryAnalysis = { ...currentAnalysis };
    const updated: UserSession = {
      ...userSession,
      history: [savedAnalysis, ...(userSession.history || [])],
    };
    setUserSession(updated);
    setIsSaved(true);
    localStorage.setItem("nurture_user_session", JSON.stringify(updated));
    const saved = localStorage.getItem(`nurture_session_${userSession.uid}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        p.session = updated;
        localStorage.setItem(`nurture_session_${userSession.uid}`, JSON.stringify(p));
      } catch {}
    }
  };

  const handleAnalyzeAnother = () => {
    setCurrentAnalysis(null);
    setActiveAnalysisFile(null);
    setApiError(null);
    setIsSaved(false);
    setCurrentAudioBlob(null);
  };

  const handleAnalyzeAudio = async (
    fileName: string,
    durationSec: number,
    fileObj?: File | Blob,
  ) => {
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    setApiError(null);
    setActiveAnalysisFile({ name: fileName, duration: durationSec });
    setIsSaved(false);
    setAnalysisProgress(0);
    setCurrentAudioBlob(fileObj || null);

    try {
      let binaryFile = fileObj;
      if (!binaryFile)
        binaryFile = new Blob([new Uint8Array([0, 1, 2, 3, 4])], {
          type: "audio/wav",
        });
      const formData = new FormData();
      formData.append("file", binaryFile, fileName);
      const response = await fetch(`${localServerUrl}/predict`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok)
        throw new Error((await response.text()) || `HTTP ${response.status}`);
      const results = await response.json();
      setCurrentAnalysis({
        id: "ana_" + Date.now(),
        babyId: selectedBabyId,
        timestamp: new Date().toISOString(),
        fileName,
        durationSec,
        matchedLabel: results.matchedLabel as CryLabel,
        confidence: results.confidence,
        probabilities: results.probabilities,
        features: results.features,
      });
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    } catch (err: any) {
      setApiError(
        `Could not reach Python server (${localServerUrl}). Please make sure the server is running.`,
      );
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  // ── Unauthenticated views ─────────────────────────────────────────
  if (!userSession) {
    if (!showAuth)
      return <LandingPage onGetStarted={() => setShowAuth(true)} />;
    return <AuthScreen onAuthSuccess={handleAuthSuccess} onBack={() => setShowAuth(false)}/>;
  }

  // ── Authenticated dashboard ───────────────────────────────────────
  const selectedBaby = userSession.babies.find((b) => b.id === selectedBabyId);
  const babyFilteredHistory = (userSession.history || []).filter(
    (h) => h.babyId === selectedBabyId,
  );
  const allHistory = (userSession.history || []).slice(0, 30);

  const navTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "analyze", label: "Analyze", icon: <Activity className="w-4 h-4" /> },
    { id: "history", label: "History", icon: <History className="w-4 h-4" /> },
    { id: "toolkit", label: "Sounds", icon: <Wrench className="w-4 h-4" /> },
    { id: "babies", label: "Babies", icon: <Baby className="w-4 h-4" /> },
    {
      id: "developer",
      label: "Developer",
      icon: <Code2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
      {/* ── Top Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#ECE7DD] glass">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <img
                src="/src/asset/icon.png"
                alt="NurtureAI Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="font-bold text-[#1C1C18] text-xl sm:text-2xl tracking-tight whitespace-nowrap"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              NurtureAI
            </span>
          </div>
            {/* {localServerStatus === "connected" && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200 font-bold"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Analyse your baby cry
              </span>
            )}
            {localServerStatus === "disconnected" && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-bold"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
              The services couldn't meet do you to server broke down
              </span>
            )} */}
          </div>

          <div className="flex items-center gap-2">
            {selectedBaby && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setActiveTab("babies")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F5F2EE] hover:bg-[#EDE8E2] border border-[#E8E2D8] cursor-pointer transition-all"
              >
                <Baby
                  className="w-3.5 h-3.5 text-[#33614A]"
                  strokeWidth={1.75}
                />
                <span className="text-xs font-semibold text-[#3A3A33]">
                  {selectedBaby.name}
                </span>
                <span className="text-[10px] text-[#9C9A8E]">
                  {selectedBaby.ageMonths}mo
                </span>
              </motion.button>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9C9A8E] hover:text-[#6B6A61] hover:bg-[#F5F2EE] cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Top Nav (laptop and above) ──────────────────────────── */}
      <nav className="hidden xl:flex sticky top-14 z-40 border-b border-[#ECE7DD] bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex justify-center gap-3 py-2">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl relative cursor-pointer transition-all ${
                    isActive
                      ? "text-[#33614A] bg-[#E9F1EC]"
                      : "text-[#B0A89A] hover:text-[#7A776C] hover:bg-[#F5F2EE]"
                  }`}
                >
                  {tab.icon}
                  <span
                    className={`text-sm font-bold ${isActive ? "text-[#33614A]" : "text-[#B0A89A]"}`}
                    style={{ fontFamily: "Nunito, sans-serif" }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-7 pb-28">
        <AnimatePresence mode="wait">
          {/* ━━ ANALYZE TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === "analyze" && (
            <React.Fragment key="analyze">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mb-6">
                  <h1
                    className="text-[22px] font-bold text-[#1C1C18] tracking-tight"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Cry Analysis
                  </h1>
                  <p className="text-sm text-[#7A776C] mt-0.5">
                    Upload or record audio to decode your baby's need
                  </p>
                </div>

                {/* Desktop: 2-col, mobile: stack */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left panel */}
                  <div className="lg:col-span-5 space-y-5">
                    {/* Baby selector */}
                    {userSession.babies.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {userSession.babies.map((baby) => {
                          const isActive = baby.id === selectedBabyId;
                          return (
                            <motion.button
                              key={baby.id}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => handleSelectBaby(baby.id)}
                              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isActive ? "bg-[#33614A] text-white border-[#33614A] shadow-sm" : "bg-white text-[#4A4840] border-[#E8E2D8] hover:border-[#C8C4BC]"}`}
                            >
                              <Baby className="w-3 h-3" strokeWidth={2} />{" "}
                              {baby.name} · {baby.ageMonths}mo
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {!selectedBabyId && userSession.babies.length === 0 && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FBF1E6] border border-[#F0D9BC] text-sm text-[#7A4A20]">
                        <Sparkles className="w-4 h-4 shrink-0 text-[#C07E4B]" />
                        Add a baby profile first.
                        <button
                          type="button"
                          onClick={() => setActiveTab("babies")}
                          className="ml-auto text-xs font-bold text-[#C07E4B] hover:text-[#9A5E30] cursor-pointer"
                        >
                          Add baby →
                        </button>
                      </div>
                    )}

                    {apiError && (
                      <div className="flex items-start gap-2 p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                        <p className="leading-relaxed">{apiError}</p>
                      </div>
                    )}

                    {/* Audio uploader */}
                    <AudioUploader
                      onAudioReady={handleAnalyzeAudio}
                      isAnalyzing={isAnalyzing}
                    />

                    {/* Soothing Toolkit */}
                    {/* <ParentToolkit /> */}
                  </div>

                  {/* Right panel */}
                  <div className="lg:col-span-7 space-y-5">
                    <AnimatePresence mode="wait">
                      {isAnalyzing ? (
                        <motion.div
                          key="analyzing"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          className="card p-10 text-center min-h-[380px] flex flex-col items-center justify-center gap-5"
                        >
                          <div className="relative w-16 h-16">
                            <svg
                              className="w-16 h-16 -rotate-90"
                              viewBox="0 0 64 64"
                            >
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="#F0EDE6"
                                strokeWidth="5"
                              />
                              <motion.circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="#33614A"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 28}
                                animate={{
                                  strokeDashoffset:
                                    2 *
                                    Math.PI *
                                    28 *
                                    (1 - analysisProgress / 100),
                                }}
                                transition={{ duration: 0.2 }}
                              />
                            </svg>
                            <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-[#33614A] animate-spin" />
                          </div>
                          <div>
                            <h3
                              className="text-[16px] font-bold text-[#1C1C18]"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              Analyzing Sound Signature…
                            </h3>
                            <p className="text-sm text-[#9C9A8E] mt-1">
                              Processing:{" "}
                              <span className="font-mono font-bold text-[#33614A]">
                                {activeAnalysisFile?.name}
                              </span>
                            </p>
                            <p
                              className="text-xs text-[#C07E4B] font-bold bg-[#FBF1E6] border border-[#EDD9C0] py-1.5 px-3.5 rounded-full mt-3 inline-block"
                              style={{ fontFamily: "Nunito, sans-serif" }}
                            >
                              Extracting MFCC · Chroma · Mel features
                            </p>
                          </div>
                          <div className="w-full max-w-xs">
                            <div className="h-1.5 bg-[#F0EDE6] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-[#33614A] rounded-full"
                                animate={{ width: `${analysisProgress}%` }}
                                transition={{ duration: 0.2 }}
                              />
                            </div>
                            <p className="text-xs font-mono text-[#C8C4BC] mt-1.5 text-center">
                              {Math.round(analysisProgress)}%
                            </p>
                          </div>
                        </motion.div>
                      ) : currentAnalysis ? (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-5"
                        >
                          <AnalysisResults
                            result={currentAnalysis}
                            onSaveToHistory={handleSaveToHistory}
                            onAnalyzeAnother={handleAnalyzeAnother}
                            isSaved={isSaved}
                            audioBlob={currentAudioBlob}
                          />
                          <ScientificFeatures analysis={currentAnalysis} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="card p-10 text-center min-h-[380px] flex flex-col items-center justify-center gap-5"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-[#E9F1EC] flex items-center justify-center">
                            <Baby
                              className="w-8 h-8 text-[#33614A]"
                              strokeWidth={1.5}
                            />
                          </div>
                          <div className="max-w-sm">
                            <h3
                              className="text-[16px] font-bold text-[#1C1C18]"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              Ready to listen to{" "}
                              {selectedBaby?.name || "your baby"}'s voice
                            </h3>
                            <p className="text-sm text-[#9C9A8E] mt-2 leading-relaxed">
                              Select a sample from the library, upload a
                              recording, or tap Record to analyze frequency
                              patterns.
                            </p>
                          </div>
                          <div className="w-full max-w-sm border border-[#E8E2D8] bg-[#FAFAF7] p-4 rounded-2xl text-left text-sm text-[#6C5F4F] space-y-2.5">
                            <p
                              className="font-bold text-[#3B4E3F] text-xs uppercase tracking-wider mb-1"
                              style={{ fontFamily: "Nunito, sans-serif" }}
                            >
                              Recording tips
                            </p>
                            {[
                              "Hold device 1–2m from your baby",
                              "Reduce background noise (fans, screens)",
                              "Aim for 3–6 seconds of uninterrupted sound",
                            ].map((tip, i) => (
                              <div
                                key={i}
                                className="flex gap-2 items-start text-xs"
                              >
                                <span className="text-[#7FAE96] font-black">
                                  ✓
                                </span>
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* History log for selected baby */}
                    <div className="card p-5">
                      <h3
                        className="text-[14px] font-bold text-[#1C1C18] flex items-center gap-2 border-b border-[#F1EDE4] pb-3 mb-3"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        <History className="w-4 h-4 text-[#7FAE96]" />
                        {selectedBaby?.name || "Baby"}'s History (
                        {babyFilteredHistory.length})
                      </h3>
                      {babyFilteredHistory.length === 0 ? (
                        <p className="text-xs text-[#9C9A8E] italic text-center py-4">
                          No saved logs yet. Save an analysis above.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {babyFilteredHistory.slice(0, 10).map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-[#FAFAF7] border border-[#EDE7DC] rounded-xl flex justify-between items-start text-xs hover:border-[#7FAE96] transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <CryIcon label={item.matchedLabel} size={14} />
                                <span className="font-bold text-[#3B4E3F] truncate">
                                  {emoji_map[item.matchedLabel] ||
                                    item.matchedLabel}
                                </span>
                                <span className="font-mono font-bold text-[#7FAE96] shrink-0">
                                  {item.confidence.toFixed(1)}%
                                </span>
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
                {/* <section className="mt-12 border-t-2 border-[#EDE7DC] pt-10" id="cry-dictionary-index">
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
              </section> */}
                {/* Cry Encyclopedia Section */}
                <section className="mt-16" id="cry-dictionary-index">
                  <div className="max-w-4xl mx-auto">
                    {/* Header with decorative elements */}
                    <div className="relative text-center mb-12">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-20 h-20 rounded-full bg-[#E9F1EC]/50 blur-2xl" />

                      <span
                        className="inline-flex items-center gap-2 text-[11px] bg-[#E3EBE6] text-[#2E5E41] px-5 py-1.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ fontFamily: "Nunito, sans-serif" }}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Pediatric Reference Guide
                      </span>

                      <h2
                        className="text-[28px] font-bold text-[#1C1C18] mt-4 tracking-tight"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        Infant Cry Encyclopedia
                      </h2>

                      <p className="text-sm text-[#9C9A8E] mt-2 max-w-lg mx-auto leading-relaxed">
                        Explore 11 cry categories with detailed signs and proven
                        soothing techniques.
                      </p>

                      {/* Quick stats */}
                      <div className="flex justify-center gap-3 mt-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#33614A] font-bold text-sm">
                            11
                          </span>
                          <span className="text-xs text-[#9C9A8E]">
                            Categories
                          </span>
                        </div>
                        <div className="w-px h-4 bg-[#E8E2D8]" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#33614A] font-bold text-sm">
                            86%
                          </span>
                          <span className="text-xs text-[#9C9A8E]">
                            Accuracy
                          </span>
                        </div>
                        <div className="w-px h-4 bg-[#E8E2D8]" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#33614A] font-bold text-sm">
                            40+
                          </span>
                          <span className="text-xs text-[#9C9A8E]">
                            Features
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Single column layout - cleaner and no white space issues */}
                    <div className="space-y-3">
                      {cryTypeDetails.map((detail) => {
                        const isExpanded = expandedCatalogId === detail.label;
                        const colorMap: Record<string, string> = {
                          hungry: "bg-amber-50 border-amber-200",
                          tired: "bg-violet-50 border-violet-200",
                          "belly pain": "bg-orange-50 border-orange-200",
                          discomfort: "bg-rose-50 border-rose-200",
                          scared: "bg-red-50 border-red-200",
                          lonely: "bg-pink-50 border-pink-200",
                          cold_hot: "bg-sky-50 border-sky-200",
                          burping: "bg-teal-50 border-teal-200",
                          noise: "bg-yellow-50 border-yellow-200",
                          laugh: "bg-emerald-50 border-emerald-200",
                          silence: "bg-gray-50 border-gray-200",
                        };

                        const bgColor =
                          colorMap[detail.label] ||
                          "bg-[#FAFAF7] border-[#EDE7DC]";

                        return (
                          <motion.div
                            key={detail.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                              isExpanded
                                ? `${bgColor} shadow-md`
                                : "bg-white border-[#EDE7DC] hover:border-[#C8C4BC]"
                            }`}
                          >
                            {/* Card Header - Always visible */}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedCatalogId(
                                  isExpanded ? null : detail.label,
                                )
                              }
                              className="w-full flex items-center justify-between p-4 cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                                    isExpanded
                                      ? "bg-white/70"
                                      : "bg-[#F5F2EE] group-hover:bg-[#EDE8E2]"
                                  }`}
                                >
                                  <CryIcon label={detail.label} size={20} />
                                </div>
                                <div className="text-left min-w-0">
                                  <span
                                    className="text-sm font-bold text-[#1C1C18]"
                                    style={{
                                      fontFamily: "Poppins, sans-serif",
                                    }}
                                  >
                                    {detail.emoji} {emoji_map[detail.label]}
                                  </span>
                                  <p className="text-[11px] text-[#9C9A8E] truncate">
                                    {detail.description.slice(0, 60)}...
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                {!isExpanded && (
                                  <span className="text-[10px] text-[#9C9A8E] font-medium px-2 py-0.5 rounded-full bg-[#F5F2EE] hidden sm:inline">
                                    Learn more
                                  </span>
                                )}
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                  }}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                                    isExpanded
                                      ? "bg-[#33614A] text-white"
                                      : "bg-[#F5F2EE] text-[#9C9A8E]"
                                  }`}
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </motion.div>
                              </div>
                            </button>

                            {/* Expanded Content */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#EDE7DC]">
                                    {/* Description */}
                                    <p className="text-sm text-[#4A4840] leading-relaxed bg-white/70 p-3 rounded-xl">
                                      {detail.description}
                                    </p>

                                    {/* Two column grid for signs & soothing */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {/* Observable Signs */}
                                      <div className="bg-white/60 border border-[#EDE7DC] p-3 rounded-xl">
                                        <div className="flex items-center gap-1.5 mb-2">
                                          <div className="w-5 h-5 rounded-full bg-[#F5F2EE] flex items-center justify-center shrink-0">
                                            <span className="text-[10px]">
                                              👀
                                            </span>
                                          </div>
                                          <h4
                                            className="text-[10px] font-bold text-[#3B4E3F] uppercase tracking-wider"
                                            style={{
                                              fontFamily: "Nunito, sans-serif",
                                            }}
                                          >
                                            Observable Signs
                                          </h4>
                                        </div>
                                        <ul className="space-y-1">
                                          {detail.symptoms.map((s, i) => (
                                            <li
                                              key={i}
                                              className="flex items-start gap-2 text-xs text-[#6C5F4F]"
                                            >
                                              <span className="text-[#7FAE96] mt-0.5 shrink-0">
                                                •
                                              </span>
                                              <span>{s}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      {/* Soothing Techniques */}
                                      <div className="bg-[#F2FAF6]/60 border border-[#BACFC1] p-3 rounded-xl">
                                        <div className="flex items-center gap-1.5 mb-2">
                                          <div className="w-5 h-5 rounded-full bg-[#E9F1EC] flex items-center justify-center shrink-0">
                                            <span className="text-[10px]">
                                              💆
                                            </span>
                                          </div>
                                          <h4
                                            className="text-[10px] font-bold text-[#2E5E41] uppercase tracking-wider"
                                            style={{
                                              fontFamily: "Nunito, sans-serif",
                                            }}
                                          >
                                            Soothing Steps
                                          </h4>
                                        </div>
                                        <ul className="space-y-1">
                                          {detail.soothingTechniques.map(
                                            (st, i) => (
                                              <li
                                                key={i}
                                                className="flex items-start gap-2 text-xs text-[#3B5C46]"
                                              >
                                                <span className="text-[#7FAE96] mt-0.5 shrink-0">
                                                  •
                                                </span>
                                                <span>{st}</span>
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    </div>

                                    {/* Quick action badge */}
                                    <div className="flex items-center gap-2 pt-1">
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E3EBE6] text-[#2E5E41] font-medium">
                                        {detail.label}
                                      </span>
                                      <span className="text-[10px] text-[#9C9A8E]">
                                        • Click again to close
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </motion.div>
            </React.Fragment>
          )}

          {/* ━━ HISTORY TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              <div>
                <h1
                  className="text-[22px] font-bold text-[#1C1C18] tracking-tight"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Analysis History
                </h1>
                <p className="text-sm text-[#7A776C] mt-0.5">
                  {allHistory.length} saved recording
                  {allHistory.length !== 1 ? "s" : ""} across all profiles
                </p>
              </div>

              {allHistory.length === 0 ? (
                <div className="card p-14 text-center">
                  <div className="w-12 h-12 bg-[#F5F2EE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <History
                      className="w-6 h-6 text-[#C8C4BC]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p
                    className="text-sm font-bold text-[#4A4840]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    No recordings yet
                  </p>
                  <p className="text-xs text-[#9C9A8E] mt-1">
                    Analyze a cry and save it to see your history here
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("analyze")}
                    className="mt-4 text-xs font-bold text-[#33614A] hover:text-[#2A4F3D] cursor-pointer"
                  >
                    Start analyzing →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {allHistory.map((h, idx) => {
                    const baby = userSession.babies.find(
                      (b) => b.id === h.babyId,
                    );
                    const date = new Date(h.timestamp);
                    return (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.25 }}
                        className="card p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F5F2EE] flex items-center justify-center shrink-0">
                            <CryIcon label={h.matchedLabel} size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-sm font-bold text-[#1C1C18] capitalize"
                                style={{ fontFamily: "Poppins, sans-serif" }}
                              >
                                {emoji_map[h.matchedLabel] || h.matchedLabel}
                              </span>
                              <span
                                className="text-xs px-1.5 py-0.5 rounded-full bg-[#E9F1EC] text-[#2E5E41] font-bold tabular-nums"
                                style={{ fontFamily: "Nunito, sans-serif" }}
                              >
                                {h.confidence}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {baby && (
                                <span className="text-xs text-[#9C9A8E]">
                                  {baby.name}
                                </span>
                              )}
                              {baby && (
                                <span className="text-[#DDD8CF] text-xs">
                                  ·
                                </span>
                              )}
                              <Clock className="w-3 h-3 text-[#C8C4BC]" />
                              <span className="text-xs text-[#9C9A8E]">
                                {date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                at{" "}
                                {date.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="card p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#33614A]" />
                    <h3
                      className="text-sm font-bold text-[#1C1C18]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Most common patterns
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(
                      allHistory.reduce(
                        (acc, h) => {
                          acc[h.matchedLabel as string] =
                            (acc[h.matchedLabel as string] || 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>,
                      ),
                    )
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([label, count]) => (
                        <div
                          key={label}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F2EE] border border-[#E8E2D8]"
                        >
                          <CryIcon label={label as CryLabel} size={12} />
                          <span className="text-xs text-[#4A4840] capitalize font-medium">
                            {emoji_map[label as CryLabel] || label}
                          </span>
                          <span className="text-[10px] text-[#9C9A8E] tabular-nums">
                            ×{count}
                          </span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ━━ TOOLKIT TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === "toolkit" && (
            <motion.div
              key="toolkit"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5 max-w-xl"
            >
              <div>
                <h1
                  className="text-[22px] font-bold text-[#1C1C18] tracking-tight"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Soothing Toolkit
                </h1>
                <p className="text-sm text-[#7A776C] mt-0.5">
                  Calming soundscapes to help your baby settle
                </p>
              </div>
              <ParentToolkit />
            </motion.div>
          )}

          {/* ━━ BABIES TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === "babies" && (
            <motion.div
              key="babies"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5 max-w-2xl"
            >
              <div>
                <h1
                  className="text-[22px] font-bold text-[#1C1C18] tracking-tight"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Baby Profiles
                </h1>
                <p className="text-sm text-[#7A776C] mt-0.5">
                  Manage your little ones
                </p>
              </div>
              <BabyProfiles
                babies={userSession.babies}
                selectedBabyId={selectedBabyId}
                onSelectBaby={handleSelectBaby}
                onAddBaby={handleAddBabyProfile}
                onEditBaby={handleEditBaby}    
                onDeleteBaby={handleDeleteBaby} 
              />
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-[10px] text-[#9C9A8E] uppercase tracking-widest font-bold mb-0.5"
                      style={{ fontFamily: "Nunito, sans-serif" }}
                    >
                      Signed in as
                    </p>
                    <p
                      className="text-sm font-bold text-[#1C1C18]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {userSession.name}
                    </p>
                    <p className="text-xs text-[#7A776C]">
                      {userSession.email}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#7A776C] border border-[#E8E2D8] rounded-xl hover:bg-[#F5F2EE] cursor-pointer transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ━━ DEVELOPER TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === "developer" && (
            <motion.div
              key="developer"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              <div>
                <h1
                  className="text-[22px] font-bold text-[#1C1C18] tracking-tight"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Developer
                </h1>
                <p className="text-sm text-[#7A776C] mt-0.5">
                  About the project and the model behind it
                </p>
              </div>
              <Developer />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Bottom Nav (mobile to tablet) ──────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-[#ECE7DD] bg-white/95 backdrop-blur-sm xl:hidden">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 relative cursor-pointer transition-all ${isActive ? "text-[#33614A]" : "text-[#B0A89A] hover:text-[#7A776C]"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute top-0 left-2 right-2 h-[2px] bg-[#33614A] rounded-b-full"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {tab.icon}
                  </motion.div>
                  <span
                    className={`text-[10px] font-bold ${isActive ? "text-[#33614A]" : "text-[#B0A89A]"}`}
                    style={{ fontFamily: "Nunito, sans-serif" }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      
    </div>
  );
}
