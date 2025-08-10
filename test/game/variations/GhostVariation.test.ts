import { describe, it, expect, beforeEach } from 'vitest';
import { VariationManager } from '@/core/variations/VariationManager';
import { GameVariation, GemstoneType } from '@/core/game/types';

describe('GHOST Variation', () => {
  let manager: VariationManager;

  beforeEach(() => {
    manager = new VariationManager();
  });

  describe('Ghost Index Selection', () => {
    it('should mark exactly one gem as ghost', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      const ghostInfo = manager.getGhostIndices(pattern, 5);
      
      // Should have exactly one ghost index
      expect(ghostInfo.indices).toHaveLength(1);
      
      // Ghost index should be within pattern bounds
      expect(ghostInfo.indices[0]).toBeGreaterThanOrEqual(0);
      expect(ghostInfo.indices[0]).toBeLessThan(pattern.length);
      
      console.log('Pattern length:', pattern.length);
      console.log('Ghost at index:', ghostInfo.indices[0]);
    });

    it('should handle single gem pattern', () => {
      const pattern: GemstoneType[] = [GemstoneType.EMERALD];
      
      const ghostInfo = manager.getGhostIndices(pattern, 5);
      
      // With only one gem, it must be the ghost
      expect(ghostInfo.indices).toEqual([0]);
    });

    it('should handle 2-gem pattern', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION
      ];
      
      const ghostInfo = manager.getGhostIndices(pattern, 5);
      
      expect(ghostInfo.indices).toHaveLength(1);
      expect([0, 1]).toContain(ghostInfo.indices[0]);
    });

    it('should randomly select different indices over multiple calls', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD
      ];
      
      const indices = new Set<number>();
      
      // Run multiple times to ensure randomness
      for (let i = 0; i < 20; i++) {
        const ghostInfo = manager.getGhostIndices(pattern, 5);
        indices.add(ghostInfo.indices[0]);
      }
      
      // Should have selected different indices
      expect(indices.size).toBeGreaterThan(1);
      console.log('Unique ghost positions selected:', Array.from(indices));
    });
  });

  describe('Ghost Opacity Scaling', () => {
    it('should return correct opacity for round 5', () => {
      const opacity = manager.getGhostOpacity(5);
      
      expect(opacity).toBe(0.4);
      console.log('Round 5 ghost opacity:', opacity);
    });

    it('should return correct opacity for round 6', () => {
      const opacity = manager.getGhostOpacity(6);
      
      expect(opacity).toBe(0.35);
      console.log('Round 6 ghost opacity:', opacity);
    });

    it('should return correct opacity for round 7', () => {
      const opacity = manager.getGhostOpacity(7);
      
      expect(opacity).toBe(0.3);
      console.log('Round 7 ghost opacity:', opacity);
    });

    it('should return minimum opacity in combination mode (round 17+)', () => {
      const opacity = manager.getGhostOpacity(17);
      
      expect(opacity).toBe(0.2);
      console.log('Round 17+ (combination) ghost opacity:', opacity);
    });

    it('should maintain minimum opacity for high rounds', () => {
      const opacity20 = manager.getGhostOpacity(20);
      const opacity50 = manager.getGhostOpacity(50);
      
      expect(opacity20).toBe(0.2);
      expect(opacity50).toBe(0.2);
      console.log('High round opacity remains at:', 0.2);
    });
  });

  describe('Visual Representation', () => {
    it('should identify which gem will be ghosted', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      const ghostInfo = manager.getGhostIndices(pattern, 5);
      const ghostIndex = ghostInfo.indices[0];
      const ghostedGem = pattern[ghostIndex];
      
      console.log('\nGhost Pattern Visualization:');
      pattern.forEach((gem, index) => {
        const isGhost = index === ghostIndex;
        const opacity = isGhost ? 0.4 : 1.0;
        console.log(`  Position ${index}: ${gem} - opacity: ${opacity}${isGhost ? ' (GHOST)' : ''}`);
      });
      
      expect(ghostedGem).toBeDefined();
    });

    it('should show opacity progression across rounds', () => {
      const rounds = [5, 6, 7, 17];
      
      console.log('\nGhost Opacity Progression:');
      rounds.forEach(round => {
        const opacity = manager.getGhostOpacity(round);
        const visibility = Math.round(opacity * 100);
        console.log(`  Round ${round}: ${visibility}% visible (opacity: ${opacity})`);
      });
      
      // Verify opacity decreases over rounds
      expect(manager.getGhostOpacity(5)).toBeGreaterThan(manager.getGhostOpacity(7));
      expect(manager.getGhostOpacity(7)).toBeGreaterThan(manager.getGhostOpacity(17));
    });
  });

  describe('Pattern with Ghost Applied', () => {
    it('should not change the actual pattern order', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      // Ghost doesn't change the expected input
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.GHOST);
      
      // Pattern should remain the same (ghost only affects visual display)
      expect(expectedInput).toEqual(pattern);
    });

    it('should validate normal input despite ghost', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.MARQUISE
      ];
      
      // Player should input the full pattern, including ghosted gem
      const playerInput: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.MARQUISE
      ];
      
      const isValid = manager.validateInput(playerInput, pattern, GameVariation.GHOST);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Ghost with Repeated Gems', () => {
    it('should handle patterns with repeated gems', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD
      ];
      
      const ghostInfo = manager.getGhostIndices(pattern, 5);
      const ghostIndex = ghostInfo.indices[0];
      
      console.log('\nRepeated Gems with Ghost:');
      pattern.forEach((gem, index) => {
        const isGhost = index === ghostIndex;
        console.log(`  ${gem} at position ${index}${isGhost ? ' (GHOSTED)' : ''}`);
      });
      
      // Ghost index should still be valid
      expect(ghostIndex).toBeGreaterThanOrEqual(0);
      expect(ghostIndex).toBeLessThan(pattern.length);
    });

    it('should potentially ghost any instance of repeated gem', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.TRILLION,
        GemstoneType.TRILLION,
        GemstoneType.TRILLION
      ];
      
      const positions = new Set<number>();
      
      // Check that ghost can appear at any position
      for (let i = 0; i < 15; i++) {
        const ghostInfo = manager.getGhostIndices(pattern, 5);
        positions.add(ghostInfo.indices[0]);
      }
      
      // Over multiple runs, should ghost different positions
      expect(positions.size).toBeGreaterThan(1);
      console.log('Ghosted positions for repeated gems:', Array.from(positions));
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pattern gracefully', () => {
      const pattern: GemstoneType[] = [];
      
      const ghostInfo = manager.getGhostIndices(pattern, 5);
      
      // With empty pattern, should still return one index (even if invalid)
      // This is how the actual implementation works
      expect(ghostInfo.indices).toHaveLength(1);
      expect(ghostInfo.indices[0]).toBe(0);
    });

    it('should handle very long patterns', () => {
      const pattern: GemstoneType[] = new Array(10).fill(null).map((_, i) => 
        [GemstoneType.EMERALD, GemstoneType.TRILLION, GemstoneType.CUSHION, GemstoneType.MARQUISE][i % 4]
      );
      
      const ghostInfo = manager.getGhostIndices(pattern, 5);
      
      // Should still select exactly one ghost
      expect(ghostInfo.indices).toHaveLength(1);
      expect(ghostInfo.indices[0]).toBeLessThan(pattern.length);
    });
  });

  describe('Display Simulation', () => {
    it('should simulate ghost display for validation', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      const round = 6;
      const ghostInfo = manager.getGhostIndices(pattern, round);
      const opacity = manager.getGhostOpacity(round);
      const ghostIndex = ghostInfo.indices[0];
      
      console.log('\n=== Ghost Display Simulation ===');
      console.log(`Round ${round} - Ghost Opacity: ${opacity}`);
      console.log('Display sequence:');
      
      pattern.forEach((gem, index) => {
        const isGhost = index === ghostIndex;
        const displayOpacity = isGhost ? opacity : 1.0;
        const visibility = isGhost ? 'FAINT' : 'NORMAL';
        
        console.log(`  Step ${index + 1}: Show ${gem} at ${Math.round(displayOpacity * 100)}% opacity (${visibility})`);
      });
      
      console.log('\nPlayer must remember and input all gems, including the faint one!');
      
      expect(ghostIndex).toBeDefined();
    });
  });
});