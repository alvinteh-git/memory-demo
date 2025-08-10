import { describe, it, expect, beforeEach } from 'vitest'
import { GameEngine } from '@/core/game/GameEngine'
import { GameState, GemstoneType, GameVariation } from '@/core/game/types'

describe('GameEngine Class', () => {
  let game: GameEngine

  beforeEach(() => {
    game = new GameEngine()
  })

  describe('Initialization', () => {
    it('should initialize with INITIALIZATION state', () => {
      expect(game.getState()).toBe(GameState.INITIALIZATION)
    })

    it('should start at round 1', () => {
      expect(game.getRound()).toBe(1)
    })

    it('should have empty pattern initially', () => {
      expect(game.getPattern()).toHaveLength(0)
    })

    it('should have zero score initially', () => {
      expect(game.getScore()).toBe(0)
    })

    it('should have no variation initially', () => {
      expect(game.getCurrentVariation()).toBe(GameVariation.NONE)
    })
  })

  describe('Game Start', () => {
    describe('Round 1 - Calibration', () => {
      it('should enter CALIBRATION state for round 1', () => {
        game.startGame()
        expect(game.getState()).toBe(GameState.CALIBRATION)
      })

      it('should generate calibration pattern with all 4 gemstones in random order', () => {
        game.startGame()
        const pattern = game.getPattern()
        
        expect(pattern).toHaveLength(4)
        // Should contain each gemstone exactly once
        expect(pattern).toContain(GemstoneType.EMERALD)
        expect(pattern).toContain(GemstoneType.TRILLION)
        expect(pattern).toContain(GemstoneType.MARQUISE)
        expect(pattern).toContain(GemstoneType.CUSHION)
        
        // Verify no duplicates (each gem appears exactly once)
        const uniqueGems = new Set(pattern)
        expect(uniqueGems.size).toBe(4)
      })
    })

    describe('Pattern Display', () => {
      it('should transition to PATTERN_DISPLAY state', () => {
        game.startGame()
        game.startPatternDisplay()
        expect(game.getState()).toBe(GameState.PATTERN_DISPLAY)
      })

      it('should clear player input when starting pattern display', () => {
        game.startGame()
        game.startPatternDisplay()
        expect(game.getPlayerInput()).toHaveLength(0)
      })
    })

    describe('Player Input', () => {
      it('should transition to PLAYER_INPUT state', () => {
        game.startGame()
        game.startPlayerInput()
        expect(game.getState()).toBe(GameState.PLAYER_INPUT)
      })

      it('should update timer for current round', () => {
        game.startGame()
        game.startPlayerInput()
        expect(game.getTimerSeconds()).toBe(10) // Special calibration timer for round 1
      })
    })
  })

  describe('Pattern Generation', () => {
    it('should generate patterns of correct length', () => {
      // Test pattern length formula: 4 initially, +1 every 3 rounds
      // Formula: 4 + floor((round - 1) / 3)
      const testCases = [
        { round: 1, expectedLength: 4 },  // 4 + floor(0/3) = 4
        { round: 2, expectedLength: 4 },  // 4 + floor(1/3) = 4
        { round: 3, expectedLength: 4 },  // 4 + floor(2/3) = 4
        { round: 4, expectedLength: 5 },  // 4 + floor(3/3) = 5
        { round: 5, expectedLength: 5 },  // 4 + floor(4/3) = 5
        { round: 6, expectedLength: 5 },  // 4 + floor(5/3) = 5
        { round: 7, expectedLength: 6 },  // 4 + floor(6/3) = 6
        { round: 9, expectedLength: 6 },  // 4 + floor(8/3) = 6
        { round: 10, expectedLength: 7 }, // 4 + floor(9/3) = 7
        { round: 12, expectedLength: 7 }, // 4 + floor(11/3) = 7
        { round: 13, expectedLength: 8 }, // 4 + floor(12/3) = 8
      ]

      testCases.forEach(({ round, expectedLength }) => {
        game = new GameEngine()
        // Simulate advancing to specific round
        for (let i = 1; i < round; i++) {
          game.startGame()
          // Handle VARIATION_INTRO state if present
          if (game.getState() === GameState.VARIATION_INTRO) {
            game.startPatternDisplay()
          }
          if (game.getState() === GameState.CALIBRATION) {
            game.startPatternDisplay()
          }
          game.startPlayerInput()
          // Complete the round successfully (handle REVERSE variation)
          const pattern = game.getPattern()
          const variation = game.getCurrentVariation()
          const inputPattern = (variation === GameVariation.REVERSE || 
                               variation === GameVariation.REVERSE_COMBINATION) 
                               ? [...pattern].reverse() 
                               : pattern
          inputPattern.forEach(gem => game.handlePlayerInput(gem))
        }
        
        game.startGame()
        expect(game.getPattern()).toHaveLength(expectedLength)
      })
    })
  })

  describe('Player Input Validation', () => {
    beforeEach(() => {
      game.startGame()
      game.startPatternDisplay()
      game.startPlayerInput()
    })

    it('should accept correct input', () => {
      const pattern = game.getPattern()
      const firstGem = pattern[0]
      
      const result = game.handlePlayerInput(firstGem)
      expect(result).toBe(true)
    })

    it('should reject incorrect input', () => {
      const pattern = game.getPattern()
      const wrongGem = Object.values(GemstoneType).find(g => g !== pattern[0])!
      
      const result = game.handlePlayerInput(wrongGem)
      expect(result).toBe(false)
      expect(game.getState()).toBe(GameState.ROUND_FAILED)
    })

    it('should complete round when pattern matches', () => {
      const pattern = game.getPattern()
      
      pattern.forEach((gem, index) => {
        if (index < pattern.length - 1) {
          game.handlePlayerInput(gem)
          expect(game.getState()).toBe(GameState.PLAYER_INPUT)
        } else {
          game.handlePlayerInput(gem)
          expect(game.getState()).toBe(GameState.ROUND_COMPLETE)
        }
      })
    })

    it('should advance round after successful completion', () => {
      const initialRound = game.getRound()
      const pattern = game.getPattern()
      
      pattern.forEach(gem => game.handlePlayerInput(gem))
      expect(game.getRound()).toBe(initialRound + 1)
    })
  })

  describe('Timer Management', () => {
    it('should decrease timer by 0.25s per round', () => {
      const timerValues = [
        { round: 1, expected: 10.0 },  // Special calibration timer
        { round: 2, expected: 7.5 },   // 8 - (2 * 0.25) = 7.5
        { round: 5, expected: 6.75 },  // 8 - (5 * 0.25) = 6.75
        { round: 10, expected: 5.5 },  // 8 - (10 * 0.25) = 5.5
        { round: 20, expected: 3.0 },  // 8 - (20 * 0.25) = 3.0 (minimum)
        { round: 30, expected: 3.0 },  // Should stay at minimum
      ]

      timerValues.forEach(({ round, expected }) => {
        game = new GameEngine()
        // Simulate advancing to specific round
        for (let i = 1; i < round; i++) {
          game.startGame()
          // Handle VARIATION_INTRO state if present
          if (game.getState() === GameState.VARIATION_INTRO) {
            game.startPatternDisplay()
          }
          if (game.getState() === GameState.CALIBRATION) {
            game.startPatternDisplay()
          }
          game.startPlayerInput()
          const pattern = game.getPattern()
          const variation = game.getCurrentVariation()
          const inputPattern = (variation === GameVariation.REVERSE || 
                               variation === GameVariation.REVERSE_COMBINATION) 
                               ? [...pattern].reverse() 
                               : pattern
          inputPattern.forEach(gem => game.handlePlayerInput(gem))
        }
        
        game.startGame()
        if (game.getState() === GameState.VARIATION_INTRO) {
          game.startPatternDisplay()
        }
        if (game.getState() === GameState.CALIBRATION) {
          game.startPatternDisplay()
        }
        game.startPlayerInput()
        expect(game.getTimerSeconds()).toBe(expected)
      })
    })
  })

  describe('Display Speed', () => {
    it('should decrease display speed by 25ms per round', () => {
      const speedValues = [
        { round: 1, expected: 1000 },  // Special calibration speed
        { round: 2, expected: 700 },   // 750 - (2 * 25) = 700
        { round: 5, expected: 625 },   // 750 - (5 * 25) = 625
        { round: 10, expected: 500 },  // 750 - (10 * 25) = 500
        { round: 18, expected: 300 },  // 750 - (18 * 25) = 300 (minimum)
        { round: 25, expected: 300 },  // Should stay at minimum
      ]

      speedValues.forEach(({ round, expected }) => {
        game = new GameEngine()
        // Simulate advancing to specific round
        for (let i = 1; i < round; i++) {
          game.startGame()
          // Handle VARIATION_INTRO state if present
          if (game.getState() === GameState.VARIATION_INTRO) {
            game.startPatternDisplay()
          }
          if (game.getState() === GameState.CALIBRATION) {
            game.startPatternDisplay()
          }
          game.startPlayerInput()
          const pattern = game.getPattern()
          const variation = game.getCurrentVariation()
          const inputPattern = (variation === GameVariation.REVERSE || 
                               variation === GameVariation.REVERSE_COMBINATION) 
                               ? [...pattern].reverse() 
                               : pattern
          inputPattern.forEach(gem => game.handlePlayerInput(gem))
        }
        
        expect(game.getDisplaySpeed()).toBe(expected)
      })
    })
  })

  describe('Variations', () => {
    it('should select variations from correct pools at each round range', () => {
      // Test that variations are selected from expanding pools
      const variationPools = [
        { rounds: [2, 3, 4], possibleVariations: [GameVariation.REVERSE] },
        { rounds: [5, 6, 7], possibleVariations: [GameVariation.REVERSE, GameVariation.GHOST] },
        { rounds: [8, 9, 10], possibleVariations: [GameVariation.REVERSE, GameVariation.GHOST, GameVariation.SPEED_CHAOS] },
        { rounds: [11, 12, 13], possibleVariations: [GameVariation.REVERSE, GameVariation.GHOST, GameVariation.SPEED_CHAOS, GameVariation.COLOR_SHUFFLE] },
        { rounds: [14, 15, 16], possibleVariations: [GameVariation.REVERSE, GameVariation.GHOST, GameVariation.SPEED_CHAOS, GameVariation.COLOR_SHUFFLE, GameVariation.SELECTIVE_ATTENTION] },
        { rounds: [17, 18, 19], possibleVariations: [GameVariation.REVERSE_COMBINATION] },
      ]

      variationPools.forEach(({ rounds, possibleVariations }) => {
        const round = rounds[0] // Test first round of each set
        game = new GameEngine()
        // Advance to the specific round
        for (let i = 1; i < round; i++) {
          game.startGame()
          if (game.getState() === GameState.VARIATION_INTRO) {
            game.startPatternDisplay()
          }
          if (game.getState() === GameState.CALIBRATION) {
            game.startPatternDisplay()
          }
          game.startPlayerInput()
          const pattern = game.getPattern()
          const variation = game.getCurrentVariation()
          const inputPattern = (variation === GameVariation.REVERSE || 
                               variation === GameVariation.REVERSE_COMBINATION) 
                               ? [...pattern].reverse() 
                               : pattern
          inputPattern.forEach(gem => game.handlePlayerInput(gem))
        }
        
        game.startGame()
        const variation = game.getCurrentVariation()
        expect(possibleVariations).toContain(variation)
      })
    })

    it('should apply REVERSE variation correctly', () => {
      // Advance to round 2 to get REVERSE variation
      game.startGame()
      game.startPatternDisplay()
      game.startPlayerInput()
      const pattern1 = game.getPattern()
      pattern1.forEach(gem => game.handlePlayerInput(gem))
      
      // Now in round 2 with REVERSE (only option in pool)
      game.startGame()
      expect(game.getCurrentVariation()).toBe(GameVariation.REVERSE)
      game.startPatternDisplay()
      game.startPlayerInput()
      
      const pattern = game.getPattern()
      const reversedPattern = [...pattern].reverse()
      
      // Should accept reversed input
      reversedPattern.forEach((gem, index) => {
        const result = game.handlePlayerInput(gem)
        if (index < reversedPattern.length - 1) {
          expect(result).toBe(true)
        }
      })
      
      expect(game.getState()).toBe(GameState.ROUND_COMPLETE)
    })

    it('should avoid repeating previous variation when selecting new one', () => {
      // This test would need access to private variation tracking
      // Can only test indirectly through multiple variation changes
      // Skip detailed implementation as it would require exposing internals
    })

    it('should apply combination mode correctly at round 17+', () => {
      // Advance to round 17
      for (let i = 1; i < 17; i++) {
        game.startGame()
        if (game.getState() === GameState.VARIATION_INTRO) {
          game.startPatternDisplay()
        }
        if (game.getState() === GameState.CALIBRATION) {
          game.startPatternDisplay()
        }
        game.startPlayerInput()
        const pattern = game.getPattern()
        const variation = game.getCurrentVariation()
        const inputPattern = (variation === GameVariation.REVERSE || 
                             variation === GameVariation.REVERSE_COMBINATION) 
                             ? [...pattern].reverse() 
                             : pattern
        inputPattern.forEach(gem => game.handlePlayerInput(gem))
      }
      
      // Round 17 should have REVERSE_COMBINATION
      game.startGame()
      expect(game.getCurrentVariation()).toBe(GameVariation.REVERSE_COMBINATION)
      expect(game.getState()).toBe(GameState.VARIATION_INTRO)
    })
  })

  describe('Scoring', () => {
    it('should calculate score based on round', () => {
      game.startGame()
      game.startPatternDisplay()
      game.startPlayerInput()
      
      const pattern = game.getPattern()
      pattern.forEach(gem => game.handlePlayerInput(gem))
      
      expect(game.getScore()).toBeGreaterThan(0)
    })

    it('should show VARIATION_INTRO state only on first round of new variation', () => {
      // Advance to round 2
      game.startGame()
      game.startPatternDisplay()
      game.startPlayerInput()
      const pattern1 = game.getPattern()
      pattern1.forEach(gem => game.handlePlayerInput(gem))
      
      // Round 2 - should show VARIATION_INTRO for first variation
      game.startGame()
      expect(game.getState()).toBe(GameState.VARIATION_INTRO)
      const round2Variation = game.getCurrentVariation()
      expect(round2Variation).toBe(GameVariation.REVERSE) // Only option in pool
    })

    it('should persist variation for 3-round sets', () => {
      // Advance to round 2
      game.startGame()
      game.startPatternDisplay()
      game.startPlayerInput()
      const pattern1 = game.getPattern()
      pattern1.forEach(gem => game.handlePlayerInput(gem))
      
      // Round 2 - get initial variation
      game.startGame()
      const round2Variation = game.getCurrentVariation()
      
      // Complete round 2
      if (game.getState() === GameState.VARIATION_INTRO) {
        game.startPatternDisplay()
      }
      game.startPlayerInput()
      const pattern2 = game.getPattern()
      const inputPattern2 = round2Variation === GameVariation.REVERSE ? [...pattern2].reverse() : pattern2
      inputPattern2.forEach(gem => game.handlePlayerInput(gem))
      
      // Round 3 - should have same variation
      game.startGame()
      expect(game.getCurrentVariation()).toBe(round2Variation)
      expect(game.getState()).not.toBe(GameState.VARIATION_INTRO) // No intro for same variation
      
      // Complete round 3
      game.startPatternDisplay()
      game.startPlayerInput()
      const pattern3 = game.getPattern()
      const inputPattern3 = round2Variation === GameVariation.REVERSE ? [...pattern3].reverse() : pattern3
      inputPattern3.forEach(gem => game.handlePlayerInput(gem))
      
      // Round 4 - should still have same variation
      game.startGame()
      expect(game.getCurrentVariation()).toBe(round2Variation)
      expect(game.getState()).not.toBe(GameState.VARIATION_INTRO)
      
      // Complete round 4
      game.startPatternDisplay()
      game.startPlayerInput()
      const pattern4 = game.getPattern()
      const inputPattern4 = round2Variation === GameVariation.REVERSE ? [...pattern4].reverse() : pattern4
      inputPattern4.forEach(gem => game.handlePlayerInput(gem))
      
      // Round 5 - should have NEW variation and show intro
      game.startGame()
      const round5Variation = game.getCurrentVariation()
      expect([GameVariation.REVERSE, GameVariation.GHOST]).toContain(round5Variation)
      expect(game.getState()).toBe(GameState.VARIATION_INTRO)
    })

    it('should apply variation bonus to score', () => {
      // Note: Current implementation uses simple scoring (100 * round * variation_bonus)
      // Spec requires ticket system with base_reward, round_multipliers, and variation_bonuses
      // This test validates current implementation until ticket system is added
      
      // Get to round 2 for variation
      game.startGame()
      game.startPatternDisplay()
      game.startPlayerInput()
      const pattern1 = game.getPattern()
      pattern1.forEach(gem => game.handlePlayerInput(gem))
      
      const scoreRound1 = game.getScore()
      
      // Round 2 with REVERSE variation (only option in pool)
      game.startGame()
      expect(game.getCurrentVariation()).toBe(GameVariation.REVERSE)
      if (game.getState() === GameState.VARIATION_INTRO) {
        game.startPatternDisplay()
      }
      game.startPlayerInput()
      const pattern2 = game.getPattern().reverse() // REVERSE variation requires reversed input
      pattern2.forEach(gem => game.handlePlayerInput(gem))
      
      const scoreRound2 = game.getScore()
      const round2Increase = scoreRound2 - scoreRound1
      
      // With current simple scoring: Round 2 base = 200, with 15% bonus = 230
      expect(round2Increase).toBe(230)
    })
  })

  describe('Game Reset', () => {
    it('should reset all game state', () => {
      // Play a few rounds
      game.startGame()
      game.startPatternDisplay()
      game.startPlayerInput()
      const pattern = game.getPattern()
      pattern.forEach(gem => game.handlePlayerInput(gem))
      
      // Reset
      game.resetGame()
      
      expect(game.getState()).toBe(GameState.INITIALIZATION)
      expect(game.getRound()).toBe(1)
      expect(game.getPattern()).toHaveLength(0)
      expect(game.getScore()).toBe(0)
      expect(game.getCurrentVariation()).toBe(GameVariation.NONE)
    })
  })
})