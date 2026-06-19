import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Baby, LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';
import { UserSession, BabyProfile } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (session: UserSession) => void;
  onBack: () => void;
}

export default function AuthScreen({ onAuthSuccess, onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [babyName, setBabyName] = useState<string>('');
  const [babyAge, setBabyAge] = useState<number>(3);
  const [babyGender, setBabyGender] = useState<'boy' | 'girl' | 'surprise'>('surprise');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // const handleDemoLogin = () => {
  //   const demoSession: UserSession = {
  //     email: 'supreetmohapatra06@gmail.com',
  //     name: 'Supreet',
  //     babies: [
  //       { id: 'b1', name: 'Leo', ageMonths: 4, gender: 'boy', createdAt: new Date().toISOString() },
  //       { id: 'b2', name: 'Mia', ageMonths: 11, gender: 'girl', createdAt: new Date().toISOString() }
  //     ],
  //     history: [
  //       {
  //         id: 'h1', babyId: 'b1',
  //         timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  //         fileName: 'noon_feed_demand.wav', durationSec: 4.5,
  //         matchedLabel: 'hungry' as any, confidence: 89.4,
  //         probabilities: { 'hungry': 0.894, 'tired': 0.04, 'discomfort': 0.03, 'scared': 0.015, 'belly pain': 0.01, 'laugh': 0.005, 'lonely': 0.003, 'silence': 0.001, 'noise': 0.001, 'burping': 0.001, 'cold_hot': 0.001 } as any,
  //         features: { mfcc: Array.from({ length: 40 }, (_, i) => Math.sin(i) * 50 - 100), chroma: Array.from({ length: 12 }, () => Math.random() * 0.8), mel: Array.from({ length: 64 }, () => Math.random() * 0.5) }
  //       },
  //       {
  //         id: 'h2', babyId: 'b1',
  //         timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
  //         fileName: 'bedtime_squirm.mp3', durationSec: 5.0,
  //         matchedLabel: 'tired' as any, confidence: 76.2,
  //         probabilities: { 'tired': 0.762, 'hungry': 0.12, 'discomfort': 0.05, 'belly pain': 0.03, 'scared': 0.02, 'lonely': 0.01, 'silence': 0.002, 'noise': 0.002, 'laugh': 0.002, 'burping': 0.001, 'cold_hot': 0.001 } as any,
  //         features: { mfcc: Array.from({ length: 40 }, (_, i) => Math.cos(i) * 60 - 120), chroma: Array.from({ length: 12 }, () => Math.random() * 0.9), mel: Array.from({ length: 64 }, () => Math.random() * 0.6) }
  //       }
  //     ]
  //   };
  //   localStorage.setItem('nurture_user_session', JSON.stringify(demoSession));
  //   onAuthSuccess(demoSession);
  // };

  const getFirebaseError = (code: string): string => {
    switch (code) {
      case 'auth/invalid-email': return 'Invalid email address.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use': return 'An account with this email already exists.';
      case 'auth/weak-password': return 'Password should be at least 6 characters.';
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
      case 'auth/invalid-credential': return 'Incorrect email or password.';
      case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
      case 'auth/popup-blocked': return 'Popup was blocked. Please allow popups for this site.';
      default: return 'Something went wrong. Please try again.';
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const savedSession = localStorage.getItem(`nurture_session_${firebaseUser.uid}`);
      let session: UserSession;

      if (savedSession) {
        session = JSON.parse(savedSession);
        session.uid = firebaseUser.uid;
      } else {
        session = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Parent',
          babies: [{ id: 'baby_1', name: 'Baby', ageMonths: 3, gender: 'surprise', createdAt: new Date().toISOString() }],
          history: []
        };
        localStorage.setItem(`nurture_session_${firebaseUser.uid}`, JSON.stringify(session));
      }

      localStorage.setItem('nurture_user_session', JSON.stringify(session));
      onAuthSuccess(session);
    } catch (err: any) {
      setErrorMsg(getFirebaseError(err.code));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) { setErrorMsg('Please fill in your email and password.'); return; }
    if (!isLogin && !name) { setErrorMsg('Please enter your name.'); return; }
    if (!isLogin && !babyName) { setErrorMsg("Please enter your baby's name."); return; }

    setIsLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        const savedSession = localStorage.getItem(`nurture_session_${firebaseUser.uid}`);
        let session: UserSession;

        if (savedSession) {
          session = JSON.parse(savedSession);
          session.uid = firebaseUser.uid;
        } else {
          session = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || email,
            name: firebaseUser.displayName || email.split('@')[0],
            babies: [{ id: 'baby_1', name: 'Baby', ageMonths: 3, gender: 'surprise', createdAt: new Date().toISOString() }],
            history: []
          };
        }

        localStorage.setItem('nurture_user_session', JSON.stringify(session));
        onAuthSuccess(session);

      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        await updateProfile(firebaseUser, { displayName: name });

        const firstBaby: BabyProfile = {
          id: 'baby_' + Date.now(),
          name: babyName,
          ageMonths: Number(babyAge) || 1,
          gender: babyGender,
          createdAt: new Date().toISOString()
        };

        const newSession: UserSession = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || email,
          name,
          babies: [firstBaby],
          history: []
        };

        localStorage.setItem(`nurture_session_${firebaseUser.uid}`, JSON.stringify(newSession));
        localStorage.setItem('nurture_user_session', JSON.stringify(newSession));
        onAuthSuccess(newSession);
      }

    } catch (err: any) {
      setErrorMsg(getFirebaseError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E4DE] bg-[#FAFAF8] text-sm text-[#1A1614] placeholder-[#A8A09A] focus:ring-2 focus:ring-[#5C8A6B]/20 focus:border-[#5C8A6B] transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #F7F5F2 0%, #EFF4F1 50%, #F5F0EC 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Back to Home */}
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#7A716A] hover:text-[#1A1614] mb-5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </motion.button>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-[#E8E4DE] mb-5"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <img
                src="/src/asset/icon.png"
                alt="NurtureAI Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-[#1A1614] tracking-tight">Nurture</h1>
          <p className="text-sm text-[#7A716A] mt-1.5 leading-relaxed">
            Understand your baby's needs through acoustic analysis
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm p-8">
          {/* Mode Toggle */}
          <div className="flex bg-[#F5F2EE] rounded-xl p-1 mb-7">
            {['Sign In', 'Create Account'].map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => { setIsLogin(i === 0); setErrorMsg(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  (i === 0) === isLogin
                    ? 'bg-white text-[#1A1614] shadow-sm'
                    : 'text-[#7A716A] hover:text-[#4A4440]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm text-center"
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign In */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 mb-5 rounded-xl border border-[#E8E4DE] bg-white hover:bg-[#F5F2EE] text-sm font-semibold text-[#1A1614] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {isGoogleLoading ? (
              <svg className="animate-spin w-4 h-4 text-[#5C8A6B]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {isGoogleLoading ? 'Signing in with Google...' : 'Continue with Google'}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#E8E4DE]" />
            <span className="text-xs text-[#A8A09A] font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-[#E8E4DE]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="block text-xs font-semibold text-[#4A4440] uppercase tracking-wide mb-1.5">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A09A]" />
                    <input id="auth-input-parent-name" type="text" placeholder="Alex Johnson" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-[#4A4440] uppercase tracking-wide mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A09A]" />
                <input id="auth-input-email" type="email" placeholder="parent@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4440] uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A09A]" />
                <input id="auth-input-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A09A] hover:text-[#7A716A] cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="pt-1"
                >
                  <div className="p-4 bg-[#F7F5F2] rounded-xl border border-[#EAE6E0] space-y-4">
                    <div className="flex items-center gap-2">
                      <Baby className="w-4 h-4 text-[#5C8A6B]" />
                      <span className="text-xs font-semibold text-[#4A4440] uppercase tracking-wide">Baby Profile</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#7A716A] mb-1">Name</label>
                        <input id="auth-input-baby-name" type="text" placeholder="Leo" value={babyName} onChange={e => setBabyName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E0DBD5] bg-white text-[#1A1614] focus:ring-2 focus:ring-[#5C8A6B]/20 focus:border-[#5C8A6B] outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#7A716A] mb-1">Age (months)</label>
                        <input id="auth-input-baby-age" type="number" min="0" max="36" value={babyAge} onChange={e => setBabyAge(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 text-sm rounded-lg border border-[#E0DBD5] bg-white text-[#1A1614] focus:ring-2 focus:ring-[#5C8A6B]/20 focus:border-[#5C8A6B] outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#7A716A] mb-2">Theme</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['boy', 'girl', 'surprise'] as const).map(style => (
                          <button key={style} id={`auth-selector-gender-${style}`} type="button" onClick={() => setBabyGender(style)}
                            className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer capitalize ${babyGender === style ? 'bg-[#5C8A6B] border-[#5C8A6B] text-white' : 'bg-white border-[#E0DBD5] text-[#7A716A] hover:border-[#C4BAB0]'}`}
                          >
                            {style === 'surprise' ? 'Neutral' : style === 'boy' ? 'Blue' : 'Rose'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              id="auth-btn-submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 mt-1 text-sm font-semibold text-white bg-[#5C8A6B] hover:bg-[#4E7A5C] rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {isLogin ? 'Access Dashboard' : 'Create Account'}
                </>
              )}
            </motion.button>
          </form>

          {/* Demo bypass */}
          {/* <div className="mt-6 pt-5 border-t border-[#F0EDE8] text-center">
            <p className="text-xs text-[#A8A09A] mb-3 font-medium tracking-wide uppercase">Quick Demo</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              id="auth-btn-demo"
              type="button"
              onClick={handleDemoLogin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8D9C4] bg-[#FEF3E8] text-[#8C5420] text-sm font-medium hover:bg-[#FDE8D0] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D4833A]" />
              Launch Demo Account
            </motion.button>
          </div> */}
        </div>

        <p className="text-center text-xs text-[#A8A09A] mt-5">
          All analysis runs locally on your device. Zero data sharing.
        </p>
      </motion.div>
    </div>
  );
}