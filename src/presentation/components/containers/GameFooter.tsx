import React from 'react';
import { GameVariation } from '@/core/game/types';
import { TicketManager } from '@/core/economy/TicketManager';

interface GameFooterProps {
  ticketManager: TicketManager | null;
  round: number;
  currentVariation: GameVariation | null;
}

export const GameFooter: React.FC<GameFooterProps> = ({
  ticketManager,
  round,
  currentVariation
}) => {
  return (
    <div className="bg-black/20 text-white flex items-center justify-center" style={{ height: '10vh' }}>
      <div className="text-center text-lg font-mono">
        Current Round Reward: {ticketManager ? ticketManager.calculateReward(round, currentVariation || GameVariation.NONE).toFixed(2) : '0.00'}
      </div>
    </div>
  );
};