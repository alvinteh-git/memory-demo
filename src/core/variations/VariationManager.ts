import { GameVariation, GemstoneType } from '../game/types';

export class VariationManager {
  private currentVariation: GameVariation | null = null;
  private previousVariation: GameVariation | null = null;
  private combinationBase: GameVariation | null = null;
  private tutorialsShown: Set<GameVariation> = new Set();
  private variationStartRound: number = 0;

  /**
   * Get available variations for a given round
   */
  getAvailableVariations(round: number): GameVariation[] {
    if (round === 1) return [];
    if (round <= 4) return [GameVariation.GHOST];
    if (round <= 7) return [GameVariation.GHOST, GameVariation.SELECTIVE_ATTENTION];
    if (round <= 10) return [GameVariation.GHOST, GameVariation.SELECTIVE_ATTENTION, GameVariation.SPEED_CHAOS];
    if (round <= 13) return [GameVariation.GHOST, GameVariation.SELECTIVE_ATTENTION, GameVariation.SPEED_CHAOS, GameVariation.COLOR_SHUFFLE];
    if (round <= 16) return [GameVariation.GHOST, GameVariation.SELECTIVE_ATTENTION, GameVariation.SPEED_CHAOS, GameVariation.COLOR_SHUFFLE, GameVariation.REVERSE];
    // Round 17+: Combination mode
    return [GameVariation.REVERSE_COMBINATION];
  }

  /**
   * Select a variation for the given round
   * Variations persist for 3 rounds
   */
  selectVariation(round: number): GameVariation | null {
    const available = this.getAvailableVariations(round);
    if (available.length === 0) return null;

    // Check if we need to select a new variation (every 3 rounds starting from round 2)
    const shouldSelectNew = round === 2 || (round > 2 && (round - 2) % 3 === 0);
    
    if (shouldSelectNew || this.currentVariation === null) {
      this.variationStartRound = round;
      
      if (round >= 17) {
        // Combination mode: pick random variation 2-5 to combine with Reverse
        const baseVariations = [
          GameVariation.GHOST,
          GameVariation.SPEED_CHAOS,
          GameVariation.COLOR_SHUFFLE,
          GameVariation.SELECTIVE_ATTENTION
        ];
        
        // Filter out the previous combination base if applicable
        const filtered = this.combinationBase 
          ? baseVariations.filter(v => v !== this.combinationBase)
          : baseVariations;
        
        this.combinationBase = filtered[Math.floor(Math.random() * filtered.length)];
        this.currentVariation = GameVariation.REVERSE_COMBINATION;
      } else {
        // Regular mode: pick from available pool, avoiding previous
        const filtered = this.previousVariation 
          ? available.filter(v => v !== this.previousVariation)
          : available;
        
        // If all variations were filtered out (shouldn't happen), use all available
        const pool = filtered.length > 0 ? filtered : available;
        this.currentVariation = pool[Math.floor(Math.random() * pool.length)];
      }
      
      this.previousVariation = this.currentVariation;
    }
    
    return this.currentVariation;
  }

  /**
   * Get the base variation for combination mode
   */
  getCombinationBase(): GameVariation | null {
    return this.combinationBase;
  }

  /**
   * Get expected input pattern based on variation
   */
  getExpectedInput(pattern: GemstoneType[], variation: GameVariation): GemstoneType[] {
    if (variation === GameVariation.REVERSE || variation === GameVariation.REVERSE_COMBINATION) {
      return [...pattern].reverse();
    }
    return pattern;
  }

  /**
   * Validate input against pattern with variation rules
   */
  validateInput(input: GemstoneType[], pattern: GemstoneType[], variation: GameVariation): boolean {
    const expected = this.getExpectedInput(pattern, variation);
    
    if (input.length !== expected.length) return false;
    
    return input.every((gem, index) => gem === expected[index]);
  }

  /**
   * Get indices of gems that should be "ghost" (low opacity)
   */
  getGhostIndices(pattern: GemstoneType[], round: number): { indices: number[] } {
    // One random gem becomes a ghost
    const ghostIndex = Math.floor(Math.random() * pattern.length);
    return { indices: [ghostIndex] };
  }

  /**
   * Get ghost opacity based on round
   */
  getGhostOpacity(round: number): number {
    if (round >= 17) return 0.2; // Combination mode
    if (round === 4) return 0.3;
    if (round === 3) return 0.35;
    return 0.4; // Round 2
  }

  /**
   * Get random timings for Speed Chaos variation
   */
  getChaosTimings(pattern: GemstoneType[], round: number): number[] {
    let minTime: number, maxTime: number;
    
    if (round >= 17) {
      minTime = 150;
      maxTime = 1200;
    } else if (round === 10) {
      minTime = 200;
      maxTime = 1000;
    } else if (round === 9) {
      minTime = 250;
      maxTime = 950;
    } else {
      minTime = 300;
      maxTime = 900;
    }
    
    return pattern.map(() => 
      Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime
    );
  }

  /**
   * Get shuffled color mapping for Color Shuffle variation
   */
  getShuffledColors(): Map<GemstoneType, GemstoneType> {
    const gems = [
      GemstoneType.EMERALD,
      GemstoneType.TRILLION,
      GemstoneType.CUSHION,
      GemstoneType.MARQUISE
    ];
    
    // Create a shuffled copy
    const shuffled = [...gems];
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Create mapping
    const colorMap = new Map<GemstoneType, GemstoneType>();
    gems.forEach((gem, index) => {
      colorMap.set(gem, shuffled[index]);
    });
    
    return colorMap;
  }

  /**
   * Get indices of "shining" gems for Selective Attention variation
   */
  getShiningIndices(pattern: GemstoneType[], round: number): number[] {
    let percentage: number;
    
    if (round >= 17) {
      percentage = 0.3; // Combination mode: 30%
    } else if (round === 7) {
      percentage = 0.4;
    } else if (round === 6) {
      percentage = 0.5;
    } else {
      percentage = 0.6; // Round 5
    }
    
    const count = Math.max(1, Math.round(pattern.length * percentage));
    
    // Create array of all indices
    const allIndices = pattern.map((_, i) => i);
    
    // Shuffle and take first 'count' indices
    for (let i = allIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
    }
    
    return allIndices.slice(0, count).sort((a, b) => a - b);
  }

  /**
   * Filter pattern to only include shining gems
   */
  filterShiningGems(pattern: GemstoneType[], shiningIndices: number[]): GemstoneType[] {
    return shiningIndices.map(index => pattern[index]);
  }

  /**
   * Get difficulty level for a variation
   */
  getVariationDifficulty(variation: GameVariation, round: number): number {
    // Difficulty level 1-3 based on round within variation cycle
    // Rounds 2-4: REVERSE (difficulty 1, 2, 3)
    // Rounds 5-7: GHOST or REVERSE (difficulty 1, 2, 3)
    // etc.
    
    // Calculate which 3-round block we're in (starting from round 2)
    if (round === 1) return 1;
    
    // Find position within current 3-round block
    const blockPosition = ((round - 2) % 3) + 1; // Will be 1, 2, or 3
    return Math.min(3, blockPosition);
  }

  /**
   * Check if tutorial has been shown for a variation
   */
  hasShownTutorial(variation: GameVariation): boolean {
    return this.tutorialsShown.has(variation);
  }

  /**
   * Mark tutorial as shown for a variation
   */
  markTutorialShown(variation: GameVariation): void {
    this.tutorialsShown.add(variation);
  }

  /**
   * Reset the manager state
   */
  reset(): void {
    this.currentVariation = null;
    this.previousVariation = null;
    this.combinationBase = null;
    this.tutorialsShown.clear();
    this.variationStartRound = 0;
  }
}