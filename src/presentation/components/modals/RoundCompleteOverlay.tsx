import React from 'react';
import { GameState } from '@/core/game/types';

interface RoundCompleteOverlayProps {
  gameState: GameState;
  reward: number;
}

export const RoundCompleteOverlay: React.FC<RoundCompleteOverlayProps> = ({ 
  gameState, 
  reward 
}) => {
  if (gameState !== GameState.ROUND_COMPLETE) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-8">
      <div className="text-center bg-green-900/30 backdrop-blur-sm rounded-xl border border-green-500/30 max-w-md w-full" style={{ padding: '2ch' }}>
        <div className="text-2xl font-bold text-green-400">
          Round Complete!
        </div>
        <div className="text-lg text-green-300 mt-2">
          +{reward > 0 ? reward.toFixed(2) : '0.00'} tickets
        </div>
      </div>
    </div>
  );
};