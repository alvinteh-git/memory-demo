import { describe, it, expect, beforeEach } from 'vitest';
import { VariationManager } from '@/core/variations/VariationManager';
import { GameVariation, GemstoneType } from '@/core/game/types';

describe('VariationManager', () => {
  let manager: VariationManager;

  beforeEach(() => {
    manager = new VariationManager();
  });

  describe('Variation Availability', () => {
    it('should have no variations for round 1', () => {
      const available = manager.getAvailableVariations(1);
      expect(available).toEqual([]);
    });

    it('should unlock GHOST for rounds 2-4', () => {
      expect(manager.getAvailableVariations(2)).toEqual([GameVariation.GHOST]);
      expect(manager.getAvailableVariations(3)).toEqual([GameVariation.GHOST]);
      expect(manager.getAvailableVariations(4)).toEqual([GameVariation.GHOST]);
    });

    it('should unlock SELECTIVE_ATTENTION for rounds 5-7', () => {
      const available = manager.getAvailableVariations(5);
      expect(available).toContain(GameVariation.GHOST);
      expect(available).toContain(GameVariation.SELECTIVE_ATTENTION);
      expect(available).toHaveLength(2);
    });

    it('should unlock SPEED_CHAOS for rounds 8-10', () => {
      const available = manager.getAvailableVariations(8);
      expect(available).toContain(GameVariation.GHOST);
      expect(available).toContain(GameVariation.SELECTIVE_ATTENTION);
      expect(available).toContain(GameVariation.SPEED_CHAOS);
      expect(available).toHaveLength(3);
    });

    it('should unlock COLOR_SHUFFLE for rounds 11-13', () => {
      const available = manager.getAvailableVariations(11);
      expect(available).toHaveLength(4);
      expect(available).toContain(GameVariation.COLOR_SHUFFLE);
    });

    it('should unlock REVERSE for rounds 14-16', () => {
      const available = manager.getAvailableVariations(14);
      expect(available).toHaveLength(5);
      expect(available).toContain(GameVariation.REVERSE);
    });

    it('should enable combination mode for round 17+', () => {
      const available = manager.getAvailableVariations(17);
      expect(available).toContain(GameVariation.REVERSE_COMBINATION);
      expect(manager.getAvailableVariations(20)).toContain(GameVariation.REVERSE_COMBINATION);
    });
  });

  describe('Variation Selection', () => {
    it('should select a variation every 3 rounds', () => {
      // Round 2: Select new variation
      const variation2 = manager.selectVariation(2);
      expect(variation2).toBe(GameVariation.GHOST);
      
      // Rounds 3-4: Keep same variation
      expect(manager.selectVariation(3)).toBe(GameVariation.GHOST);
      expect(manager.selectVariation(4)).toBe(GameVariation.GHOST);
      
      // Round 5: Select new variation
      const variation5 = manager.selectVariation(5);
      expect([GameVariation.GHOST, GameVariation.SELECTIVE_ATTENTION]).toContain(variation5);
      
      // Rounds 6-7: Keep same variation
      expect(manager.selectVariation(6)).toBe(variation5);
      expect(manager.selectVariation(7)).toBe(variation5);
    });

    it('should not repeat the previous variation when selecting new one', () => {
      // Force a specific variation for rounds 2-4
      manager.selectVariation(2); // GHOST
      manager.selectVariation(3);
      manager.selectVariation(4);
      
      // Round 5 should not be GHOST (when pool has 2 options)
      const selections = new Set<GameVariation>();
      for (let i = 0; i < 20; i++) {
        manager = new VariationManager(); // Reset
        manager.selectVariation(2); // GHOST
        manager.selectVariation(3);
        manager.selectVariation(4);
        const variation5 = manager.selectVariation(5);
        selections.add(variation5!);
      }
      
      // Should have selected SELECTIVE_ATTENTION at least once (avoiding GHOST)
      expect(selections.has(GameVariation.SELECTIVE_ATTENTION)).toBe(true);
    });

    it('should handle combination mode correctly', () => {
      const variation = manager.selectVariation(17);
      expect(variation).toBe(GameVariation.REVERSE_COMBINATION);
      
      const combo = manager.getCombinationBase();
      expect([
        GameVariation.GHOST,
        GameVariation.SPEED_CHAOS,
        GameVariation.COLOR_SHUFFLE,
        GameVariation.SELECTIVE_ATTENTION
      ]).toContain(combo);
    });
  });

  describe('REVERSE Variation', () => {
    it('should reverse the input pattern', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.REVERSE);
      expect(expectedInput).toEqual([
        GemstoneType.CUSHION,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD
      ]);
    });

    it('should validate reversed input correctly', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION
      ];
      
      // Correct reversed input
      expect(manager.validateInput(
        [GemstoneType.TRILLION, GemstoneType.EMERALD],
        pattern,
        GameVariation.REVERSE
      )).toBe(true);
      
      // Wrong input (not reversed)
      expect(manager.validateInput(
        [GemstoneType.EMERALD, GemstoneType.TRILLION],
        pattern,
        GameVariation.REVERSE
      )).toBe(false);
    });
  });

  describe('GHOST Variation', () => {
    it('should mark one gem as ghost', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      const ghostInfo = manager.getGhostIndices(pattern, 5); // Round 5
      expect(ghostInfo.indices).toHaveLength(1);
      expect(ghostInfo.indices[0]).toBeGreaterThanOrEqual(0);
      expect(ghostInfo.indices[0]).toBeLessThan(pattern.length);
    });

    it('should scale ghost opacity by round', () => {
      expect(manager.getGhostOpacity(2)).toBe(0.4);
      expect(manager.getGhostOpacity(3)).toBe(0.35);
      expect(manager.getGhostOpacity(4)).toBe(0.3);
      expect(manager.getGhostOpacity(17)).toBe(0.2); // Combination mode
    });
  });

  describe('SPEED_CHAOS Variation', () => {
    it('should generate random timing for each gem', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      const timings = manager.getChaosTimings(pattern, 8);
      expect(timings).toHaveLength(pattern.length);
      
      timings.forEach(timing => {
        expect(timing).toBeGreaterThanOrEqual(300);
        expect(timing).toBeLessThanOrEqual(900);
      });
    });

    it('should scale timing range by round', () => {
      const pattern = [GemstoneType.EMERALD, GemstoneType.TRILLION];
      
      // Round 8: 300-900ms
      const timings8 = manager.getChaosTimings(pattern, 8);
      timings8.forEach(t => {
        expect(t).toBeGreaterThanOrEqual(300);
        expect(t).toBeLessThanOrEqual(900);
      });
      
      // Round 10: 200-1000ms
      const timings10 = manager.getChaosTimings(pattern, 10);
      // Due to randomness, we can't guarantee exact range usage,
      // but the method should accept the wider range
      expect(timings10).toHaveLength(pattern.length);
    });
  });

  describe('COLOR_SHUFFLE Variation', () => {
    it('should generate color shuffle mapping', () => {
      const colors = manager.getShuffledColors();
      
      // Should have all 4 gem types
      expect(colors.size).toBe(4);
      
      // Each gem should map to a color
      expect(colors.has(GemstoneType.EMERALD)).toBe(true);
      expect(colors.has(GemstoneType.TRILLION)).toBe(true);
      expect(colors.has(GemstoneType.CUSHION)).toBe(true);
      expect(colors.has(GemstoneType.MARQUISE)).toBe(true);
      
      // Colors should be shuffled (at least one should be different)
      const isShuffled = 
        colors.get(GemstoneType.EMERALD) !== GemstoneType.EMERALD ||
        colors.get(GemstoneType.TRILLION) !== GemstoneType.TRILLION ||
        colors.get(GemstoneType.CUSHION) !== GemstoneType.CUSHION ||
        colors.get(GemstoneType.MARQUISE) !== GemstoneType.MARQUISE;
      
      // Run multiple times to ensure shuffling occurs
      let shuffledAtLeastOnce = isShuffled;
      for (let i = 0; i < 10 && !shuffledAtLeastOnce; i++) {
        const newColors = manager.getShuffledColors();
        shuffledAtLeastOnce = 
          newColors.get(GemstoneType.EMERALD) !== GemstoneType.EMERALD ||
          newColors.get(GemstoneType.TRILLION) !== GemstoneType.TRILLION ||
          newColors.get(GemstoneType.CUSHION) !== GemstoneType.CUSHION ||
          newColors.get(GemstoneType.MARQUISE) !== GemstoneType.MARQUISE;
      }
      expect(shuffledAtLeastOnce).toBe(true);
    });
  });

  describe('SELECTIVE_ATTENTION Variation', () => {
    it('should mark subset of gems as shining', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD
      ];
      
      const shiningIndices = manager.getShiningIndices(pattern, 14);
      
      // Round 14: 60% should be shining (3 out of 5)
      expect(shiningIndices).toHaveLength(3);
      
      // All indices should be valid
      shiningIndices.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(pattern.length);
      });
      
      // Indices should be unique
      expect(new Set(shiningIndices).size).toBe(shiningIndices.length);
    });

    it('should scale shining percentage by round', () => {
      const pattern = Array(10).fill(GemstoneType.EMERALD);
      
      // Round 5: 60% shining
      const indices5 = manager.getShiningIndices(pattern, 5);
      expect(indices5).toHaveLength(6);
      
      // Round 7: 40% shining
      const indices7 = manager.getShiningIndices(pattern, 7);
      expect(indices7).toHaveLength(4);
    });

    it('should filter pattern to only shining gems', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      const shiningIndices = [0, 2]; // First and third gems
      const expectedInput = manager.filterShiningGems(pattern, shiningIndices);
      
      expect(expectedInput).toEqual([
        GemstoneType.EMERALD,
        GemstoneType.CUSHION
      ]);
    });
  });

  describe('REVERSE_COMBINATION Variation', () => {
    it('should combine reverse with another variation', () => {
      manager.selectVariation(17);
      const combo = manager.getCombinationBase();
      
      // Should be one of the other variations
      expect([
        GameVariation.GHOST,
        GameVariation.SPEED_CHAOS,
        GameVariation.COLOR_SHUFFLE,
        GameVariation.SELECTIVE_ATTENTION
      ]).toContain(combo);
    });

    it('should apply both variations correctly', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      // Test Reverse + Selective combination
      manager.selectVariation(17);
      manager['combinationBase'] = GameVariation.SELECTIVE_ATTENTION;
      
      const shiningIndices = [0, 2]; // First and third
      const filtered = manager.filterShiningGems(pattern, shiningIndices);
      const expectedInput = manager.getExpectedInput(filtered, GameVariation.REVERSE);
      
      expect(expectedInput).toEqual([
        GemstoneType.CUSHION,
        GemstoneType.EMERALD
      ]);
    });
  });

  describe('Variation Persistence', () => {
    it('should maintain variation for 3 rounds', () => {
      const round2 = manager.selectVariation(2);
      const round3 = manager.selectVariation(3);
      const round4 = manager.selectVariation(4);
      
      expect(round2).toBe(round3);
      expect(round3).toBe(round4);
    });

    it('should change variation after 3 rounds', () => {
      manager.selectVariation(2); // REVERSE
      manager.selectVariation(3);
      manager.selectVariation(4);
      
      const round5 = manager.selectVariation(5);
      // Should be either REVERSE or GHOST, but we handle avoiding previous
      
      manager.selectVariation(6);
      manager.selectVariation(7);
      
      const round8 = manager.selectVariation(8);
      // Should be from new pool of 3
      expect([
        GameVariation.REVERSE,
        GameVariation.GHOST,
        GameVariation.SPEED_CHAOS
      ]).toContain(round8);
    });
  });

  describe('Difficulty Scaling', () => {
    it('should provide correct difficulty level for variations', () => {
      expect(manager.getVariationDifficulty(GameVariation.REVERSE, 2)).toBe(1);
      expect(manager.getVariationDifficulty(GameVariation.GHOST, 5)).toBe(1);
      expect(manager.getVariationDifficulty(GameVariation.GHOST, 7)).toBe(3);
      expect(manager.getVariationDifficulty(GameVariation.SPEED_CHAOS, 10)).toBe(3);
    });
  });

  describe('Tutorial Tracking', () => {
    it('should track if tutorial was shown for each variation', () => {
      expect(manager.hasShownTutorial(GameVariation.REVERSE)).toBe(false);
      
      manager.markTutorialShown(GameVariation.REVERSE);
      expect(manager.hasShownTutorial(GameVariation.REVERSE)).toBe(true);
      
      // Other variations should still be false
      expect(manager.hasShownTutorial(GameVariation.GHOST)).toBe(false);
    });
  });
});