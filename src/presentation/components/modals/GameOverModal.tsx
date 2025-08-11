import React from 'react';
import { GameState } from '@/core/game/types';

interface GameOverModalProps {
  gameState: GameState;
  round: number;
  totalEarned: number;
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ 
  gameState, 
  round, 
  totalEarned, 
  onPlayAgain 
}) => {
  if (gameState !== GameState.ROUND_FAILED) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-8">
      <div className="text-center space-y-4 rounded-lg border-2 border-gray-600 shadow-2xl max-w-md w-full" style={{ backgroundColor: '#F5E6CF', padding: '2ch' }}>
        <div className="text-3xl font-bold" style={{ color: '#DB5461' }}>
          Game Over!
        </div>
        <div className="text-xl" style={{ color: '#4A4A4A' }}>
          Reached Round {round}
        </div>
        <div className="text-lg" style={{ color: '#4A4A4A' }}>
          Total Earned: <span style={{ color: '#6461A0' }}>{totalEarned.toFixed(2)} tickets</span>
        </div>
        <button
          onClick={onPlayAgain}
          className="px-8 py-3 rounded-lg font-semibold transition-colors border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};