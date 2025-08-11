import { useState, useCallback } from 'react';
import { GemstoneType, GameState, GameVariation } from '@/core/game/types';
import { GEMSTONES } from '@/core/game/constants';
import { GameEngine } from '@/core/game/GameEngine';

interface UseGemClickHandlerResult {
  lastClickTime: number;
  handleGemClick: (
    gemType: GemstoneType,
    game: GameEngine,
    canInput: boolean,
    handleGemClickBase: (gemType: GemstoneType, canInput: boolean) => boolean,
    setCanInput: (value: boolean) => void,
    onRoundComplete: () => void,
    onVariationIntro: () => void
  ) => void;
}

export const useGemClickHandler = (): UseGemClickHandlerResult => {
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleGemClick = useCallback((
    gemType: GemstoneType,
    game: GameEngine,
    canInput: boolean,
    handleGemClickBase: (gemType: GemstoneType, canInput: boolean) => boolean,
    setCanInput: (value: boolean) => void,
    onRoundComplete: () => void,
    onVariationIntro: () => void
  ) => {
    if (!canInput) return;
    
    // Debounce rapid clicks (prevent clicks within 150ms of each other)
    const now = Date.now();
    if (now - lastClickTime < 150) {
      console.log('   Click too fast, ignoring');
      return;
    }
    setLastClickTime(now);
    
    // Prevent clicks if we've already completed the pattern
    if (game.getPlayerInput().length >= game.getPattern().length) {
      console.log('   Pattern already complete, ignoring click');
      return;
    }
    
    // Helper to get color name
    const getColorName = (gem: GemstoneType) => {
      const color = GEMSTONES[gem].color;
      switch(color) {
        case '#0CF574': return 'green';    // Emerald
        case '#DB5461': return 'red';      // Trillion
        case '#6461A0': return 'purple';   // Marquise
        case '#1CCAD8': return 'cyan';     // Cushion
        default: return color;
      }
    };
    
    // Debug: Log the clicked gem with color
    const color = GEMSTONES[gemType].color;
    const colorName = getColorName(gemType);
    const playerInputBefore = game.getPlayerInput().length;
    const clickCount = playerInputBefore + 1;
    
    // Get expected gem, accounting for variations
    const pattern = game.getPattern();
    const variation = game.getCurrentVariation();
    let expectedGem: GemstoneType | undefined;
    
    if (pattern.length > 0 && clickCount <= pattern.length) {
      if (variation === GameVariation.REVERSE || variation === GameVariation.REVERSE_COMBINATION) {
        // In reverse mode, expect pattern from the end
        expectedGem = pattern[pattern.length - clickCount];
      } else {
        // Normal mode
        expectedGem = pattern[clickCount - 1];
      }
    }
    
    console.log(`   Player clicked #${clickCount}: %c█`, `color: ${color}; font-size: 20px;`, `(${colorName})`);
    
    // Log current game state before handling input
    const gameStateBefore = game.getState();
    const success = handleGemClickBase(gemType, canInput);
    const playerInputAfter = game.getPlayerInput().length;
    const gameStateAfter = game.getState();
    
    // Check if game state changed unexpectedly
    if (gameStateBefore !== GameState.PLAYER_INPUT) {
      if (gameStateBefore === GameState.ROUND_FAILED) {
        console.log(`   Too late! Timer expired - round already failed`);
      } else if (gameStateBefore === GameState.ROUND_COMPLETE) {
        console.log(`   Pattern already complete`);
      } else {
        console.warn(`   WARNING: Game not in PLAYER_INPUT state! State was: ${gameStateBefore}`);
      }
    }
    if (gameStateAfter !== gameStateBefore && 
        gameStateAfter !== GameState.ROUND_COMPLETE && 
        gameStateAfter !== GameState.ROUND_FAILED) {
      console.warn(`   WARNING: Unexpected state change from ${gameStateBefore} to ${gameStateAfter}`);
    }
    
    // Debug: Check if input array grew as expected
    if (success && playerInputAfter !== playerInputBefore + 1) {
      console.warn(`   WARNING: Player input grew from ${playerInputBefore} to ${playerInputAfter} (expected ${playerInputBefore + 1})`);
    } else if (!success && playerInputAfter !== playerInputBefore) {
      console.warn(`   WARNING: Failed input but array still grew from ${playerInputBefore} to ${playerInputAfter}`);
    }
    
    if (!success && gameStateBefore === GameState.PLAYER_INPUT) {
      setCanInput(false);
      if (expectedGem) {
        const expectedColor = getColorName(expectedGem);
        console.log(`   Wrong gem! Expected: ${expectedColor}, Got: ${colorName}`);
      } else {
        console.log(`   Wrong gem!`);
      }
    }
    
    if (game.getState() === GameState.ROUND_COMPLETE) {
      console.log('   Round complete!');
      setCanInput(false);
      setTimeout(() => {
        onRoundComplete();
      }, 1500);
    } else if (game.getState() === GameState.VARIATION_INTRO) {
      // If we get a variation intro during input handling, handle it
      setTimeout(() => {
        onVariationIntro();
      }, 3000);
    }
  }, [lastClickTime]);

  return {
    lastClickTime,
    handleGemClick
  };
};