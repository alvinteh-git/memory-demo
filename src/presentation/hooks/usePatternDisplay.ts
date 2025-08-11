import { useState, useCallback } from 'react';
import { GemstoneType, GameVariation } from '@/core/game/types';
import { GEMSTONES } from '@/core/game/constants';
import { GameEngine } from '@/core/game/GameEngine';
import { VariationManager } from '@/core/variations/VariationManager';

interface UsePatternDisplayResult {
  displayIndex: number;
  canInput: boolean;
  displayPattern: (
    game: GameEngine,
    round: number,
    applyVariationEffects: (
      variation: GameVariation | null,
      pattern: GemstoneType[],
      round: number,
      variationManager: VariationManager
    ) => void,
    setColorMap: (map: Map<GemstoneType, GemstoneType> | null) => void,
    chaosTimings: number[] | null,
    onPatternComplete: () => void,
    playGemSound?: (gemType: GemstoneType) => void
  ) => void;
  resetDisplay: () => void;
}

export const usePatternDisplay = (): UsePatternDisplayResult => {
  const [displayIndex, setDisplayIndex] = useState(-1);
  const [canInput, setCanInput] = useState(false);

  const resetDisplay = useCallback(() => {
    setDisplayIndex(-1);
    setCanInput(false);
  }, []);

  const displayPattern = useCallback((
    game: GameEngine,
    round: number,
    applyVariationEffects: (
      variation: GameVariation | null,
      pattern: GemstoneType[],
      round: number,
      variationManager: VariationManager
    ) => void,
    setColorMap: (map: Map<GemstoneType, GemstoneType> | null) => void,
    chaosTimings: number[] | null,
    onPatternComplete: () => void,
    playGemSound?: (gemType: GemstoneType) => void
  ) => {
    const patternToShow = game.getPattern();
    const speed = game.getDisplaySpeed();
    const variation = game.getCurrentVariation();
    const variationManager = game.getVariationManager();
    
    // Helper to get color name from hex
    const getColorName = (gemType: GemstoneType) => {
      const color = GEMSTONES[gemType].color;
      // Map hex colors to names based on actual game colors
      switch(color) {
        case '#0CF574': return 'green';    // Emerald
        case '#DB5461': return 'red';      // Trillion
        case '#6461A0': return 'purple';   // Marquise
        case '#1CCAD8': return 'cyan';     // Cushion
        default: return color;
      }
    };
    
    // Debug: Log the solution pattern with colored blocks and names
    const colorNames = patternToShow.map(gemType => getColorName(gemType)).join(' ');
    
    // Build the console log arguments properly
    const logArgs: any[] = ['Round ' + game.getRound() + ' Pattern:'];
    patternToShow.forEach(gemType => {
      logArgs.push('%c█');
      logArgs.push(`color: ${GEMSTONES[gemType].color}; font-size: 20px;`);
    });
    
    console.log(...logArgs);
    console.log('   Colors:', colorNames);
    
    // Check for repeated gems and warn
    const hasRepeats = patternToShow.some((gem, i) => i > 0 && patternToShow[i - 1] === gem);
    if (hasRepeats) {
      console.log('   Note: Pattern contains repeated consecutive gems');
    }
    
    if (variation && variation !== GameVariation.NONE) {
      console.log('   Variation:', variation);
      if (variation === GameVariation.REVERSE || variation === GameVariation.REVERSE_COMBINATION) {
        const reversePattern = [...patternToShow].reverse();
        const reverseNames = reversePattern.map(gemType => getColorName(gemType)).join(' ');
        
        // Build reverse pattern log
        const reverseLogArgs: any[] = ['   REVERSE MODE - Input order:'];
        reversePattern.forEach(gemType => {
          reverseLogArgs.push('%c█');
          reverseLogArgs.push(`color: ${GEMSTONES[gemType].color}; font-size: 20px;`);
        });
        
        console.log(...reverseLogArgs);
        console.log('   Expected colors:', reverseNames);
      }
    }
    
    // Apply variation-specific effects
    applyVariationEffects(variation, patternToShow, round, variationManager);
    
    setCanInput(false);
    setDisplayIndex(-1);
    
    // Display each gem in sequence
    if (chaosTimings) {
      // Speed Chaos: Use random timings with gaps for repeated gems
      let cumulativeTime = 0;
      patternToShow.forEach((gemType, index) => {
        // Show the gem
        setTimeout(() => {
          setDisplayIndex(index);
          // Play sound for this gem
          if (playGemSound) {
            playGemSound(gemType);
          }
        }, cumulativeTime);
        
        // Check if next gem is the same
        const nextGem = patternToShow[index + 1];
        const isRepeated = nextGem === gemType;
        
        if (isRepeated) {
          // Add a brief "off" period between repeated gems
          const gapTime = Math.min(chaosTimings[index] * 0.3, 150); // 30% of time or 150ms max
          setTimeout(() => {
            setDisplayIndex(-1); // Turn off display briefly
          }, cumulativeTime + chaosTimings[index] - gapTime);
          cumulativeTime += chaosTimings[index] + gapTime;
        } else {
          cumulativeTime += chaosTimings[index];
        }
      });
      
      // After pattern display with chaos timing
      setTimeout(() => {
        setDisplayIndex(-1);
        
        // Apply Color Shuffle if active
        if (variation === GameVariation.COLOR_SHUFFLE || 
            (variation === GameVariation.REVERSE_COMBINATION && 
             variationManager.getCombinationBase() === GameVariation.COLOR_SHUFFLE)) {
          const shuffled = variationManager.getShuffledColors();
          setColorMap(shuffled);
        }
        
        setCanInput(true);
        onPatternComplete();
      }, cumulativeTime + 500);
    } else {
      // Normal timing with gaps for repeated gems
      let timeOffset = 0;
      patternToShow.forEach((gemType, index) => {
        // Show the gem
        setTimeout(() => {
          setDisplayIndex(index);
          // Play sound for this gem
          if (playGemSound) {
            playGemSound(gemType);
          }
        }, timeOffset);
        
        // Check if next gem is the same - if so, add a brief gap
        const nextGem = patternToShow[index + 1];
        const isRepeated = nextGem === gemType;
        
        if (isRepeated) {
          // Add a brief "off" period between repeated gems
          const gapTime = speed * 0.3; // 30% of display time as gap
          setTimeout(() => {
            setDisplayIndex(-1); // Turn off display briefly
          }, timeOffset + speed - gapTime);
          timeOffset += speed + gapTime;
        } else {
          timeOffset += speed;
        }
      });
      
      // After pattern display, start player input
      setTimeout(() => {
        setDisplayIndex(-1);
        
        // Apply Color Shuffle if active
        if (variation === GameVariation.COLOR_SHUFFLE || 
            (variation === GameVariation.REVERSE_COMBINATION && 
             variationManager.getCombinationBase() === GameVariation.COLOR_SHUFFLE)) {
          const shuffled = variationManager.getShuffledColors();
          setColorMap(shuffled);
        }
        
        setCanInput(true);
        onPatternComplete();
      }, timeOffset + 500);
    }
  }, []);

  return {
    displayIndex,
    canInput,
    displayPattern,
    resetDisplay
  };
};