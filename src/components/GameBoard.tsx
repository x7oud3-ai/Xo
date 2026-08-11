import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { soundFx } from '../lib/audio';
import { RefreshCw, RotateCcw, Send, MessageSquare, Trophy, AlertCircle, Sparkles } from 'lucide-react';

interface GameBoardProps {
  board: string[];
  onCellClick: (index: number) => void;
  turnSymbol: 'X' | 'O';
  isMyTurn: boolean;
  playerXName: string;
  playerXPhoto?: string;
  playerOName: string;
  playerOPhoto?: string;
  scoreX: number;
  scoreO: number;
  winningLine: number[] | null;
  winner: string | null; // 'X' | 'O' | 'draw' | uid | null
  mySymbol?: 'X' | 'O';
  onRematch?: () => void;
  onResetScores?: () => void;
  messages?: Array<{ id: string; senderId: string; senderName: string; text: string }>;
  onSendMessage?: (text: string) => void;
  statusText?: string;
}

const QUICK_EMOJIS = ['🔥', '😎', '👏', '😱', '🤖', '👑', '🎉', '💪'];

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onCellClick,
  turnSymbol,
  isMyTurn,
  playerXName,
  playerXPhoto,
  playerOName,
  playerOPhoto,
  scoreX,
  scoreO,
  winningLine,
  winner,
  mySymbol,
  onRematch,
  onResetScores,
  messages,
  onSendMessage,
  statusText,
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  // Fire confetti on win
  useEffect(() => {
    if (winner && winner !== 'draw') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [winner]);

  const handleSend = (text: string) => {
    if (!text.trim() || !onSendMessage) return;
    onSendMessage(text.trim());
    setCustomMsg('');
    soundFx.playClick();
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 p-2 text-right">
      {/* Header Player Cards */}
      <div className="w-full grid grid-cols-2 gap-3">
        {/* Player X */}
        <div
          className={`p-3.5 border transition-all flex items-center justify-between gap-2 ${
            turnSymbol === 'X' && !winner
              ? 'bg-[#1A1A1C] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
              : 'bg-[#0F0F11] border-[#222]'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {playerXPhoto ? (
              <img src={playerXPhoto} alt={playerXName} className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#D4AF37]/40" />
            ) : (
              <div className="w-9 h-9 border border-[#D4AF37]/40 bg-[#0A0A0B] flex items-center justify-center font-serif font-bold text-[#D4AF37]">
                X
              </div>
            )}
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-[#F0F0F0] truncate flex items-center gap-1">
                <span>{playerXName}</span>
                {mySymbol === 'X' && <span className="text-[10px] text-[#D4AF37] font-normal">(أنت)</span>}
              </div>
              <div className="text-[11px] text-[#D4AF37] font-serif font-bold">SYMBOL X</div>
            </div>
          </div>
          <div className="text-xl font-serif font-bold text-[#D4AF37] pl-1">{scoreX}</div>
        </div>

        {/* Player O */}
        <div
          className={`p-3.5 border transition-all flex items-center justify-between gap-2 ${
            turnSymbol === 'O' && !winner
              ? 'bg-[#1A1A1C] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
              : 'bg-[#0F0F11] border-[#222]'
          }`}
        >
          <div className="text-xl font-serif font-bold text-[#F0F0F0] pr-1">{scoreO}</div>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="overflow-hidden text-left">
              <div className="text-xs font-bold text-[#F0F0F0] truncate flex items-center gap-1 justify-end">
                {mySymbol === 'O' && <span className="text-[10px] text-[#D4AF37] font-normal">(أنت)</span>}
                <span>{playerOName}</span>
              </div>
              <div className="text-[11px] text-[#F0F0F0] font-serif font-bold">SYMBOL O</div>
            </div>
            {playerOPhoto ? (
              <img src={playerOPhoto} alt={playerOName} className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#D4AF37]/40" />
            ) : (
              <div className="w-9 h-9 border border-[#D4AF37]/40 bg-[#0A0A0B] flex items-center justify-center font-serif font-bold text-[#F0F0F0]">
                O
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Turn Banner */}
      <div className="w-full text-center">
        {statusText ? (
          <div className="text-xs font-serif font-bold text-[#D4AF37] bg-[#1A1A1C] border border-[#D4AF37]/30 py-2 px-4 inline-block uppercase tracking-wider">
            {statusText}
          </div>
        ) : !winner ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F0F11] border border-[#D4AF37]/20 text-[#E0E0E0] text-xs font-serif font-bold tracking-wider uppercase">
            <span className={turnSymbol === 'X' ? 'text-[#D4AF37]' : 'text-[#F0F0F0]'}>
              دور اللاعب: ({turnSymbol})
            </span>
            {mySymbol && (
              <span className={isMyTurn ? 'text-[#D4AF37] animate-pulse' : 'text-[#666]'}>
                {isMyTurn ? '• دورك الآن!' : '• انتظر منافسك'}
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* 3x3 Grid Board */}
      <div className="relative w-full aspect-square max-w-[360px] bg-[#0F0F11] border-2 border-[#D4AF37]/40 p-3 shadow-2xl grid grid-cols-3 gap-3">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: cell === '' && isMyTurn ? 1.03 : 1 }}
              whileTap={{ scale: cell === '' && isMyTurn ? 0.97 : 1 }}
              onClick={() => {
                if (cell === '' && isMyTurn && !winner) {
                  onCellClick(idx);
                }
              }}
              disabled={cell !== '' || !isMyTurn || winner !== null}
              className={`relative font-serif font-black text-4xl sm:text-5xl flex items-center justify-center transition-all cursor-pointer select-none ${
                isWinningCell
                  ? cell === 'X'
                    ? 'bg-[#D4AF37] text-[#0A0A0B] shadow-xl shadow-[#D4AF37]/30 scale-105'
                    : 'bg-[#F0F0F0] text-[#0A0A0B] shadow-xl shadow-white/20 scale-105'
                  : cell === 'X'
                  ? 'bg-[#1A1A1C] text-[#D4AF37] border border-[#D4AF37]/30'
                  : cell === 'O'
                  ? 'bg-[#1A1A1C] text-[#F0F0F0] border border-[#555]'
                  : 'bg-[#0A0A0B] border border-[#222] hover:bg-[#1A1A1C] hover:border-[#D4AF37]/30'
              }`}
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    key={cell}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* Winner / Draw Modal Overlay */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-[#0A0A0B]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 border-2 border-[#D4AF37]"
            >
              {winner === 'draw' ? (
                <>
                  <div className="w-14 h-14 border border-[#D4AF37] bg-[#1A1A1C] flex items-center justify-center text-[#D4AF37] text-2xl font-bold">
                    🤝
                  </div>
                  <h3 className="text-2xl font-serif text-[#F0F0F0]">DRAW GAME</h3>
                  <p className="text-xs text-[#888]">أداء متكافئ من كلا الطرفين.</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 border border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0B] flex items-center justify-center text-2xl font-bold shadow-lg shadow-[#D4AF37]/20">
                    🏆
                  </div>
                  <h3 className="text-2xl font-serif text-[#F0F0F0]">
                    {winner === mySymbol
                      ? 'VICTORY! 🎉'
                      : winner === 'X'
                      ? `${playerXName} WINS!`
                      : `${playerOName} WINS!`}
                  </h3>
                  <p className="text-xs text-[#888]">مواجهة أسطورية رائعة!</p>
                </>
              )}

              <div className="flex items-center gap-3 pt-2 w-full max-w-xs">
                {onRematch && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onRematch();
                    }}
                    className="flex-1 py-3 px-4 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs uppercase tracking-widest hover:bg-[#B8962D] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>جولة جديدة</span>
                  </button>
                )}
                {onResetScores && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onResetScores();
                    }}
                    className="py-3 px-3 bg-[#1A1A1C] border border-[#222] text-[#888] hover:text-[#F0F0F0] transition-colors cursor-pointer"
                    title="تصفير النقاط"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Online Chat / Quick Emojis Drawer */}
      {onSendMessage && (
        <div className="w-full bg-[#0F0F11] border border-[#D4AF37]/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setChatOpen(!chatOpen);
              }}
              className="text-xs font-serif font-bold text-[#D4AF37] flex items-center gap-1.5 hover:underline"
            >
              <MessageSquare className="w-4 h-4" />
              <span>المحادثة المباشرة وإيموجي التفاعل</span>
            </button>
            <span className="text-[10px] text-[#666] uppercase">انقر للتفاعل</span>
          </div>

          {/* Quick Emojis bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSend(emoji)}
                className="p-1.5 bg-[#1A1A1C] border border-[#222] hover:border-[#D4AF37] text-lg transition-transform active:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Expanded Chat Messages */}
          {chatOpen && (
            <div className="mt-3 space-y-2 border-t border-[#D4AF37]/10 pt-3">
              <div className="max-h-32 overflow-y-auto space-y-1.5 text-xs pr-1">
                {messages && messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg.id} className="bg-[#0A0A0B] p-2 border border-[#222]">
                      <span className="font-bold text-[#D4AF37] ml-1">{msg.senderName}:</span>
                      <span className="text-[#F0F0F0]">{msg.text}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-[#666] text-center py-2">لا توجد رسائل بعد...</div>
                )}
              </div>

              {/* Custom message input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اكتب رسالة سريعة..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(customMsg)}
                  className="flex-1 bg-[#0A0A0B] border border-[#D4AF37]/30 text-[#F0F0F0] text-xs px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  onClick={() => handleSend(customMsg)}
                  className="p-2 bg-[#D4AF37] text-[#0A0A0B] hover:bg-[#B8962D] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
