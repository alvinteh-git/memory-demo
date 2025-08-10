import { describe, it, expect, beforeEach } from 'vitest';
import { VariationManager } from '@/core/variations/VariationManager';
import { GameVariation, GemstoneType } from '@/core/game/types';

describe('SPEED_CHAOS Variation', () => {
  let manager: VariationManager;

  beforeEach(() => {
    manager = new VariationManager();
  });

  describe('Timing Generation', () => {
    it('should generate timing for each gem in pattern', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      const timings = manager.getChaosTimings(pattern, 8);
      
      // Should have one timing per gem
      expect(timings).toHaveLength(pattern.length);
      
      // All timings should be numbers
      timings.forEach((timing, index) => {
        expect(typeof timing).toBe('number');
        console.log(`Gem ${index}: ${timing}ms`);
      });
    });

    it('should generate different timings for each gem', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD
      ];
      
      const timings = manager.getChaosTimings(pattern, 8);
      
      // Check for variety in timings
      const uniqueTimings = new Set(timings);
      
      // Should have some variety (not all the same)
      expect(uniqueTimings.size).toBeGreaterThan(1);
      
      console.log('Timing variety:', Array.from(uniqueTimings).sort());
    });
  });

  describe('Round-Based Timing Ranges', () => {
    it('should use 300-900ms range for round 8', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      const timings = manager.getChaosTimings(pattern, 8);
      
      timings.forEach((timing, index) => {
        expect(timing).toBeGreaterThanOrEqual(300);
        expect(timing).toBeLessThanOrEqual(900);
        console.log(`Round 8, Gem ${index}: ${timing}ms`);
      });
    });

    it('should use 250-950ms range for round 9', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION
      ];
      
      const timings = manager.getChaosTimings(pattern, 9);
      
      timings.forEach((timing, index) => {
        expect(timing).toBeGreaterThanOrEqual(250);
        expect(timing).toBeLessThanOrEqual(950);
        console.log(`Round 9, Gem ${index}: ${timing}ms`);
      });
    });

    it('should use 200-1000ms range for round 10', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION
      ];
      
      const timings = manager.getChaosTimings(pattern, 10);
      
      timings.forEach((timing, index) => {
        expect(timing).toBeGreaterThanOrEqual(200);
        expect(timing).toBeLessThanOrEqual(1000);
        console.log(`Round 10, Gem ${index}: ${timing}ms`);
      });
    });

    it('should use 150-1200ms range for combination mode (round 17+)', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      const timings = manager.getChaosTimings(pattern, 17);
      
      timings.forEach((timing, index) => {
        expect(timing).toBeGreaterThanOrEqual(150);
        expect(timing).toBeLessThanOrEqual(1200);
        console.log(`Round 17+, Gem ${index}: ${timing}ms`);
      });
    });
  });

  describe('Timing Distribution', () => {
    it('should generate varied timings across the range', () => {
      const pattern: GemstoneType[] = new Array(20).fill(GemstoneType.EMERALD);
      
      const timings = manager.getChaosTimings(pattern, 10);
      
      const minTiming = Math.min(...timings);
      const maxTiming = Math.max(...timings);
      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
      
      console.log('\nTiming Distribution (Round 10):');
      console.log(`  Min: ${minTiming}ms`);
      console.log(`  Max: ${maxTiming}ms`);
      console.log(`  Avg: ${Math.round(avgTiming)}ms`);
      console.log(`  Range: ${maxTiming - minTiming}ms`);
      
      // Should use a good portion of the range
      expect(maxTiming - minTiming).toBeGreaterThan(200);
    });

    it('should show randomness over multiple generations', () => {
      const pattern: GemstoneType[] = [GemstoneType.EMERALD];
      const timingSets: number[][] = [];
      
      // Generate multiple timing sets
      for (let i = 0; i < 5; i++) {
        timingSets.push(manager.getChaosTimings(pattern, 8));
      }
      
      console.log('\nMultiple generations for same pattern:');
      timingSets.forEach((timing, index) => {
        console.log(`  Generation ${index + 1}: ${timing[0]}ms`);
      });
      
      // Should generate different timings
      const uniqueValues = new Set(timingSets.map(t => t[0]));
      expect(uniqueValues.size).toBeGreaterThan(1);
    });
  });

  describe('Pattern Display Simulation', () => {
    it('should simulate chaotic pattern display', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE
      ];
      
      const timings = manager.getChaosTimings(pattern, 9);
      let cumulativeTime = 0;
      
      console.log('\n=== Speed Chaos Display Simulation ===');
      console.log('Normal speed would be: 750ms per gem');
      console.log('Chaos timing:');
      
      pattern.forEach((gem, index) => {
        const timing = timings[index];
        const speed = timing < 400 ? 'FAST!' : timing > 800 ? 'SLOW' : 'MEDIUM';
        
        console.log(`  Time ${cumulativeTime}ms: Show ${gem} for ${timing}ms (${speed})`);
        cumulativeTime += timing;
      });
      
      console.log(`Total display time: ${cumulativeTime}ms`);
      console.log(`Normal would be: ${pattern.length * 750}ms`);
      
      expect(cumulativeTime).toBeGreaterThan(0);
    });

    it('should handle repeated gems with varied timing', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.TRILLION,
        GemstoneType.TRILLION,
        GemstoneType.TRILLION
      ];
      
      const timings = manager.getChaosTimings(pattern, 8);
      
      console.log('\nRepeated gems with chaos timing:');
      pattern.forEach((gem, index) => {
        console.log(`  ${gem} #${index + 1}: ${timings[index]}ms`);
      });
      
      // Even repeated gems should have different timings
      const uniqueTimings = new Set(timings);
      expect(uniqueTimings.size).toBeGreaterThan(1);
    });
  });

  describe('Input Validation with Speed Chaos', () => {
    it('should not affect expected input pattern', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      // Speed chaos doesn't change the expected input
      const expectedInput = manager.getExpectedInput(pattern, GameVariation.SPEED_CHAOS);
      
      // Pattern should remain the same
      expect(expectedInput).toEqual(pattern);
    });

    it('should validate normal input despite chaos timing', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.MARQUISE
      ];
      
      const playerInput: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.MARQUISE
      ];
      
      const isValid = manager.validateInput(playerInput, pattern, GameVariation.SPEED_CHAOS);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single gem pattern', () => {
      const pattern: GemstoneType[] = [GemstoneType.CUSHION];
      
      const timings = manager.getChaosTimings(pattern, 8);
      
      expect(timings).toHaveLength(1);
      expect(timings[0]).toBeGreaterThanOrEqual(300);
      expect(timings[0]).toBeLessThanOrEqual(900);
    });

    it('should handle empty pattern', () => {
      const pattern: GemstoneType[] = [];
      
      const timings = manager.getChaosTimings(pattern, 8);
      
      expect(timings).toEqual([]);
    });

    it('should handle very long patterns', () => {
      const pattern: GemstoneType[] = new Array(10).fill(GemstoneType.EMERALD);
      
      const timings = manager.getChaosTimings(pattern, 10);
      
      expect(timings).toHaveLength(10);
      
      // All should be within range
      timings.forEach(timing => {
        expect(timing).toBeGreaterThanOrEqual(200);
        expect(timing).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe('Timing Consistency', () => {
    it('should always generate integer milliseconds', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION
      ];
      
      const timings = manager.getChaosTimings(pattern, 8);
      
      timings.forEach(timing => {
        expect(Number.isInteger(timing)).toBe(true);
      });
    });

    it('should never generate negative timings', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION
      ];
      
      for (let round = 8; round <= 20; round++) {
        const timings = manager.getChaosTimings(pattern, round);
        
        timings.forEach(timing => {
          expect(timing).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Visual Comparison', () => {
    it('should show timing chaos vs normal timing', () => {
      const pattern: GemstoneType[] = [
        GemstoneType.EMERALD,
        GemstoneType.TRILLION,
        GemstoneType.CUSHION,
        GemstoneType.MARQUISE,
        GemstoneType.EMERALD
      ];
      
      const normalSpeed = 750;
      const chaosTimings = manager.getChaosTimings(pattern, 9);
      
      console.log('\n=== Normal vs Chaos Timing ===');
      console.log('Pattern:', pattern.map(g => g.substring(0, 3)).join(' -> '));
      console.log('\nNormal timing (consistent):');
      pattern.forEach((gem, i) => {
        console.log(`  ${i}: ${normalSpeed}ms`);
      });
      
      console.log('\nChaos timing (random):');
      chaosTimings.forEach((timing, i) => {
        const diff = timing - normalSpeed;
        const indicator = diff > 0 ? `+${diff}` : `${diff}`;
        console.log(`  ${i}: ${timing}ms (${indicator}ms)`);
      });
      
      const totalNormal = pattern.length * normalSpeed;
      const totalChaos = chaosTimings.reduce((a, b) => a + b, 0);
      
      console.log(`\nTotal time - Normal: ${totalNormal}ms, Chaos: ${totalChaos}ms`);
      console.log(`Difference: ${Math.abs(totalChaos - totalNormal)}ms`);
      
      expect(chaosTimings).toBeDefined();
    });
  });
});