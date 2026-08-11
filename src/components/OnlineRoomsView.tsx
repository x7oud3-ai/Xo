import React, { useState, useEffect } from 'react';
import { GameBoard } from './GameBoard';
import {
  createOnlineRoom,
  joinOnlineRoom,
  makeMoveInRoom,
  resetRoomGame,
  sendQuickMessage,
  subscribeToGameRoom,
  subscribeToPublicRooms,
} from '../services/gameService';
import { updateUserStats } from '../services/userService';
import { checkNewAchievements } from '../data/achievements';
import { soundFx } from '../lib/audio';
import { GameRoom, UserProfile } from '../types';
import {
  Globe,
  Plus,
  Key,
  Users,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Loader2,
  Lock,
  DoorOpen,
} from 'lucide-react';

interface OnlineRoomsViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onBack: () => void;
  initialRoomId?: string | null;
}

export const OnlineRoomsView: React.FC<OnlineRoomsViewProps> = ({
  user,
  onUpdateUser,
  onBack,
  initialRoomId,
}) => {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(initialRoomId || null);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [publicRooms, setPublicRooms] = useState<GameRoom[]>([]);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Subscribe to public rooms list when outside room
  useEffect(() => {
    if (!activeRoomId) {
      const unsub = subscribeToPublicRooms((rooms) => {
        setPublicRooms(rooms);
      });
      return () => unsub();
    }
  }, [activeRoomId]);

  // Subscribe to active room document when inside a room
  useEffect(() => {
    if (activeRoomId) {
      const unsub = subscribeToGameRoom(activeRoomId, (room) => {
        setCurrentRoom(room);
      });
      return () => unsub();
    }
  }, [activeRoomId]);

  // Handle game end & points recording for online matches
  useEffect(() => {
    if (currentRoom && currentRoom.status === 'finished' && currentRoom.winner) {
      if (currentRoom.winner === 'draw') {
        soundFx.playClick();
        updateUserStats(user.uid, 'draw', 5).then((up) => up && onUpdateUser(up));
      } else if (currentRoom.winner === user.uid) {
        soundFx.playWin();
        const newAchs = checkNewAchievements(user, { onlineWins: (user.wins || 0) + 1 });
        updateUserStats(user.uid, 'win', 30, newAchs).then((up) => up && onUpdateUser(up));
      } else {
        soundFx.playLose();
        updateUserStats(user.uid, 'loss', 0).then((up) => up && onUpdateUser(up));
      }
    }
  }, [currentRoom?.status, currentRoom?.winner]);

  // Create room
  const handleCreateRoom = async (isPublic: boolean) => {
    setError(null);
    setLoading(true);
    soundFx.playClick();
    try {
      const roomId = await createOnlineRoom(user, isPublic);
      setActiveRoomId(roomId);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الغرفة');
    } finally {
      setLoading(false);
    }
  };

  // Join room by code
  const handleJoinByCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setError(null);
    setLoading(true);
    soundFx.playClick();
    try {
      await joinOnlineRoom(cleanCode, user);
      setActiveRoomId(cleanCode);
    } catch (err: any) {
      setError(err.message || 'فشل الانضمام للغرفة');
    } finally {
      setLoading(false);
    }
  };

  // Make move in room
  const handleCellClick = async (index: number) => {
    if (!currentRoom || !activeRoomId) return;

    const mySymbol = currentRoom.hostId === user.uid ? currentRoom.hostSymbol : currentRoom.guestSymbol;
    const isMyTurn = currentRoom.turn === user.uid;

    if (!isMyTurn || currentRoom.status !== 'playing') return;

    if (mySymbol === 'X') soundFx.playMoveX();
    else soundFx.playMoveO();

    const opponentUid = currentRoom.hostId === user.uid ? currentRoom.guestId : currentRoom.hostId;

    try {
      await makeMoveInRoom(activeRoomId, index, mySymbol, user.uid, opponentUid || user.uid);
    } catch (err) {
      console.error('Move error:', err);
    }
  };

  const handleRematch = async () => {
    if (!currentRoom || !activeRoomId) return;
    soundFx.playClick();
    const nextTurnUid = currentRoom.hostId;
    await resetRoomGame(activeRoomId, nextTurnUid);
  };

  const handleSendMessage = async (text: string) => {
    if (!activeRoomId) return;
    await sendQuickMessage(activeRoomId, user.uid, user.displayName, text);
  };

  const copyRoomCode = () => {
    if (activeRoomId) {
      navigator.clipboard.writeText(activeRoomId);
      setCopiedCode(true);
      soundFx.playClick();
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // IF INSIDE AN ACTIVE ONLINE ROOM
  if (activeRoomId && currentRoom) {
    const isHost = currentRoom.hostId === user.uid;
    const mySymbol = isHost ? currentRoom.hostSymbol : currentRoom.guestSymbol;
    const isMyTurn = currentRoom.turn === user.uid;

    const hostName = currentRoom.hostName;
    const hostPhoto = currentRoom.hostPhoto;
    const guestName = currentRoom.guestName || 'في انتظار لاعب...';
    const guestPhoto = currentRoom.guestPhoto || undefined;

    const scoreHost = currentRoom.scores[currentRoom.hostId] || 0;
    const scoreGuest = currentRoom.guestId ? currentRoom.scores[currentRoom.guestId] || 0 : 0;

    return (
      <div className="w-full max-w-2xl mx-auto p-4 space-y-6 text-right">
        {/* Room Header Banner */}
        <div className="flex items-center justify-between bg-[#0F0F11] border border-[#D4AF37]/20 p-4">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveRoomId(null);
              setCurrentRoom(null);
            }}
            className="px-3 py-1.5 bg-[#1A1A1C] border border-[#222] text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 uppercase cursor-pointer"
          >
            <DoorOpen className="w-4 h-4 text-red-400" />
            <span>مغادرة الغرفة</span>
          </button>

          {/* Copy Room Code Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyRoomCode}
              className="px-3 py-1.5 bg-[#1A1A1C] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-serif font-bold flex items-center gap-2 hover:bg-[#D4AF37]/10 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>معرف الغرفة: {activeRoomId}</span>
            </button>
          </div>
        </div>

        {/* Room Status Indicator */}
        {currentRoom.status === 'waiting' && (
          <div className="bg-[#1A1A1C] border border-[#D4AF37]/30 p-4 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin mx-auto" />
            <h4 className="text-sm font-serif font-bold text-[#D4AF37]">في انتظار انضمام منافس للغرفة...</h4>
            <p className="text-xs text-[#888]">
              شارك معرف الغرفة <span className="font-mono text-[#F0F0F0] bg-[#0A0A0B] px-2 py-0.5 border border-[#222]">{activeRoomId}</span> مع صديقك أو انشئ دعوة.
            </p>
          </div>
        )}

        {/* Game Board Component */}
        <GameBoard
          board={currentRoom.board}
          onCellClick={handleCellClick}
          turnSymbol={currentRoom.turn === currentRoom.hostId ? currentRoom.hostSymbol : currentRoom.guestSymbol}
          isMyTurn={isMyTurn}
          playerXName={hostName}
          playerXPhoto={hostPhoto}
          playerOName={guestName}
          playerOPhoto={guestPhoto}
          scoreX={scoreHost}
          scoreO={scoreGuest}
          winningLine={currentRoom.winningLine}
          winner={currentRoom.winner}
          mySymbol={mySymbol}
          onRematch={handleRematch}
          messages={currentRoom.messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    );
  }

  // ROOMS LOBBY / HUB
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
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#F0F0F0]">Online Arena</h2>
            <p className="text-xs text-[#888] uppercase tracking-widest">انشئ غرفة أو انضم لغرف اللاعبين الحية</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#1A1A1C] border border-red-500/40 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Create Public Room */}
        <button
          onClick={() => handleCreateRoom(true)}
          disabled={loading}
          className="p-5 bg-[#0F0F11] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-right space-y-3 group transition-all cursor-pointer shadow-xl"
        >
          <div className="w-10 h-10 border border-[#D4AF37] bg-[#1A1A1C] text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0B] transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#F0F0F0]">إنشاء غرفة عامة جديدة</h3>
          <p className="text-xs text-[#888]">يمكن لأي لاعب عبر الشبكة الانضمام والتحدي معك.</p>
        </button>

        {/* Create Private Room */}
        <button
          onClick={() => handleCreateRoom(false)}
          disabled={loading}
          className="p-5 bg-[#0F0F11] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-right space-y-3 group transition-all cursor-pointer shadow-xl"
        >
          <div className="w-10 h-10 border border-[#D4AF37] bg-[#1A1A1C] text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0B] transition-colors">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#F0F0F0]">إنشاء غرفة خاصة بكود</h3>
          <p className="text-xs text-[#888]">غرفة سريّة يمكنك مشاركة الكود مع صديقك فقط.</p>
        </button>
      </div>

      {/* Join Room by Code */}
      <div className="bg-[#0F0F11] border border-[#D4AF37]/20 p-4 space-y-3">
        <h3 className="text-xs font-serif font-bold text-[#D4AF37] flex items-center gap-2 uppercase tracking-wider">
          <Key className="w-4 h-4 text-[#D4AF37]" />
          <span>الانضمام لغرفة باستخدام الكود:</span>
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="أدخل كود الغرفة (مثال: room_ABC123)..."
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            className="flex-1 bg-[#0A0A0B] border border-[#D4AF37]/30 text-[#F0F0F0] text-xs px-3 py-2.5 focus:outline-none focus:border-[#D4AF37] uppercase font-mono"
          />
          <button
            onClick={() => handleJoinByCode(joinCodeInput)}
            disabled={loading || !joinCodeInput.trim()}
            className="px-5 py-2.5 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs uppercase tracking-widest hover:bg-[#B8962D] transition-all cursor-pointer disabled:opacity-50"
          >
            دخول
          </button>
        </div>
      </div>

      {/* Active Public Rooms List */}
      <div className="space-y-3">
        <h3 className="text-sm font-serif font-bold text-[#F0F0F0] flex items-center justify-between border-b border-[#D4AF37]/10 pb-2">
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            <span>الغرف العامة المتاحة حالياً:</span>
          </span>
          <span className="text-xs font-normal text-[#888]">({publicRooms.length} غرفة)</span>
        </h3>

        {publicRooms.length > 0 ? (
          <div className="space-y-2">
            {publicRooms.map((rm) => (
              <div
                key={rm.id}
                className="bg-[#0F0F11] border border-[#222] hover:border-[#D4AF37]/50 p-3.5 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={rm.hostPhoto} alt={rm.hostName} className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/40" />
                  <div>
                    <h4 className="text-xs font-bold text-[#F0F0F0]">{rm.hostName}</h4>
                    <span className="text-[10px] text-[#888]">غرفة عامة بانتظار لاعب</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinByCode(rm.id)}
                  className="px-4 py-2 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider hover:bg-[#B8962D] transition-all cursor-pointer"
                >
                  انضمام للعب
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0F0F11] border border-[#222] text-[#888] text-xs space-y-2">
            <p>لا توجد غرف عامة شاغرة حالياً.</p>
            <p className="text-[11px] text-[#666]">كن أول من ينشئ غرفة عامة ليلعب معك الآخرون!</p>
          </div>
        )}
      </div>
    </div>
  );
};
