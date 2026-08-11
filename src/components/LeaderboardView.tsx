import React, { useState, useEffect } from 'react';
import { getTop10Players } from '../services/userService';
import { soundFx } from '../lib/audio';
import { UserProfile } from '../types';
import { Trophy, Crown, Sparkles, Medal, ArrowRight, ShieldCheck } from 'lucide-react';

interface LeaderboardViewProps {
  onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [topPlayers, setTopPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTop10();
  }, []);

  const loadTop10 = async () => {
    setLoading(true);
    const players = await getTop10Players();
    setTopPlayers(players);
    setLoading(false);
  };

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
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#F0F0F0]">Global Leaderboard</h2>
            <p className="text-xs text-[#888] tracking-widest uppercase">قائمة الـ 10 الأوائل على السيرفر</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#888] text-xs uppercase tracking-widest">جاري جلب أبطال السيرفر...</div>
      ) : topPlayers.length > 0 ? (
        <div className="space-y-2 bg-[#0F0F11] border border-[#D4AF37]/10 p-4">
          {topPlayers.map((player, idx) => {
            const rank = idx + 1;
            const isTop1 = rank === 1;

            return (
              <div
                key={player.uid}
                className={`grid grid-cols-[50px_1fr_120px] items-center p-3.5 transition-all ${
                  isTop1
                    ? 'bg-[#1A1A1C] border-l-4 border-[#D4AF37]'
                    : 'bg-[#131315] hover:bg-[#1A1A1C]'
                }`}
              >
                <div className="flex items-center gap-1 font-serif text-lg font-bold">
                  {isTop1 ? (
                    <Crown className="w-5 h-5 text-[#D4AF37]" />
                  ) : (
                    <span className="text-[#888]">0{rank}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={player.photoURL}
                    alt={player.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/30"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-[#F0F0F0] flex items-center gap-2">
                      <span>{player.displayName}</span>
                      {isTop1 && (
                        <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-1.5 py-0.5 uppercase tracking-widest font-serif">
                          Grandmaster
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-[#666]">@{player.username}</p>
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-xs font-serif font-bold text-[#D4AF37]">
                    {player.points.toLocaleString()} pts
                  </div>
                  <div className="text-[10px] text-[#666] uppercase">
                    {player.wins}W • {player.losses}L
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-[#0F0F11] border border-[#D4AF37]/10 text-[#888] text-xs uppercase tracking-widest">
          لا يزال التنافس في بدايته! العب واجمع النقاط لتكن أول المتصدرين.
        </div>
      )}
    </div>
  );
};
