import { useState, useCallback } from 'react';
import { GemstoneType, GameVariation } from '@/core/game/types';
import { VariationManager } from '@/core/variations/VariationManager';

interface VariationEffects {
  ghostIndices: number[];
  shiningIndices: number[];
  colorMap: Map<GemstoneType, GemstoneType> | null;
  chaosTimings: number[] | null;
}

interface UseVariationEffectsResult extends VariationEffects {
  applyVariationEffects: (
    variation: GameVariation | null,
    pattern: GemstoneType[],
    round: number,
    variationManager: VariationManager
  ) => void;
  resetEffects: () => void;
  setColorMap: (map: Map<GemstoneType, GemstoneType> | null) => void;
}

export const useVariationEffects = (): UseVariationEffectsResult => {
  const [ghostIndices, setGhostIndices] = useState<number[]>([]);
  const [shiningIndices, setShiningIndices] = useState<number[]>([]);
  const [colorMap, setColorMap] = useState<Map<GemstoneType, GemstoneType> | null>(null);
  const [chaosTimings, setChaosTimings] = useState<number[] | null>(null);

  const resetEffects = useCallback(() => {
    setGhostIndices([]);
    setShiningIndices([]);
    setColorMap(null);
    setChaosTimings(null);
  }, []);

  const applyVariationEffects = useCallback((
    variation: GameVariation | null,
    pattern: GemstoneType[],
    round: number,
    variationManager: VariationManager
  ) => {
    resetEffects();

    if (!variation || variation === GameVariation.NONE) return;

    // Apply variation-specific effects
    if (variation === GameVariation.GHOST || 
        (variation === GameVariation.REVERSE_COMBINATION && 
         variationManager.getCombinationBase() === GameVariation.GHOST)) {
      const ghostInfo = variationManager.getGhostIndices(pattern, round);
      setGhostIndices(ghostInfo.indices);
    }
    
    if (variation === GameVariation.SPEED_CHAOS || 
        (variation === GameVariation.REVERSE_COMBINATION && 
         variationManager.getCombinationBase() === GameVariation.SPEED_CHAOS)) {
      const timings = variationManager.getChaosTimings(pattern, round);
      setChaosTimings(timings);
    }
    
    if (variation === GameVariation.SELECTIVE_ATTENTION || 
        (variation === GameVariation.REVERSE_COMBINATION && 
         variationManager.getCombinationBase() === GameVariation.SELECTIVE_ATTENTION)) {
      const shining = variationManager.getShiningIndices(pattern, round);
      setShiningIndices(shining);
    }

    // Note: Color Shuffle is applied after pattern display, not here
  }, [resetEffects]);

  return {
    ghostIndices,
    shiningIndices,
    colorMap,
    chaosTimings,
    applyVariationEffects,
    resetEffects,
    setColorMap
  };
};