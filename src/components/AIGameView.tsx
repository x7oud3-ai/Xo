import React, { useState, useEffect } from 'react';
import { GameBoard } from './GameBoard';
import { calculateWinner, WINNING_COMBINATIONS } from '../services/gameService';
import { soundFx } from '../lib/audio';
import { updateUserStats } from '../services/userService';
import { checkNewAchievements } from '../data/achievements';
import { UserProfile } from '../types';
import { Bot, Zap, Shield, Flame, ArrowRight } from 'lucide-react';

interface AIGameViewProps {
  user: UserProfile | null;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onBack: () => void;
}

type AIDifficulty = 'easy' | 'medium' | 'impossible';

export const AIGameView: React.FC<AIGameViewProps> = ({ user, onUpdateUser, onBack }) => {
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [turnSymbol, setTurnSymbol] = useState<'X' | 'O'>('X');
  const [scores, setScores] = useState({ user: 0, ai: 0 });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // AI Move Engine
  useEffect(() => {
    if (turnSymbol === 'O' && !winner && !isThinking) {
      setIsThinking(true);
      const timer = setTimeout(() => {
        makeAIMove();
        setIsThinking(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [turnSymbol, winner]);

  // Handle cell click by human player (Symbol X)
  const handleCellClick = (index: number) => {
    if (board[index] !== '' || turnSymbol !== 'X' || winner !== null) return;

    soundFx.playMoveX();
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result.winner) {
      handleGameOver(result.winner, result.winningLine, newBoard);
    } else {
      setTurnSymbol('O');
    }
  };

  // AI Move Decision
  const makeAIMove = () => {
    const emptyIndices = board.map((v, i) => (v === '' ? i : null)).filter((v) => v !== null) as number[];
    if (emptyIndices.length === 0) return;

    let moveIndex: number;

    if (difficulty === 'easy') {
      // Random move
      moveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    } else if (difficulty === 'medium') {
      // 50% minimax, 50% random or block immediate win
      const winMove = findWinningMove(board, 'O') ?? findWinningMove(board, 'X');
      if (winMove !== null) {
        moveIndex = winMove;
      } else {
        moveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
    } else {
      // Minimax Impossible algorithm
      moveIndex = getBestMinimaxMove(board);
    }

    soundFx.playMoveO();
    const newBoard = [...board];
    newBoard[moveIndex] = 'O';
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result.winner) {
      handleGameOver(result.winner, result.winningLine, newBoard);
    } else {
      setTurnSymbol('X');
    }
  };

  const findWinningMove = (currentBoard: string[], symbol: 'X' | 'O'): number | null => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      const cells = [currentBoard[a], currentBoard[b], currentBoard[c]];
      if (cells.filter((c) => c === symbol).length === 2 && cells.includes('')) {
        return combo[cells.indexOf('')];
      }
    }
    return null;
  };

  // Minimax Algorithm for unbeatable AI
  const getBestMinimaxMove = (currentBoard: string[]): number => {
    let bestScore = -Infinity;
    let bestMove = 0;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === '') {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = '';
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const minimax = (currentBoard: string[], depth: number, isMaximizing: boolean): number => {
    const result = calculateWinner(currentBoard);
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === '') {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === '') {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // Game over state handler & server score recording
  const handleGameOver = async (winnerSymbol: 'X' | 'O' | 'draw', line: number[] | null, finalBoard: string[]) => {
    setWinningLine(line);
    setWinner(winnerSymbol);

    if (winnerSymbol === 'X') {
      soundFx.playWin();
      setScores((prev) => ({ ...prev, user: prev.user + 1 }));

      if (user) {
        const pointsAwarded = difficulty === 'impossible' ? 25 : difficulty === 'medium' ? 15 : 10;
        const newAchs = checkNewAchievements(user, { aiMastered: difficulty === 'impossible' });
        const updated = await updateUserStats(user.uid, 'win', pointsAwarded, newAchs);
        if (updated) onUpdateUser(updated);
      }
    } else if (winnerSymbol === 'O') {
      soundFx.playLose();
      setScores((prev) => ({ ...prev, ai: prev.ai + 1 }));

      if (user) {
        const updated = await updateUserStats(user.uid, 'loss', 0);
        if (updated) onUpdateUser(updated);
      }
    } else {
      soundFx.playClick();
      if (user) {
        const updated = await updateUserStats(user.uid, 'draw', 5);
        if (updated) onUpdateUser(updated);
      }
    }
  };

  const handleRematch = () => {
    setBoard(Array(9).fill(''));
    setWinningLine(null);
    setWinner(null);
    setTurnSymbol('X');
  };

  const handleResetScores = () => {
    setScores({ user: 0, ai: 0 });
    handleRematch();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6 text-right">
      {/* Header & Back */}
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
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#F0F0F0]">VS AI Engine</h2>
            <p className="text-xs text-[#888] uppercase tracking-widest">تحدى الذكاء الاصطناعي الخارق</p>
          </div>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="bg-[#0F0F11] border border-[#D4AF37]/20 p-2 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            setDifficulty('easy');
            soundFx.playClick();
            handleRematch();
          }}
          className={`flex-1 py-2.5 px-3 text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            difficulty === 'easy'
              ? 'bg-[#D4AF37] text-[#0A0A0B]'
              : 'bg-[#1A1A1C] text-[#888] hover:text-[#F0F0F0]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>عادي</span>
        </button>

        <button
          onClick={() => {
            setDifficulty('medium');
            soundFx.playClick();
            handleRematch();
          }}
          className={`flex-1 py-2.5 px-3 text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            difficulty === 'medium'
              ? 'bg-[#D4AF37] text-[#0A0A0B]'
              : 'bg-[#1A1A1C] text-[#888] hover:text-[#F0F0F0]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>متوسط</span>
        </button>

        <button
          onClick={() => {
            setDifficulty('impossible');
            soundFx.playClick();
            handleRematch();
          }}
          className={`flex-1 py-2.5 px-3 text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            difficulty === 'impossible'
              ? 'bg-[#D4AF37] text-[#0A0A0B] shadow-lg shadow-[#D4AF37]/20'
              : 'bg-[#1A1A1C] text-[#888] hover:text-[#F0F0F0]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>خارق (مستحيل)</span>
        </button>
      </div>

      {/* Interactive Game Board */}
      <GameBoard
        board={board}
        onCellClick={handleCellClick}
        turnSymbol={turnSymbol}
        isMyTurn={turnSymbol === 'X' && !isThinking}
        playerXName={user ? user.displayName : 'أنت'}
        playerXPhoto={user?.photoURL}
        playerOName={`الكمبيوتر (${difficulty === 'impossible' ? 'خارق' : difficulty === 'medium' ? 'متوسط' : 'عادي'})`}
        scoreX={scores.user}
        scoreO={scores.ai}
        winningLine={winningLine}
        winner={winner}
        mySymbol="X"
        onRematch={handleRematch}
        onResetScores={handleResetScores}
        statusText={isThinking ? 'الكمبيوتر يفكر في خطوته القادمة...' : undefined}
      />
    </div>
  );
};
