import React from 'react';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { soundFx } from '../lib/audio';
import { UserProfile } from '../types';
import { Award, Lock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface AchievementsViewProps {
  user: UserProfile | null;
  onBack: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ user, onBack }) => {
  const unlockedSet = new Set(user?.achievements || []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
        <button
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="px-4 py-2 bg-[#1A1A1C] border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-[#D4AF37] bg-[#1A1A1C] flex items-center justify-center text-[#D4AF37]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#F0F0F0]">Achievements</h2>
            <p className="text-xs text-[#888] uppercase tracking-widest">أكمل التحديات واكسب أوسمة ونقاط إضافية</p>
          </div>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ALL_ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedSet.has(ach.id);

          return (
            <div
              key={ach.id}
              className={`p-4 border transition-all flex items-center gap-4 ${
                isUnlocked
                  ? 'bg-[#0F0F11] border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/5'
                  : 'bg-[#0A0A0B] border-[#222] opacity-50'
              }`}
            >
              <div
                className={`w-12 h-12 flex items-center justify-center text-2xl shrink-0 border ${
                  isUnlocked
                    ? 'bg-[#1A1A1C] border-[#D4AF37] text-[#D4AF37]'
                    : 'bg-[#131315] border-[#222] text-[#555]'
                }`}
              >
                {isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-[#555]" />}
              </div>

              <div className="overflow-hidden">
                <h4 className="text-xs font-serif font-bold text-[#F0F0F0] flex items-center gap-2">
                  <span>{ach.title}</span>
                  {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </h4>
                <p className="text-[10px] text-[#888] leading-snug mt-0.5">{ach.description}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-serif font-bold">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>+{ach.pointsBonus} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
