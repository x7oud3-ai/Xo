import React, { useState } from 'react';
import { GameBoard } from './GameBoard';
import { calculateWinner } from '../services/gameService';
import { soundFx } from '../lib/audio';
import { Users, ArrowRight, RotateCcw } from 'lucide-react';

interface LocalGameViewProps {
  onBack: () => void;
}

export const LocalGameView: React.FC<LocalGameViewProps> = ({ onBack }) => {
  const [playerXName, setPlayerXName] = useState('اللاعب 1 (X)');
  const [playerOName, setPlayerOName] = useState('اللاعب 2 (O)');
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [turnSymbol, setTurnSymbol] = useState<'X' | 'O'>('X');
  const [scores, setScores] = useState({ x: 0, o: 0 });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const handleCellClick = (index: number) => {
    if (board[index] !== '' || winner !== null) return;

    if (turnSymbol === 'X') {
      soundFx.playMoveX();
    } else {
      soundFx.playMoveO();
    }

    const newBoard = [...board];
    newBoard[index] = turnSymbol;
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result.winner) {
      setWinningLine(result.winningLine);
      setWinner(result.winner);
      if (result.winner === 'X') {
        soundFx.playWin();
        setScores((prev) => ({ ...prev, x: prev.x + 1 }));
      } else if (result.winner === 'O') {
        soundFx.playWin();
        setScores((prev) => ({ ...prev, o: prev.o + 1 }));
      } else {
        soundFx.playClick();
      }
    } else {
      setTurnSymbol(turnSymbol === 'X' ? 'O' : 'X');
    }
  };

  const handleRematch = () => {
    setBoard(Array(9).fill(''));
    setWinningLine(null);
    setWinner(null);
    setTurnSymbol('X');
  };

  const handleResetScores = () => {
    setScores({ x: 0, o: 0 });
    handleRematch();
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
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#F0F0F0]">Pass & Play</h2>
            <p className="text-xs text-[#888] uppercase tracking-widest">لاعبان على نفس الجهاز</p>
          </div>
        </div>
      </div>

      {/* Custom Names */}
      <div className="grid grid-cols-2 gap-3 bg-[#0F0F11] p-4 border border-[#D4AF37]/20">
        <div>
          <label className="block text-[11px] font-semibold text-[#D4AF37] mb-1 uppercase tracking-widest">اسم صاحب الرمز X:</label>
          <input
            type="text"
            value={playerXName}
            onChange={(e) => setPlayerXName(e.target.value)}
            className="w-full bg-[#0A0A0B] border border-[#D4AF37]/30 text-[#F0F0F0] text-xs px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#F0F0F0] mb-1 uppercase tracking-widest">اسم صاحب الرمز O:</label>
          <input
            type="text"
            value={playerOName}
            onChange={(e) => setPlayerOName(e.target.value)}
            className="w-full bg-[#0A0A0B] border border-[#D4AF37]/30 text-[#F0F0F0] text-xs px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Board */}
      <GameBoard
        board={board}
        onCellClick={handleCellClick}
        turnSymbol={turnSymbol}
        isMyTurn={true}
        playerXName={playerXName}
        playerOName={playerOName}
        scoreX={scores.x}
        scoreO={scores.o}
        winningLine={winningLine}
        winner={winner}
        onRematch={handleRematch}
        onResetScores={handleResetScores}
      />
    </div>
  );
};
