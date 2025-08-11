import { useState, useCallback } from 'react';
import { GameEngine } from '@/core/game/GameEngine';
import { GameState, GemstoneType } from '@/core/game/types';
import { TicketManager } from '@/core/economy/TicketManager';

interface UseGameEngineResult {
  game: GameEngine;
  gameState: GameState;
  round: number;
  pattern: GemstoneType[];
  totalEarned: number;
  startGame: () => void;
  handleGemClick: (gemType: GemstoneType, canInput: boolean) => boolean;
  resetGame: () => void;
  updateGameState: () => void;
}

export const useGameEngine = (ticketManager: TicketManager | null): UseGameEngineResult => {
  const [game] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState<GameState>(game.getState());
  const [round, setRound] = useState(game.getRound());
  const [pattern, setPattern] = useState<GemstoneType[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  const updateGameState = useCallback(() => {
    setGameState(game.getState());
    setRound(game.getRound());
    setPattern(game.getPattern());
    
    // Update ticket display if round completed
    if (game.getState() === GameState.ROUND_COMPLETE && game.getLastReward() > 0) {
      const reward = game.getLastReward();
      setTotalEarned(prev => prev + reward);
    }
  }, [game]);

  const startGame = useCallback(() => {
    // Use ticket system if available
    if (ticketManager) {
      if (!game.startGameWithTickets()) {
        // Insufficient funds
        return;
      }
    } else {
      game.startGame();
    }
    
    updateGameState();
  }, [game, ticketManager, updateGameState]);

  const handleGemClick = useCallback((gemType: GemstoneType, canInput: boolean): boolean => {
    if (!canInput) return false;
    
    // Prevent clicks if we've already completed the pattern
    if (game.getPlayerInput().length >= game.getPattern().length) {
      console.log('   Pattern already complete, ignoring click');
      return false;
    }
    
    const success = game.handlePlayerInput(gemType);
    updateGameState();
    
    return success;
  }, [game, updateGameState]);

  const resetGame = useCallback(() => {
    game.resetGame();
    updateGameState();
    setTotalEarned(0);
  }, [game, updateGameState]);

  // Set ticket manager when it becomes available
  if (ticketManager && game.getTicketManager() !== ticketManager) {
    game.setTicketManager(ticketManager);
  }

  return {
    game,
    gameState,
    round,
    pattern,
    totalEarned,
    startGame,
    handleGemClick,
    resetGame,
    updateGameState
  };
};