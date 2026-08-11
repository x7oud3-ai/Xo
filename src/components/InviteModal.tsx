import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { respondToInvite } from '../services/gameService';
import { soundFx } from '../lib/audio';
import { GameInvite } from '../types';
import { Swords, Check, X, BellRing } from 'lucide-react';

interface InviteModalProps {
  invite: GameInvite | null;
  onAcceptRoom: (roomId: string) => void;
  onClearInvite: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  invite,
  onAcceptRoom,
  onClearInvite,
}) => {
  if (!invite) return null;

  const handleAccept = async () => {
    soundFx.playWin();
    try {
      await respondToInvite(invite.id, true);
      onAcceptRoom(invite.roomId);
    } catch (err) {
      console.error('Error accepting invite:', err);
    } finally {
      onClearInvite();
    }
  };

  const handleDecline = async () => {
    soundFx.playClick();
    try {
      await respondToInvite(invite.id, false);
    } catch (err) {
      console.error('Error declining invite:', err);
    } finally {
      onClearInvite();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm p-5 bg-[#0F0F11] border-2 border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/20 text-right backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 border border-[#D4AF37] bg-[#1A1A1C] text-[#D4AF37] flex items-center justify-center font-bold animate-bounce">
            <BellRing className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold text-[#D4AF37] tracking-widest uppercase">دعوة تحدي أونلاين ⚔️</h4>
            <p className="text-sm font-bold text-[#F0F0F0] mt-0.5">{invite.fromName} يدعوك لمواجهة X O أونلاين</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAccept}
            className="flex-1 py-3 px-4 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs tracking-wider uppercase hover:bg-[#B8962D] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>قبول التحدي والدخول</span>
          </button>

          <button
            onClick={handleDecline}
            className="py-3 px-4 bg-[#1A1A1C] border border-[#F44]/40 text-[#F44] hover:bg-[#F44]/10 text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
