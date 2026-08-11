import React from 'react';
import { UserProfile, ActiveTab } from '../types';
import { soundFx } from '../lib/audio';
import {
  Gamepad2,
  Users,
  Trophy,
  Award,
  User,
  LogOut,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Globe,
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  pendingInvitesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  soundOn,
  setSoundOn,
  pendingInvitesCount,
}) => {
  const toggleSound = () => {
    const newState = soundFx.toggleSound();
    setSoundOn(newState);
    if (newState) soundFx.playClick();
  };

  const navItemClass = (tab: ActiveTab) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-sm cursor-pointer ${
      activeTab === tab
        ? 'bg-[#D4AF37] text-[#0A0A0B] font-bold shadow-lg shadow-[#D4AF37]/20 scale-105'
        : 'text-[#888] hover:text-[#F0F0F0] hover:bg-[#1A1A1C]'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0F0F11]/90 border-b border-[#D4AF37]/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo */}
        <div
          onClick={() => {
            soundFx.playClick();
            setActiveTab(user ? 'menu' : 'welcome');
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 border-2 border-[#D4AF37] rotate-45 flex items-center justify-center transition-transform group-hover:scale-105 bg-[#0F0F11]">
            <span className="-rotate-45 text-lg font-serif font-black text-[#D4AF37]">XO</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-serif font-bold text-[#F0F0F0] leading-tight tracking-widest uppercase">
              LEGENDS <span className="text-[#D4AF37]">X / O</span>
            </h1>
            <p className="text-[10px] text-[#888] tracking-widest uppercase">بطولة التحدي الأسطورية</p>
          </div>
        </div>

        {/* Center Navigation */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-[#0A0A0B] p-1.5 rounded-2xl border border-[#D4AF37]/20">
            <button onClick={() => { soundFx.playClick(); setActiveTab('menu'); }} className={navItemClass('menu')}>
              <Gamepad2 className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>

            <button onClick={() => { soundFx.playClick(); setActiveTab('ai'); }} className={navItemClass('ai')}>
              <Bot className="w-4 h-4" />
              <span>ضد الكمبيوتر</span>
            </button>

            <button onClick={() => { soundFx.playClick(); setActiveTab('online'); }} className={navItemClass('online')}>
              <Globe className="w-4 h-4" />
              <span>أونلاين</span>
            </button>

            <button onClick={() => { soundFx.playClick(); setActiveTab('friends'); }} className={`relative ${navItemClass('friends')}`}>
              <Users className="w-4 h-4" />
              <span>الأصدقاء</span>
              {pendingInvitesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-[#0A0A0B] animate-pulse">
                  {pendingInvitesCount}
                </span>
              )}
            </button>

            <button onClick={() => { soundFx.playClick(); setActiveTab('leaderboard'); }} className={navItemClass('leaderboard')}>
              <Trophy className="w-4 h-4" />
              <span>المتصدرون</span>
            </button>

            <button onClick={() => { soundFx.playClick(); setActiveTab('achievements'); }} className={navItemClass('achievements')}>
              <Award className="w-4 h-4" />
              <span>الإنجازات</span>
            </button>
          </nav>
        )}

        {/* Right side Profile & Controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle button */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'إيقاف الصوت' : 'تشغيل الصوت'}
            className="p-2.5 rounded-xl bg-[#0F0F11] border border-[#D4AF37]/20 text-[#888] hover:text-[#D4AF37] transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4 text-[#555]" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {/* User badge */}
              <div
                onClick={() => { soundFx.playClick(); setActiveTab('profile'); }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
                    : 'bg-[#0F0F11] border-[#D4AF37]/20 hover:border-[#D4AF37]/40 text-[#E0E0E0]'
                }`}
              >
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full object-cover border border-[#D4AF37]"
                />
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-[#F0F0F0] max-w-[100px] truncate">{user.displayName}</div>
                  <div className="text-[10px] text-[#D4AF37] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>{user.points} نقطة</span>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={() => { soundFx.playClick(); onLogout(); }}
                title="تسجيل الخروج"
                className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 hover:bg-red-900/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { soundFx.playClick(); setActiveTab('auth'); }}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0A0A0B] font-bold text-sm tracking-wider uppercase hover:bg-[#B8962D] transition-colors shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      {user && (
        <div className="md:hidden flex items-center justify-around mt-3 pt-2 border-t border-[#D4AF37]/20 overflow-x-auto gap-1">
          <button onClick={() => { soundFx.playClick(); setActiveTab('menu'); }} className={`flex flex-col items-center gap-1 text-[11px] p-2 rounded-xl ${activeTab === 'menu' ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-[#888]'}`}>
            <Gamepad2 className="w-5 h-5" />
            <span>الرئيسية</span>
          </button>
          <button onClick={() => { soundFx.playClick(); setActiveTab('ai'); }} className={`flex flex-col items-center gap-1 text-[11px] p-2 rounded-xl ${activeTab === 'ai' ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-[#888]'}`}>
            <Bot className="w-5 h-5" />
            <span>كمبيوتر</span>
          </button>
          <button onClick={() => { soundFx.playClick(); setActiveTab('online'); }} className={`flex flex-col items-center gap-1 text-[11px] p-2 rounded-xl ${activeTab === 'online' ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-[#888]'}`}>
            <Globe className="w-5 h-5" />
            <span>أونلاين</span>
          </button>
          <button onClick={() => { soundFx.playClick(); setActiveTab('friends'); }} className={`relative flex flex-col items-center gap-1 text-[11px] p-2 rounded-xl ${activeTab === 'friends' ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-[#888]'}`}>
            <Users className="w-5 h-5" />
            <span>الأصدقاء</span>
            {pendingInvitesCount > 0 && (
              <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
            )}
          </button>
          <button onClick={() => { soundFx.playClick(); setActiveTab('leaderboard'); }} className={`flex flex-col items-center gap-1 text-[11px] p-2 rounded-xl ${activeTab === 'leaderboard' ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-[#888]'}`}>
            <Trophy className="w-5 h-5" />
            <span>الأوائل</span>
          </button>
          <button onClick={() => { soundFx.playClick(); setActiveTab('profile'); }} className={`flex flex-col items-center gap-1 text-[11px] p-2 rounded-xl ${activeTab === 'profile' ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-[#888]'}`}>
            <User className="w-5 h-5" />
            <span>حسابي</span>
          </button>
        </div>
      )}
    </header>
  );
};
