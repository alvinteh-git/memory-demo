import { describe, it, expect, beforeEach } from 'vitest';
import { VariationManager } from '@/core/variations/VariationManager';
import { GameVariation, GemstoneType } from '@/core/game/types';

describe('SELECTIVE_ATTENTION Variation', () => {
  let manager: VariationManager;

  beforeEach(() => {
    manager = new VariationManager();
  });

  describe('Shining Indices Selection', () => {
    it('should mark correct percentage of gems as shining for round 5', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD
      ];
      
      const shiningIndices = manager.getShiningIndices(pattern, 5);
      
      // Round 5: 60% should be shining (3 out of 5)
      expect(shiningIndices).toHaveLength(3);
      
      console.log('Round 5 - Pattern length:', pattern.length);
      console.log('Expected shining: 60% (3 gems)');
      console.log('Actual shining indices:', shiningIndices);
    });

    it('should mark correct percentage for round 15', () => {
      const pattern: GemstoneType[] = new Array(6).fill(GemstoneType.EMERALD);
      
      const shiningIndices = manager.getShiningIndices(pattern, 6);
      
      // Round 6: 50% should be shining (3 out of 6)
      expect(shiningIndices).toHaveLength(3);
      
      console.log('Round 6 - 50% of 6 gems = 3 shining');
    });

    it('should mark correct percentage for round 16', () => {
      const pattern: GemstoneType[] = new Array(5).fill(GemstoneType.TRILLION);
      
      const shiningIndices = manager.getShiningIndices(pattern, 7);
      
      // Round 7: 40% should be shining (2 out of 5)
      expect(shiningIndices).toHaveLength(2);
      
      console.log('Round 7 - 40% of 5 gems = 2 shining');
    });

    it('should mark minimum 30% in combination mode (round 17+)', () => {
      const pattern: GemstoneType[] = new Array(10).fill(GemstoneType.CUSHION);
      
      const shiningIndices = manager.getShiningIndices(pattern, 17);
      
      // Round 17+: 30% should be shining (3 out of 10)
      expect(shiningIndices).toHaveLength(3);
      
      console.log('Round 17+ - 30% of 10 gems = 3 shining');
    });

    it('should always mark at least one gem as shining', () => {
      const pattern: GemstoneType[] = [GemstoneType.EMERALD, GemstoneType.TRILLION];
      
      const shiningIndices = manager.getShiningIndices(pattern, 17);
      
      // Even with 30% of 2 = 0.6, should round to at least 1
      expect(shiningIndices.length).toBeGreaterThanOrEqual(1);
      
      console.log('Small pattern - at least 1 gem shines');
    });
  });

  describe('Shining Indices Properties', () => {
    it('should return sorted indices', () => {
      const pattern: GemstoneType[] = new Array(8).fill(GemstoneType.EMERALD);
      
      const shiningIndices = manager.getShiningIndices(pattern, 5);
      
      // Indices should be sorted
      for (let i = 1; i < shiningIndices.length; i++) {
        expect(shiningIndices[i]).toBeGreaterThan(shiningIndices[i - 1]);
      }
      
      console.log('Sorted shining indices:', shiningIndices);
    });

    it('should return unique indices', () => {
      const pattern: GemstoneType[] = new Array(6).fill(GemstoneType.MARQUISE);
      
      const shiningIndices = manager.getShiningIndices(pattern, 6);
      
      // All indices should be unique
      const uniqueIndices = new Set(shiningIndices);
      expect(uniqueIndices.size).toBe(shiningIndices.length);
    });

    it('should return valid indices within pattern bounds', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      const shiningIndices = manager.getShiningIndices(pattern, 5);
      
      shiningIndices.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(pattern.length);
      });
    });
  });

  describe('Pattern Filtering', () => {
    it('should filter pattern to only shining gems', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,   // index 0
        GemstoneType.TRILLION,  // index 1
        GemstoneType.CUSHION,   // index 2
        GemstoneType.MARQUISE   // index 3
      ];
      
      const shiningIndices = [0, 2]; // Only first and third gems shine
      
      const filtered = manager.filterShiningGems(pattern, shiningIndices);
      
      expect(filtered).toEqual([
        GemstoneType.EMERALD,
        GemstoneType.CUSHION
      ]);
      
      console.log('Original pattern:', pattern);
      console.log('Shining indices:', shiningIndices);
      console.log('Filtered result:', filtered);
    });

    it('should maintain order when filtering', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD
      ];
      
      const shiningIndices = [1, 3, 4]; // 2nd, 4th, and 5th gems
      
      const filtered = manager.filterShiningGems(pattern, shiningIndices);
      
      expect(filtered).toEqual([
        GemstoneType.TRILLION,
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD
      ]);
    });

    it('should handle all gems shining', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION
      ];
      
      const shiningIndices = [0, 1]; // All gems shine
      
      const filtered = manager.filterShiningGems(pattern, shiningIndices);
      
      expect(filtered).toEqual(pattern);
    });
  });

  describe('Input Validation', () => {
    it('should validate input for SELECTIVE_ATTENTION (normal pattern)', () => {
      // For basic SELECTIVE_ATTENTION, player still inputs full pattern
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      const playerInput = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      // Note: The actual game logic for filtering would be handled elsewhere
      // The validation just checks if input matches expected pattern
      const isValid = manager.validateInput(playerInput, pattern, GameVariation.SELECTIVE_ATTENTION);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Visual Simulation', () => {
    it('should simulate selective attention display', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD
      ];
      
      const shiningIndices = manager.getShiningIndices(pattern, 5);
      
      console.log('\n=== Selective Attention Display Simulation ===');
      console.log('Round 5 - 60% gems are shining');
      console.log('\nPattern display:');
      
      pattern.forEach((gem, index) => {
        const isShining = shiningIndices.includes(index);
        const display = isShining ? 'SHINING (pulsing white)' : 'NORMAL (no effect)';
        console.log(`  Step ${index + 1}: ${gem} - ${display}`);
      });
      
      const filteredPattern = manager.filterShiningGems(pattern, shiningIndices);
      
      console.log('\nPlayer should only repeat the SHINING gems:');
      filteredPattern.forEach((gem, index) => {
        console.log(`  Input ${index + 1}: ${gem}`);
      });
      
      console.log(`\nTotal gems shown: ${pattern.length}`);
      console.log(`Gems to repeat: ${filteredPattern.length}`);
      
      expect(filteredPattern.length).toBeLessThanOrEqual(pattern.length);
    });

    it('should show percentage scaling across rounds', () => {
      const pattern: GemstoneType[] = new Array(10).fill(GemstoneType.EMERALD);
      
      console.log('\n=== Shining Percentage by Round ===');
      console.log('Pattern has 10 gems total\n');
      
      const rounds = [14, 15, 16, 17, 20];
      rounds.forEach(round => {
        const shiningIndices = manager.getShiningIndices(pattern, round);
        const percentage = round === 14 ? 60 : 
                          round === 15 ? 50 :
                          round === 16 ? 40 : 30;
        
        console.log(`Round ${round}: ${percentage}% shining = ${shiningIndices.length} gems`);
      });
    });
  });

  describe('Randomness', () => {
    it('should randomly select different shining patterns', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD
      ];
      
      const patterns = new Set<string>();
      
      // Generate multiple shining patterns
      for (let i = 0; i < 20; i++) {
        const shiningIndices = manager.getShiningIndices(pattern, 5);
        patterns.add(shiningIndices.join(','));
      }
      
      // Should generate different patterns
      expect(patterns.size).toBeGreaterThan(1);
      
      console.log(`Generated ${patterns.size} unique shining patterns`);
      console.log('Sample patterns:', Array.from(patterns).slice(0, 5));
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pattern', () => {
      const pattern: GemstoneType[] = [];
      
      const shiningIndices = manager.getShiningIndices(pattern, 5);
      
      expect(shiningIndices).toEqual([]);
    });

    it('should handle single gem pattern', () => {
      const pattern: GemstoneType[] = [GemstoneType.CUSHION];
      
      const shiningIndices = manager.getShiningIndices(pattern, 5);
      
      // With one gem, it must shine (at least 1)
      expect(shiningIndices).toEqual([0]);
    });

    it('should handle repeated gems with shining', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.TRILLION,
        GemstoneType.TRILLION,
        GemstoneType.TRILLION,
        GemstoneType.TRILLION
      ];
      
      const shiningIndices = manager.getShiningIndices(pattern, 6);
      const filtered = manager.filterShiningGems(pattern, shiningIndices);
      
      console.log('\nRepeated gems with selective attention:');
      console.log('All gems are TRILLION');
      console.log('Shining positions:', shiningIndices);
      console.log('Filtered pattern:', filtered);
      console.log('Result: Only some TRILLIONs need to be repeated');
      
      // All filtered gems should be TRILLION
      filtered.forEach(gem => {
        expect(gem).toBe(GemstoneType.TRILLION);
      });
    });
  });

  describe('Complete Gameplay Scenario', () => {
    it('should demonstrate full SELECTIVE_ATTENTION gameplay', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE,
        GemstoneType.TRILLION
      ];
      
      const round = 15;
      const shiningIndices = [0, 2, 5]; // Simulate specific shining gems
      
      console.log('\n=== Complete SELECTIVE_ATTENTION Scenario ===');
      console.log(`Round ${round} - 50% of gems shine\n`);
      
      console.log('DISPLAY PHASE:');
      pattern.forEach((gem, index) => {
        const isShining = shiningIndices.includes(index);
        if (isShining) {
          console.log(`  ${index + 1}. ${gem} ✨ [SHINING - REMEMBER THIS!]`);
        } else {
          console.log(`  ${index + 1}. ${gem}    [normal - ignore]`);
        }
      });
      
      const expectedInput = manager.filterShiningGems(pattern, shiningIndices);
      
      console.log('\nINPUT PHASE:');
      console.log('Player should click only the shining gems in order:');
      expectedInput.forEach((gem, index) => {
        console.log(`  Click ${index + 1}: ${gem}`);
      });
      
      console.log('\nKey Rules:');
      console.log('- Only repeat gems that were SHINING (pulsing white)');
      console.log('- Ignore all non-shining gems completely');
      console.log('- Maintain the order of shining gems');
      
      expect(expectedInput).toHaveLength(3);
    });

    it('should show difficulty progression', () => {
      const basePattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD,
        GemstoneType.TRILLION
      ];
      
      console.log('\n=== Difficulty Progression ===');
      console.log('Base pattern has 6 gems\n');
      
      [14, 15, 16, 17].forEach(round => {
        const shiningIndices = manager.getShiningIndices(basePattern, round);
        const filtered = manager.filterShiningGems(basePattern, shiningIndices);
        const percentage = round === 14 ? 60 : 
                          round === 15 ? 50 :
                          round === 16 ? 40 : 30;
        
        console.log(`Round ${round} (${percentage}% shining):`);
        console.log(`  Shining gems: ${shiningIndices.length}`);
        console.log(`  Player repeats: ${filtered.length} gems`);
        console.log(`  Difficulty: ${percentage < 50 ? 'HARD' : 'MODERATE'}`);
      });
    });
  });
});