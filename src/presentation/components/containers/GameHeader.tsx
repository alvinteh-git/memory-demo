import React from 'react';
import { GameState, GameVariation } from '@/core/game/types';
import { TicketManager } from '@/core/economy/TicketManager';
import { cn } from '@/lib/utils';

interface GameHeaderProps {
  ticketManager: TicketManager | null;
  round: number;
  totalEarned: number;
  currentVariation: GameVariation | null;
  gameState: GameState;
  timeLeft: number;
  timerSeconds: number;
  getTimerState: (totalDuration: number) => 'normal' | 'warning' | 'critical';
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  ticketManager,
  round,
  totalEarned,
  currentVariation,
  gameState,
  timeLeft,
  timerSeconds,
  getTimerState
}) => {
  return (
    <div className="bg-black/20 text-white px-6 flex flex-col justify-center" style={{ height: '20vh' }}>
      {/* Row 1: Balance and Round */}
      <div className="flex justify-between w-full text-lg font-mono">
        <div>Balance: {ticketManager ? ticketManager.getBalance().toFixed(2) : '0.00'}</div>
        <div>Round: {String(round).padStart(2, '0')}</div>
      </div>
      
      {/* Row 2: Earned and Next */}
      <div className="flex justify-between w-full text-lg font-mono mt-2">
        <div>Earned: {totalEarned.toFixed(2)}</div>
        <div>Next: {ticketManager ? ticketManager.calculateReward(round, currentVariation || GameVariation.NONE).toFixed(2) : '0.00'}</div>
      </div>
      
      {/* Timer Bar */}
      <div className="mt-3 w-full">
        <div className="timer-bar">
          <div 
            className={cn("timer-fill", gameState === GameState.PLAYER_INPUT ? getTimerState(timerSeconds) : '')}
            style={{ 
              width: gameState === GameState.PLAYER_INPUT ? `${(timeLeft / timerSeconds) * 100}%` : '0%',
              opacity: gameState === GameState.PLAYER_INPUT ? 1 : 0
            }}
          />
        </div>
      </div>
    </div>
  );
};