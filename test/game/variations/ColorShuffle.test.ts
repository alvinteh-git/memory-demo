import { describe, it, expect, beforeEach } from 'vitest';
import { VariationManager } from '@/core/variations/VariationManager';
import { GameVariation, GemstoneType } from '@/core/game/types';

describe('COLOR_SHUFFLE Variation', () => {
  let manager: VariationManager;

  beforeEach(() => {
    manager = new VariationManager();
  });

  describe('Color Mapping Generation', () => {
    it('should create a mapping for all 4 gem types', () => {
      const colorMap = manager.getShuffledColors();
      
      // Should have exactly 4 mappings
      expect(colorMap.size).toBe(4);
      
      // Should include all gem types as keys
      expect(colorMap.has(GemstoneType.EMERALD)).toBe(true);
      expect(colorMap.has(GemstoneType.TRILLION)).toBe(true);
      expect(colorMap.has(GemstoneType.CUSHION)).toBe(true);
      expect(colorMap.has(GemstoneType.MARQUISE)).toBe(true);
      
      console.log('Color mappings:');
      colorMap.forEach((newColor, originalColor) => {
        console.log(`  ${originalColor} -> ${newColor}`);
      });
    });

    it('should map each gem to a valid gem type', () => {
      const colorMap = manager.getShuffledColors();
      const validGems = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      colorMap.forEach((mappedGem) => {
        expect(validGems).toContain(mappedGem);
      });
    });

    it('should use all gem types in mapping (no duplicates)', () => {
      const colorMap = manager.getShuffledColors();
      const mappedValues = Array.from(colorMap.values());
      
      // Should have 4 unique mapped values
      const uniqueMapped = new Set(mappedValues);
      expect(uniqueMapped.size).toBe(4);
      
      // Should include all gem types
      expect(mappedValues).toContain(GemstoneType.EMERALD);
      expect(mappedValues).toContain(GemstoneType.TRILLION);
      expect(mappedValues).toContain(GemstoneType.CUSHION);
      expect(mappedValues).toContain(GemstoneType.MARQUISE);
    });
  });

  describe('Shuffle Randomness', () => {
    it('should create different shuffles over multiple calls', () => {
      const shuffles: string[] = [];
      
      // Generate multiple shuffles
      for (let i = 0; i < 10; i++) {
        const colorMap = manager.getShuffledColors();
        const shuffleString = Array.from(colorMap.entries())
          .map(([k, v]) => `${k}->${v}`)
          .sort()
          .join(',');
        shuffles.push(shuffleString);
      }
      
      // Should have some variety
      const uniqueShuffles = new Set(shuffles);
      expect(uniqueShuffles.size).toBeGreaterThan(1);
      
      console.log(`Generated ${uniqueShuffles.size} unique shuffles out of 10 attempts`);
    });

    it('should actually shuffle (not always identity mapping)', () => {
      let hasNonIdentity = false;
      
      // Try multiple times to ensure we get at least one non-identity shuffle
      for (let i = 0; i < 20; i++) {
        const colorMap = manager.getShuffledColors();
        
        // Check if any gem maps to a different gem
        const isShuffled = Array.from(colorMap.entries())
          .some(([original, mapped]) => original !== mapped);
        
        if (isShuffled) {
          hasNonIdentity = true;
          
          console.log('Found shuffled mapping:');
          colorMap.forEach((mapped, original) => {
            if (original !== mapped) {
              console.log(`  ${original} -> ${mapped} (changed)`);
            }
          });
          break;
        }
      }
      
      expect(hasNonIdentity).toBe(true);
    });
  });

  describe('Pattern Display with Color Shuffle', () => {
    it('should not change the expected input pattern', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      // Color shuffle doesn't change expected input (player clicks positions, not colors)
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.COLOR_SHUFFLE);
      
      expect(expectedInput).toEqual(pattern);
    });

    it('should validate position-based input', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.MARQUISE
      ];
      
      // Player should click the original positions, regardless of color shuffle
      const playerInput: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.MARQUISE
      ];
      
      const isValid = manager.validateInput(playerInput, pattern, GameVariation.COLOR_SHUFFLE);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Visual Simulation', () => {
    it('should simulate color shuffle display', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      const colorMap = manager.getShuffledColors();
      
      console.log('\n=== Color Shuffle Display Simulation ===');
      console.log('PHASE 1 - Pattern Display (original colors):');
      pattern.forEach((gem, index) => {
        console.log(`  Step ${index + 1}: Show ${gem} with its normal color`);
      });
      
      console.log('\nPHASE 2 - Colors Shuffle (during input):');
      console.log('Color swaps:');
      colorMap.forEach((newColor, originalGem) => {
        if (originalGem !== newColor) {
          console.log(`  ${originalGem} now shows ${newColor}'s color`);
        } else {
          console.log(`  ${originalGem} keeps its color`);
        }
      });
      
      console.log('\nPHASE 3 - Player Input:');
      console.log('Player must click the POSITIONS where gems appeared,');
      console.log('ignoring the shuffled colors!');
      
      expect(colorMap).toBeDefined();
    });

    it('should show how repeated gems look after shuffle', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD
      ];
      
      const colorMap = manager.getShuffledColors();
      const emeraldNewColor = colorMap.get(GemstoneType.EMERALD);
      
      console.log('\nRepeated gems after color shuffle:');
      console.log(`Original pattern: ${pattern.map(g => g).join(', ')}`);
      console.log(`EMERALD now displays as: ${emeraldNewColor}`);
      
      pattern.forEach((gem, index) => {
        const displayColor = colorMap.get(gem);
        console.log(`  Position ${index}: ${gem} (showing ${displayColor}'s color)`);
      });
      
      console.log('\nAll EMERALD positions now show the same shuffled color!');
      
      expect(emeraldNewColor).toBeDefined();
    });
  });

  describe('Mapping Consistency', () => {
    it('should maintain consistent mapping for same gem type', () => {
      const colorMap = manager.getShuffledColors();
      
      // Get mapping for EMERALD
      const emeraldColor1 = colorMap.get(GemstoneType.EMERALD);
      const emeraldColor2 = colorMap.get(GemstoneType.EMERALD);
      
      // Should always return same mapping for same gem
      expect(emeraldColor1).toBe(emeraldColor2);
    });

    it('should create bijective mapping (one-to-one)', () => {
      const colorMap = manager.getShuffledColors();
      
      // Create reverse mapping
      const reverseMap = new Map<GemstoneType, GemstoneType>();
      colorMap.forEach((value, key) => {
        expect(reverseMap.has(value)).toBe(false); // No duplicate values
        reverseMap.set(value, key);
      });
      
      // Should be able to reverse the mapping
      expect(reverseMap.size).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all gems being the same in pattern', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.TRILLION,
        GemstoneType.TRILLION,
        GemstoneType.TRILLION,
        GemstoneType.TRILLION
      ];
      
      const colorMap = manager.getShuffledColors();
      const trillionNewColor = colorMap.get(GemstoneType.TRILLION);
      
      console.log('\nAll same gem with color shuffle:');
      console.log(`All TRILLION gems now display as: ${trillionNewColor}`);
      
      // All should map to same new color
      pattern.forEach((gem, index) => {
        const displayColor = colorMap.get(gem);
        expect(displayColor).toBe(trillionNewColor);
        console.log(`  Position ${index}: Shows ${displayColor}'s color`);
      });
    });

    it('should work with single gem pattern', () => {
      const pattern: GemstoneType[] = [GemstoneType.CUSHION];
      
      const colorMap = manager.getShuffledColors();
      const cushionNewColor = colorMap.get(GemstoneType.CUSHION);
      
      expect(cushionNewColor).toBeDefined();
      expect([
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ]).toContain(cushionNewColor);
    });
  });

  describe('Shuffle Statistics', () => {
    it('should analyze shuffle distribution', () => {
      const stats = new Map<string, number>();
      
      // Run many shuffles to check distribution
      for (let i = 0; i < 100; i++) {
        const colorMap = manager.getShuffledColors();
        
        // Track where EMERALD maps to
        const emeraldMapsTo = colorMap.get(GemstoneType.EMERALD)!;
        const key = `EMERALD->${emeraldMapsTo}`;
        stats.set(key, (stats.get(key) || 0) + 1);
      }
      
      console.log('\nShuffle distribution (100 runs):');
      stats.forEach((count, mapping) => {
        console.log(`  ${mapping}: ${count} times (${count}%)`);
      });
      
      // Should have reasonable distribution
      stats.forEach((count) => {
        expect(count).toBeGreaterThan(5); // At least 5% chance
        expect(count).toBeLessThan(50); // Not more than 50% (would indicate bias)
      });
    });
  });

  describe('Complete Scenario', () => {
    it('should demonstrate full COLOR_SHUFFLE gameplay', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD,
        GemstoneType.CUSHION
      ];
      
      const colorMap = manager.getShuffledColors();
      
      console.log('\n=== Complete COLOR_SHUFFLE Scenario ===');
      console.log('Original pattern positions:');
      console.log('  Position 0 (Top): EMERALD');
      console.log('  Position 1 (Right): TRILLION');  
      console.log('  Position 2 (Bottom): EMERALD');
      console.log('  Position 3 (Left): CUSHION');
      
      console.log('\nAfter color shuffle:');
      console.log('  Position 0 (Top): Shows ' + colorMap.get(GemstoneType.EMERALD) + ' color');
      console.log('  Position 1 (Right): Shows ' + colorMap.get(GemstoneType.TRILLION) + ' color');
      console.log('  Position 2 (Bottom): Shows ' + colorMap.get(GemstoneType.EMERALD) + ' color');
      console.log('  Position 3 (Left): Shows ' + colorMap.get(GemstoneType.CUSHION) + ' color');
      
      console.log('\nCorrect input sequence:');
      console.log('  Click 1: Top position (originally EMERALD)');
      console.log('  Click 2: Right position (originally TRILLION)');
      console.log('  Click 3: Bottom position (originally EMERALD again)');
      console.log('  Click 4: Left position (originally CUSHION)');
      
      console.log('\nKey insight: Ignore the colors, remember the POSITIONS!');
      
      expect(pattern).toBeDefined();
    });
  });
});