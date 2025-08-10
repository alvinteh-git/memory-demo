import { describe, it, expect, beforeEach } from 'vitest';
import { VariationManager } from '@/core/variations/VariationManager';
import { GameVariation, GemstoneType } from '@/core/game/types';

describe('REVERSE Variation', () => {
  let manager: VariationManager;

  beforeEach(() => {
    manager = new VariationManager();
  });

  describe('Pattern Reversal', () => {
    it('should reverse a simple 2-gem pattern', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION
      ];
      
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.REVERSE);
      
      // Visual representation for easy validation
      console.log('Original:', pattern.map(g => g.toLowerCase()));
      console.log('Expected:', expectedInput.map(g => g.toLowerCase()));
      
      expect(expectedInput).toEqual([
        GemstoneType.TRILLION,
        GemstoneType.EMERALD
      ]);
    });

    it('should reverse a 4-gem pattern', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.REVERSE);
      
      expect(expectedInput).toEqual([
        GemstoneType.MARQUISE,
        GemstoneType.CUSHION,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD
      ]);
    });

    it('should handle patterns with repeated gems', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD
      ];
      
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.REVERSE);
      
      // Ensure repeated gems maintain their positions when reversed
      expect(expectedInput).toEqual([
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD,
        GemstoneType.EMERALD
      ]);
    });

    it('should handle single gem pattern', () => {
      const pattern: GemstoneType[] = [GemstoneType.CUSHION];
      
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.REVERSE);
      
      // Single gem should remain the same
      expect(expectedInput).toEqual([GemstoneType.CUSHION]);
    });
  });

  describe('Input Validation', () => {
    it('should validate correct reversed input', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.MARQUISE
      ];
      
      const playerInput: GemstoneType[] = [
        GemstoneType.MARQUISE,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD
      ];
      
      const isValid = manager.validateInput(playerInput, pattern, GameVariation.REVERSE);
      
      expect(isValid).toBe(true);
    });

    it('should reject non-reversed input', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.MARQUISE
      ];
      
      // Player enters pattern in original order (wrong for REVERSE)
      const playerInput: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.MARQUISE
      ];
      
      const isValid = manager.validateInput(playerInput, pattern, GameVariation.REVERSE);
      
      expect(isValid).toBe(false);
    });

    it('should reject partially correct reversed input', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      // Player gets first two right but then makes mistake
      const playerInput: GemstoneType[] = [
        GemstoneType.MARQUISE,
        GemstoneType.CUSHION,
        GemstoneType.EMERALD, // Wrong! Should be TRILLION
        GemstoneType.TRILLION
      ];
      
      const isValid = manager.validateInput(playerInput, pattern, GameVariation.REVERSE);
      
      expect(isValid).toBe(false);
    });

    it('should reject input of wrong length', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      // Player input is too short
      const playerInput: GemstoneType[] = [
        GemstoneType.CUSHION,
        GemstoneType.TRILLION
      ];
      
      const isValid = manager.validateInput(playerInput, pattern, GameVariation.REVERSE);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Step-by-Step Validation', () => {
    it('should correctly identify expected gem at each position', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,   // Position 0
        GemstoneType.TRILLION,  // Position 1
        GemstoneType.CUSHION,   // Position 2
        GemstoneType.MARQUISE   // Position 3
      ];
      
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.REVERSE);
      
      // Validate each position
      expect(expectedInput[0]).toBe(GemstoneType.MARQUISE); // Last becomes first
      expect(expectedInput[1]).toBe(GemstoneType.CUSHION);  // 3rd becomes 2nd
      expect(expectedInput[2]).toBe(GemstoneType.TRILLION); // 2nd becomes 3rd
      expect(expectedInput[3]).toBe(GemstoneType.EMERALD);  // First becomes last
    });
  });

  describe('Reverse Combination Mode', () => {
    it('should apply REVERSE in combination mode', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.REVERSE_COMBINATION);
      
      // REVERSE_COMBINATION should still reverse the pattern
      expect(expectedInput).toEqual([
        GemstoneType.CUSHION,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD
      ]);
    });

    it('should validate reversed input in combination mode', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.MARQUISE
      ];
      
      const correctInput: GemstoneType[] = [
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD
      ];
      
      const isValid = manager.validateInput(correctInput, pattern, GameVariation.REVERSE_COMBINATION);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pattern', () => {
      const pattern: GemstoneType[] = [];
      
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.REVERSE);
      
      expect(expectedInput).toEqual([]);
    });

    it('should handle all same gems', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.TRILLION,
        GemstoneType.TRILLION,
        GemstoneType.TRILLION,
        GemstoneType.TRILLION
      ];
      
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.REVERSE);
      
      // All same gems should still be the same when reversed
      expect(expectedInput).toEqual(pattern);
    });

    it('should handle palindrome patterns', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.TRILLION,
        GemstoneType.EMERALD
      ];
      
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.REVERSE);
      
      // Palindrome should be the same when reversed
      expect(expectedInput).toEqual(pattern);
    });
  });

  describe('Visual Output Tests', () => {
    it('should provide clear visual representation of reversal', () => {
      const testCases = [
        {
          name: 'Simple 3-gem',
          pattern: [GemstoneType.EMERALD, GemstoneType.TRILLION, GemstoneType.CUSHION],
          expected: [GemstoneType.CUSHION, GemstoneType.TRILLION, GemstoneType.EMERALD]
        },
        {
          name: 'With repeats',
          pattern: [GemstoneType.EMERALD, GemstoneType.EMERALD, GemstoneType.TRILLION],
          expected: [GemstoneType.TRILLION, GemstoneType.EMERALD, GemstoneType.EMERALD]
        },
        {
          name: 'Long pattern',
          pattern: [
            GemstoneType.EMERALD,
            GemstoneType.TRILLION,
            GemstoneType.MARQUISE,
            GemstoneType.CUSHION,
            GemstoneType.EMERALD
          ],
          expected: [
            GemstoneType.EMERALD,
            GemstoneType.CUSHION,
            GemstoneType.MARQUISE,
            GemstoneType.TRILLION,
            GemstoneType.EMERALD
          ]
        }
      ];

      testCases.forEach(testCase => {
        const result = manager.getExpectedInput(testCase.pattern, GameVariation.REVERSE);
        
        console.log(`\n${testCase.name}:`);
        console.log('  Original:', testCase.pattern.map(g => g.substring(0, 3)).join(' -> '));
        console.log('  Reversed:', result.map(g => g.substring(0, 3)).join(' -> '));
        
        expect(result).toEqual(testCase.expected);
      });
    });
  });
});