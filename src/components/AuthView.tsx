import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  createUserProfile,
  checkUsernameAvailable,
  getUserProfile,
} from '../services/userService';
import { PRESET_AVATARS, convertFileToBase64 } from '../data/avatars';
import { uploadImageToImgBB } from '../services/uploadService';
import { soundFx } from '../lib/audio';
import {
  User,
  Mail,
  Lock,
  AtSign,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthViewProps {
  onAuthSuccess: (userProfile: UserProfile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [step, setStep] = useState<'credentials' | 'username'>('credentials');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [username, setUsername] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken'>('idle');

  // Pending user account data during step 1
  const [tempUid, setTempUid] = useState<string | null>(null);

  // Handle custom image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const imageUrl = await uploadImageToImgBB(file);
        setSelectedAvatar(imageUrl);
        soundFx.playClick();
      } catch (err) {
        setError('تعذر تحميل الصورة، يرجى اختيار صورة أخرى');
      } finally {
        setLoading(false);
      }
    }
  };

  // Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    soundFx.playClick();

    try {
      if (isSignUp) {
        if (!email.trim() || !password || !displayName.trim()) {
          setError('يرجى ملء جميع الحقول المطلوبة');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('كلمة المرور يجب أن لا تقل عن 6 أحرف');
          setLoading(false);
          return;
        }

        // Create Firebase Auth user
        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        setTempUid(res.user.uid);
        setStep('username');
      } else {
        // Sign In
        if (!email.trim() || !password) {
          setError('يرجى كتابة البريد وكلمة المرور');
          setLoading(false);
          return;
        }

        const res = await signInWithEmailAndPassword(auth, email.trim(), password);
        const profile = await getUserProfile(res.user.uid);
        if (profile) {
          onAuthSuccess(profile);
        } else {
          // Profile doc missing, create default
          const defaultUsername = 'player_' + Math.floor(Math.random() * 89999 + 10000);
          const newProf = await createUserProfile(
            res.user.uid,
            res.user.email || email,
            email.split('@')[0],
            PRESET_AVATARS[0].url,
            defaultUsername
          );
          onAuthSuccess(newProf);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مستخدم بالفعل');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة للغاية');
      } else {
        setError(err.message || 'حدث خطأ أثناء العملية');
      }
    } finally {
      setLoading(false);
    }
  };

  // Live username check
  const handleUsernameChange = async (val: string) => {
    const clean = val.trim().replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(clean);
    if (clean.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setCheckingUsername(true);
    try {
      const isAvailable = await checkUsernameAvailable(clean);
      setUsernameStatus(isAvailable ? 'available' : 'taken');
    } catch (err) {
      setUsernameStatus('idle');
    } finally {
      setCheckingUsername(false);
    }
  };

  // Step 2: Submit Username & Create Profile
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUid) return;
    setError(null);
    soundFx.playClick();

    if (username.length < 3) {
      setError('اليوزر نيم يجب أن يتكون من 3 أحرف/أرقام على الأقل');
      return;
    }

    if (usernameStatus !== 'available') {
      setError('اليوزر نيم غير متاح أو مستخدم من قبل لاعب آخر');
      return;
    }

    setLoading(true);
    try {
      const profile = await createUserProfile(
        tempUid,
        email,
        displayName,
        selectedAvatar,
        username
      );
      onAuthSuccess(profile);
    } catch (err: any) {
      setError('حدث خطأ أثناء حفظ المعرف الخاص بك');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0F0F11] border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden text-right"
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 border-b border-[#D4AF37]/10 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#F0F0F0]">
              {step === 'username'
                ? 'إنشاء معرف الحساب (اليوزر نيم)'
                : isSignUp
                ? 'إنشاء حساب جديد'
                : 'تسجيل الدخول'}
            </h2>
            <p className="text-xs text-[#888] mt-1">
              {step === 'username'
                ? 'اختر اسم مستخدم فريد ليتعرف عليك الأصدقاء'
                : isSignUp
                ? 'أدخل بياناتك والصورة الشخصية للبدء'
                : 'مرحباً بعودتك! أدخل بياناتك للعب أونلاين'}
            </p>
          </div>

          <div className="w-10 h-10 border border-[#D4AF37]/40 bg-[#1A1A1C] flex items-center justify-center text-[#D4AF37] font-serif font-bold">
            {step === 'username' ? '2/2' : '1/2'}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/30 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Credentials & Avatar */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {isSignUp && (
              <>
                {/* Avatar Picker Section */}
                <div>
                  <label className="block text-xs font-semibold text-[#888] mb-2 uppercase tracking-wider">
                    صورة البروفايل (رفع أو اختيار):
                  </label>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative group">
                      <img
                        src={selectedAvatar}
                        alt="Avatar preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-md"
                      />
                      <label className="absolute inset-0 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <Upload className="w-5 h-5 text-[#D4AF37]" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="text-xs text-[#888] leading-relaxed">
                      اضغط على الصورة لرفع صوره خاصة من جهازك، أو اختر من الصور المجهزة بالأسفل.
                    </div>
                  </div>

                  {/* Preset Avatar Selection Grid */}
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((av) => (
                      <img
                        key={av.id}
                        src={av.url}
                        alt={av.name}
                        onClick={() => {
                          setSelectedAvatar(av.url);
                          soundFx.playClick();
                        }}
                        className={`w-10 h-10 rounded-full object-cover cursor-pointer transition-all border-2 ${
                          selectedAvatar === av.url
                            ? 'border-[#D4AF37] scale-105 shadow-md shadow-[#D4AF37]/30'
                            : 'border-[#222] opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Display Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#888] mb-1 uppercase tracking-wider">
                    الاسم الشخصي:
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 w-4 h-4 text-[#666]" />
                    <input
                      type="text"
                      required
                      placeholder="مثال: أحمد بطل X O"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 bg-[#0A0A0B] border border-[#D4AF37]/30 text-[#F0F0F0] text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-[#888] mb-1 uppercase tracking-wider">
                البريد الإلكتروني:
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-4 h-4 text-[#666]" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-[#0A0A0B] border border-[#D4AF37]/30 text-[#F0F0F0] text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-[#888] mb-1 uppercase tracking-wider">
                كلمة المرور:
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-4 h-4 text-[#666]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-[#0A0A0B] border border-[#D4AF37]/30 text-[#F0F0F0] text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs uppercase tracking-widest hover:bg-[#B8962D] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#D4AF37]/15"
            >
              {loading ? (
                <span>جاري التحقق...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'التالي: إنشاء اليوزر نيم' : 'تسجيل الدخول'}</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>

            {/* Toggle Sign Up / Sign In */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  soundFx.playClick();
                }}
                className="text-xs text-[#D4AF37] hover:underline font-semibold"
              >
                {isSignUp
                  ? 'لديك حساب بالفعل؟ سجل دخولك الآن'
                  : 'ليس لديك حساب؟ انشئ حسابك الجديد'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: USERNAME SETUP */}
        {step === 'username' && (
          <form onSubmit={handleUsernameSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#888] mb-1 uppercase tracking-wider">
                المعرف الشخصي (اليوزر نيم):
              </label>
              <div className="relative">
                <AtSign className="absolute right-3 top-3 w-4 h-4 text-[#666]" />
                <input
                  type="text"
                  required
                  placeholder="مثال: ahmed_pro"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="w-full pr-10 pl-10 py-2.5 bg-[#0A0A0B] border border-[#D4AF37]/30 text-[#F0F0F0] text-sm focus:border-[#D4AF37] focus:outline-none transition-colors ltr text-left"
                />
                {checkingUsername && (
                  <div className="absolute left-3 top-3 text-xs text-[#888] animate-pulse">...</div>
                )}
                {!checkingUsername && usernameStatus === 'available' && (
                  <CheckCircle2 className="absolute left-3 top-3 w-4 h-4 text-emerald-500" />
                )}
                {!checkingUsername && usernameStatus === 'taken' && (
                  <AlertCircle className="absolute left-3 top-3 w-4 h-4 text-red-500" />
                )}
              </div>

              {usernameStatus === 'available' && (
                <p className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>هذا المعرف متاح ويمكنك استخدامه!</span>
                </p>
              )}
              {usernameStatus === 'taken' && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>عذراً، هذا المعرف مستخدم من قبل لاعب آخر</span>
                </p>
              )}
              <p className="text-[10px] text-[#666] mt-1">
                يمكن لأصدقائك البحث عنك وإضافتك من خلال هذا اليوزر نيم مباشرة.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || usernameStatus !== 'available'}
              className="w-full py-3.5 px-4 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs uppercase tracking-widest hover:bg-[#B8962D] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#D4AF37]/15"
            >
              {loading ? (
                <span>جاري إنشاء الحساب...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>إكمال إنشاء الحساب وبدء اللعب</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
