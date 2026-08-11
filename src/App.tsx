import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getUserProfile, setUserOnlineStatus } from './services/userService';
import { subscribeToUserInvites } from './services/gameService';
import { soundFx } from './lib/audio';
import { Navbar } from './components/Navbar';
import { WelcomeView } from './components/WelcomeView';
import { AuthView } from './components/AuthView';
import { AIGameView } from './components/AIGameView';
import { LocalGameView } from './components/LocalGameView';
import { OnlineRoomsView } from './components/OnlineRoomsView';
import { FriendsView } from './components/FriendsView';
import { LeaderboardView } from './components/LeaderboardView';
import { AchievementsView } from './components/AchievementsView';
import { ProfileView } from './components/ProfileView';
import { InviteModal } from './components/InviteModal';
import { UserProfile, ActiveTab, GameInvite } from './types';
import { Gamepad2, Bot, Globe, Users, Trophy, Award, Play, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('welcome');
  const [authLoading, setAuthLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  // Incoming invites state
  const [pendingInvites, setPendingInvites] = useState<GameInvite[]>([]);
  const [activeInvite, setActiveInvite] = useState<GameInvite | null>(null);

  // Target room ID to jump into when accepting invitation
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);

  // Firebase auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setCurrentUser(profile);
          setUserOnlineStatus(profile.uid, true);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  // Subscribe to real-time game invitations for logged-in user
  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToUserInvites(currentUser.uid, (invites) => {
        setPendingInvites(invites);
        if (invites.length > 0) {
          setActiveInvite(invites[0]);
          soundFx.playNotification();
        } else {
          setActiveInvite(null);
        }
      });
      return () => unsub();
    }
  }, [currentUser?.uid]);

  const handleLogout = async () => {
    if (currentUser) {
      await setUserOnlineStatus(currentUser.uid, false);
    }
    await signOut(auth);
    setCurrentUser(null);
    setActiveTab('welcome');
  };

  const handleStartRoomFromInvite = (roomId: string) => {
    setJoinedRoomId(roomId);
    setActiveTab('online');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-2 border-[#D4AF37] rotate-45 flex items-center justify-center animate-spin mb-6">
          <span className="-rotate-45 text-xs font-serif text-[#D4AF37] font-bold">XO</span>
        </div>
        <p className="text-xs text-[#888] font-serif uppercase tracking-widest">جاري تجهيز ساحة التحدي...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0A0B] text-[#E0E0E0] font-sans selection:bg-[#D4AF37] selection:text-[#0A0A0B] flex flex-col">
      {/* Header Bar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
        pendingInvitesCount={pendingInvites.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        {/* WELCOME / LANDING PAGE */}
        {activeTab === 'welcome' && (
          <WelcomeView user={currentUser} onStart={(tab) => setActiveTab(tab)} />
        )}

        {/* AUTHENTICATION VIEW */}
        {activeTab === 'auth' && (
          <AuthView
            onAuthSuccess={(profile) => {
              setCurrentUser(profile);
              setActiveTab('menu');
            }}
          />
        )}

        {/* MAIN GAME MENU (AFTER LOGGING IN) */}
        {activeTab === 'menu' && (
          <div className="w-full max-w-2xl mx-auto space-y-6 text-right my-auto">
            <div className="bg-[#0F0F11] border border-[#D4AF37]/20 p-8 rounded-2xl space-y-2 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
              <h2 className="text-3xl font-serif font-bold text-[#F0F0F0]">
                أهلاً بك، {currentUser ? currentUser.displayName : 'اللاعب'}
              </h2>
              <p className="text-xs text-[#888] tracking-widest uppercase mt-1">اختر نمط التحدي وابدأ اللعب فوراً</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Online Mode */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('online');
                }}
                className="p-6 bg-[#0F0F11] border border-[#D4AF37]/20 hover:border-[#D4AF37] text-right space-y-3 group transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="w-10 h-10 border border-[#D4AF37]/40 bg-[#1A1A1C] text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0B] transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#F0F0F0] tracking-wide">مواجهة أونلاين مباشر</h3>
                  <p className="text-xs text-[#888] mt-1">غرف حية ودعوات سريعة مع لاعبين عبر الإنترنت.</p>
                </div>
              </button>

              {/* AI Mode */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('ai');
                }}
                className="p-6 bg-[#0F0F11] border border-[#D4AF37]/20 hover:border-[#D4AF37] text-right space-y-3 group transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="w-10 h-10 border border-[#D4AF37]/40 bg-[#1A1A1C] text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0B] transition-colors">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#F0F0F0] tracking-wide">ضد الكمبيوتر الذكي</h3>
                  <p className="text-xs text-[#888] mt-1">مستويات متعددة من العادي إلى المستحيل.</p>
                </div>
              </button>

              {/* Local Friend Mode */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('local');
                }}
                className="p-6 bg-[#0F0F11] border border-[#D4AF37]/20 hover:border-[#D4AF37] text-right space-y-3 group transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="w-10 h-10 border border-[#D4AF37]/40 bg-[#1A1A1C] text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0B] transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#F0F0F0] tracking-wide">لاعبان على نفس الجهاز</h3>
                  <p className="text-xs text-[#888] mt-1">العب مع صديقك بجانبك بدون إنترنت.</p>
                </div>
              </button>

              {/* Leaderboard */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('leaderboard');
                }}
                className="p-6 bg-[#0F0F11] border border-[#D4AF37]/20 hover:border-[#D4AF37] text-right space-y-3 group transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="w-10 h-10 border border-[#D4AF37]/40 bg-[#1A1A1C] text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0B] transition-colors">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#F0F0F0] tracking-wide">لوحة 10 المتصدرين</h3>
                  <p className="text-xs text-[#888] mt-1">استعرض ترتيب أبطال السيرفر ونقاطهم.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* AI GAME MODE */}
        {activeTab === 'ai' && (
          <AIGameView
            user={currentUser}
            onUpdateUser={setCurrentUser}
            onBack={() => setActiveTab(currentUser ? 'menu' : 'welcome')}
          />
        )}

        {/* LOCAL FRIEND GAME MODE */}
        {activeTab === 'local' && (
          <LocalGameView onBack={() => setActiveTab(currentUser ? 'menu' : 'welcome')} />
        )}

        {/* ONLINE ROOMS HUB */}
        {activeTab === 'online' && currentUser && (
          <OnlineRoomsView
            user={currentUser}
            onUpdateUser={setCurrentUser}
            onBack={() => setActiveTab('menu')}
            initialRoomId={joinedRoomId}
          />
        )}

        {/* FRIENDS LIST & INVITES */}
        {activeTab === 'friends' && currentUser && (
          <FriendsView
            user={currentUser}
            onStartRoomWithInvite={handleStartRoomFromInvite}
            onBack={() => setActiveTab('menu')}
          />
        )}

        {/* LEADERBOARD (TOP 10) */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView onBack={() => setActiveTab(currentUser ? 'menu' : 'welcome')} />
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <AchievementsView user={currentUser} onBack={() => setActiveTab(currentUser ? 'menu' : 'welcome')} />
        )}

        {/* USER PROFILE */}
        {activeTab === 'profile' && currentUser && (
          <ProfileView
            user={currentUser}
            onUpdateUser={setCurrentUser}
            onBack={() => setActiveTab('menu')}
          />
        )}
      </main>

      {/* Floating Incoming Invite Notification Popup */}
      <InviteModal
        invite={activeInvite}
        onAcceptRoom={handleStartRoomFromInvite}
        onClearInvite={() => setActiveInvite(null)}
      />
    </div>
  );
}
