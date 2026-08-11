import React from 'react';
import { motion } from 'motion/react';
import { soundFx } from '../lib/audio';
import { Gamepad2, Bot, Globe, Users, Trophy, Sparkles, Play, ShieldCheck, Zap } from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';

interface WelcomeViewProps {
  user: UserProfile | null;
  onStart: (tab: ActiveTab) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ user, onStart }) => {
  const handleOption = (tab: ActiveTab) => {
    soundFx.playClick();
    if (!user && (tab === 'online' || tab === 'friends' || tab === 'leaderboard')) {
      onStart('auth');
    } else {
      onStart(tab);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl text-center space-y-8 z-10"
      >
        {/* Animated Main Title */}
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0F0F11] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-serif tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
            <span>بطولة أساطير X / O أونلاين ⚔️</span>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl font-serif font-black text-[#F0F0F0] tracking-wider leading-tight uppercase">
            LEGENDS OF <br />
            <span className="text-[#D4AF37]">
              TIC TAC TOE
            </span>
          </h1>

          <p className="text-[#888] text-base sm:text-lg max-w-xl mx-auto font-sans leading-relaxed">
            تحدى أساطير اللعبة أونلاين، واجه الذكاء الاصطناعي الخارق، واجمع النقاط لتتصدر الترتيب العالمي!
          </p>
        </div>

        {/* Big Start Button */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block"
        >
          <button
            onClick={() => handleOption(user ? 'menu' : 'auth')}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#0A0A0B] font-bold text-lg tracking-widest uppercase hover:bg-[#B8962D] transition-all cursor-pointer shadow-xl shadow-[#D4AF37]/15"
          >
            <Play className="w-5 h-5 fill-current text-[#0A0A0B] group-hover:scale-110 transition-transform" />
            <span>{user ? 'ابدأ التحدي الآن' : 'انشئ حسابك وانضم للبطولة'}</span>
          </button>
        </motion.div>

        {/* Game Mode Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-right pt-6">
          {/* AI Mode */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => handleOption('ai')}
            className="p-6 bg-[#0F0F11] border border-[#D4AF37]/10 hover:border-[#D4AF37] transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 border border-[#D4AF37]/30 bg-[#1A1A1C] flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0B] transition-colors">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#F0F0F0] mb-2">ضد الكمبيوتر</h3>
            <p className="text-xs text-[#888] leading-relaxed">
              تحدى الذكاء الاصطناعي بمستويات متنوعة: عادي، متوسط، أو المستحيل.
            </p>
          </motion.div>

          {/* Online Mode */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => handleOption('online')}
            className="p-6 bg-[#0F0F11] border border-[#D4AF37]/10 hover:border-[#D4AF37] transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 border border-[#D4AF37]/30 bg-[#1A1A1C] flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0B] transition-colors">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#F0F0F0] mb-2">مواجهة أونلاين</h3>
            <p className="text-xs text-[#888] leading-relaxed">
              أنشئ غرفة خاصة، انضم لغرف اللاعبين، أرسل واستقبل دعوات اللعب مباشرة.
            </p>
          </motion.div>

          {/* Local Mode */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => handleOption('local')}
            className="p-6 bg-[#0F0F11] border border-[#D4AF37]/10 hover:border-[#D4AF37] transition-all cursor-pointer group sm:col-span-2 lg:col-span-1"
          >
            <div className="w-12 h-12 border border-[#D4AF37]/30 bg-[#1A1A1C] flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0B] transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#F0F0F0] mb-2">لاعبان على نفس الجهاز</h3>
            <p className="text-xs text-[#888] leading-relaxed">
              العب مع صديقك بجانبك في جولات تنافسية سريعة وممتعة بدون إنترنت.
            </p>
          </motion.div>
        </div>

        {/* Features badges footer */}
        <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-xs text-[#888] border-t border-[#D4AF37]/10 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>مزامن مباشرة على السيرفر</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#D4AF37]" />
            <span>لوحة متصدرين عالمية</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#D4AF37]" />
            <span>تحديات فورية وسريعة</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
