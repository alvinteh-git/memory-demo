import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '@/core/game/GameEngine';
import { TicketManager } from '@/core/economy/TicketManager';
import { GameState, GameVariation } from '@/core/game/types';
import type { TicketConfig } from '@/utils/yaml-loader';

// Mock configuration for testing
const createMockConfig = (overrides?: Partial<TicketConfig>): TicketConfig => ({
  demo: {
    enabled: true,
    starting_balance: 100.00,
    allow_reset: true,
    show_statistics: true
  },
  game: {
    cost_to_play: 10.00,
    ticket_precision: 2
  },
  difficulty_settings: {
    normal: {
      name: "Normal",
      reward_multiplier: 1.00,
      pattern_display_time_multiplier: 1.00,
      response_time_multiplier: 1.00,
      description: "Standard challenge"
    },
    easy: {
      name: "Easy",
      reward_multiplier: 0.50,
      pattern_display_time_multiplier: 1.50,
      response_time_multiplier: 1.50,
      description: "More time, fewer tickets"
    },
    hard: {
      name: "Hard",
      reward_multiplier: 2.00,
      pattern_display_time_multiplier: 0.50,
      response_time_multiplier: 0.50,
      description: "Less time, more tickets"
    }
  },
  default_difficulty: "normal",
  base_reward: 2.50,
  round_multipliers: [
    0.01, 0.10, 0.20, 0.35, 0.50, 0.70, 0.90, 1.15, 1.40, 1.70,
    2.00, 2.35, 2.75, 3.20, 3.70, 4.30, 5.00, 5.80, 6.70, 8.00
  ],
  variation_bonuses: {
    none: 1.00,
    reverse: 1.15,
    ghost: 1.15,
    speed_chaos: 1.20,
    color_shuffle: 1.15,
    selective: 1.20,
    reverse_combo: 1.35
  },
  disabled_variation_penalties: {
    per_variation_penalty: 0.05,
    max_penalty: 0.25
  },
  display: {
    show_balance: true,
    show_earned: true,
    show_next_reward: true,
    animate_rewards: true,
    decimal_format: "0.00"
  },
  feedback_thresholds: {
    small: 1.00,
    medium: 5.00,
    large: 10.00,
    mega: 20.00
  },
  animations: {
    ticket_increment_duration: 1000,
    per_ticket_delay: 50,
    celebration_duration: 2000,
    balance_flash_duration: 500
  },
  sounds: {
    enabled: true,
    ticket_award: "ticket_chime.wav",
    counting: "tick.wav",
    milestone: "achievement.wav",
    insufficient_funds: "error.wav"
  },
  tracking: {
    save_statistics: true,
    track_rtp: true,
    track_distribution: true,
    max_history: 1000
  },
  limits: {
    max_balance: 9999.99,
    min_balance: 0.00,
    max_single_payout: 200.00,
    max_round: 50
  },
  rtp_target: 0.90,
  player_distribution: {
    1: 1.00,
    2: 0.95,
    3: 0.85,
    4: 0.75,
    5: 0.65
  },
  ...overrides
});

describe('Ticket Economy Business Logic', () => {
  let game: GameEngine;
  let ticketManager: TicketManager;
  let config: TicketConfig;

  beforeEach(() => {
    config = createMockConfig();
    ticketManager = new TicketManager(config);
    game = new GameEngine(ticketManager);
  });

  describe('Game Session Economics', () => {
    it('should handle a complete game session with positive ROI', () => {
      const startBalance = ticketManager.getBalance();
      
      // Start game (costs 10 tickets)
      const canStart = game.startGameWithTickets();
      expect(canStart).toBe(true);
      expect(ticketManager.getBalance()).toBe(startBalance - 10);
      
      // Simulate playing to round 5
      for (let round = 1; round <= 5; round++) {
        if (game.getState() === GameState.CALIBRATION) {
          game.startPatternDisplay();
        } else if (game.getState() === GameState.VARIATION_INTRO) {
          game.startPatternDisplay();
        } else if (game.getState() === GameState.PATTERN_DISPLAY) {
          // Pattern already displayed on startGame
        }
        
        game.startPlayerInput();
        
        // Simulate correct input
        const pattern = game.getPattern();
        const variation = game.getCurrentVariation();
        const inputPattern = (variation === GameVariation.REVERSE || 
                             variation === GameVariation.REVERSE_COMBINATION) 
                             ? [...pattern].reverse() 
                             : pattern;
        
        inputPattern.forEach(gem => {
          const result = game.handlePlayerInput(gem);
          expect(result).toBe(true);
        });
        
        expect(game.getState()).toBe(GameState.ROUND_COMPLETE);
        
        if (round < 5) {
          game.startGame(); // Continue to next round
        }
      }
      
      // Check final balance
      const finalBalance = ticketManager.getBalance();
      const totalEarned = ticketManager.getTotalEarned();
      
      // Round 1: 2.50 * 0.01 = 0.03
      // Round 2: 2.50 * 0.10 * 1.15 (reverse) = 0.29
      // Round 3: 2.50 * 0.20 * 1.15 (reverse) = 0.58
      // Round 4: 2.50 * 0.35 * 1.15 (reverse) = 1.01
      // Round 5: 2.50 * 0.50 * variation = 1.25 or 1.44
      // Total: ~3.16 to 3.35
      
      expect(totalEarned).toBeGreaterThan(3.00);
      expect(totalEarned).toBeLessThan(4.00);
      expect(finalBalance).toBe(startBalance - 10 + totalEarned);
    });

    it('should prevent starting game with insufficient funds', () => {
      // Set balance to less than game cost
      ticketManager['balance'] = 5.00;
      
      const canStart = game.startGameWithTickets();
      expect(canStart).toBe(false);
      expect(game.getState()).toBe(GameState.INITIALIZATION);
      expect(ticketManager.getBalance()).toBe(5.00); // Balance unchanged
    });

    it('should track multiple game sessions correctly', () => {
      const sessions = 3;
      let totalSpent = 0;
      let totalEarnedAcrossSessions = 0;
      
      for (let session = 0; session < sessions; session++) {
        // Start new game
        game.resetGame();
        const started = game.startGameWithTickets();
        expect(started).toBe(true);
        totalSpent += 10;
        
        // Play one round and fail
        if (game.getState() === GameState.CALIBRATION) {
          game.startPatternDisplay();
        }
        game.startPlayerInput();
        
        // Simulate wrong input
        const pattern = game.getPattern();
        const wrongGem = pattern[0] === 'EMERALD' ? 'TRILLION' : 'EMERALD';
        game.handlePlayerInput(wrongGem as any);
        
        expect(game.getState()).toBe(GameState.ROUND_FAILED);
      }
      
      expect(ticketManager.getGamesPlayed()).toBe(sessions);
      expect(ticketManager.getTotalSpent()).toBe(totalSpent);
      expect(ticketManager.getHighestRound()).toBe(1);
    });
  });

  describe('Reward Calculation Scenarios', () => {
    it('should calculate correct rewards for each variation', () => {
      const testCases = [
        { round: 5, variation: GameVariation.NONE, expected: 1.25 },
        { round: 5, variation: GameVariation.REVERSE, expected: 1.44 },
        { round: 5, variation: GameVariation.GHOST, expected: 1.44 },
        { round: 5, variation: GameVariation.SPEED_CHAOS, expected: 1.50 },
        { round: 5, variation: GameVariation.COLOR_SHUFFLE, expected: 1.44 },
        { round: 5, variation: GameVariation.SELECTIVE_ATTENTION, expected: 1.50 },
        { round: 17, variation: GameVariation.REVERSE_COMBINATION, expected: 16.88 }
      ];
      
      testCases.forEach(({ round, variation, expected }) => {
        const reward = ticketManager.calculateReward(round, variation);
        expect(reward).toBe(expected);
      });
    });

    it('should apply difficulty multipliers correctly', () => {
      // Test easy mode
      ticketManager.setDifficulty('easy');
      let reward = ticketManager.calculateReward(10, GameVariation.NONE);
      expect(reward).toBe(2.13); // 2.50 * 1.70 * 1.00 * 0.50
      
      // Test hard mode
      ticketManager.setDifficulty('hard');
      reward = ticketManager.calculateReward(10, GameVariation.NONE);
      expect(reward).toBe(8.50); // 2.50 * 1.70 * 1.00 * 2.00
      
      // Test normal mode
      ticketManager.setDifficulty('normal');
      reward = ticketManager.calculateReward(10, GameVariation.NONE);
      expect(reward).toBe(4.25); // 2.50 * 1.70 * 1.00 * 1.00
    });

    it('should respect maximum payout limit', () => {
      // Try to calculate reward for round 50 with max variation
      const reward = ticketManager.calculateReward(50, GameVariation.REVERSE_COMBINATION);
      expect(reward).toBeLessThanOrEqual(200.00);
      // Round 50: 8.00 + (50 - 20) * 1.0 = 38.00
      // 2.50 * 38.00 * 1.35 = 128.25 (under the 200 cap)
      expect(reward).toBe(128.25);
    });

    it('should calculate rewards for rounds beyond array length', () => {
      // Round 25: 8.00 + (25 - 20) * 1.0 = 13.00
      const reward = ticketManager.calculateReward(25, GameVariation.NONE);
      expect(reward).toBe(32.50); // 2.50 * 13.00 * 1.00 * 1.00
      
      // Round 30: 8.00 + (30 - 20) * 1.0 = 18.00
      const reward30 = ticketManager.calculateReward(30, GameVariation.NONE);
      expect(reward30).toBe(45.00); // 2.50 * 18.00 * 1.00 * 1.00
    });
  });

  describe('Return to Player (RTP) Tracking', () => {
    it('should calculate RTP correctly over multiple games', () => {
      let gamesPlayed = 0;
      let roundsReached = [3, 5, 2, 7, 4]; // Simulated round achievements
      
      roundsReached.forEach(targetRound => {
        game.resetGame();
        game.startGameWithTickets();
        gamesPlayed++;
        
        // Play to target round
        for (let round = 1; round <= targetRound; round++) {
          if (game.getState() === GameState.CALIBRATION || 
              game.getState() === GameState.VARIATION_INTRO) {
            game.startPatternDisplay();
          }
          
          game.startPlayerInput();
          
          const pattern = game.getPattern();
          const variation = game.getCurrentVariation();
          const inputPattern = (variation === GameVariation.REVERSE || 
                               variation === GameVariation.REVERSE_COMBINATION) 
                               ? [...pattern].reverse() 
                               : pattern;
          
          if (round < targetRound) {
            // Succeed this round
            inputPattern.forEach(gem => game.handlePlayerInput(gem));
            if (round < targetRound) {
              game.startGame(); // Continue
            }
          } else {
            // Fail on target round
            const wrongGem = pattern[0] === 'EMERALD' ? 'TRILLION' : 'EMERALD';
            game.handlePlayerInput(wrongGem as any);
          }
        }
      });
      
      const rtp = ticketManager.getRTP();
      const totalSpent = ticketManager.getTotalSpent();
      const totalEarned = ticketManager.getTotalEarned();
      
      expect(totalSpent).toBe(50.00); // 5 games * 10 tickets
      expect(rtp).toBe(totalEarned / totalSpent);
      expect(rtp).toBeGreaterThan(0); // Should have earned something
      expect(rtp).toBeLessThan(1.5); // Reasonable RTP range
    });

    it('should handle RTP with no games played', () => {
      const rtp = ticketManager.getRTP();
      expect(rtp).toBe(0);
    });

    it('should track highest round correctly', () => {
      const rounds = [3, 7, 5, 10, 2];
      
      rounds.forEach(round => {
        ticketManager.updateHighestRound(round);
      });
      
      expect(ticketManager.getHighestRound()).toBe(10);
    });
  });

  describe('Balance Management Edge Cases', () => {
    it('should respect maximum balance limit', () => {
      ticketManager.addReward(10000.00);
      expect(ticketManager.getBalance()).toBe(9999.99);
    });

    it('should handle consecutive games until funds depleted', () => {
      // Start with limited balance
      ticketManager['balance'] = 25.00;
      let gamesPlayed = 0;
      
      while (ticketManager.canAffordGame()) {
        const started = game.startGameWithTickets();
        if (started) {
          gamesPlayed++;
          // Immediately fail to not earn rewards
          game.startPatternDisplay();
          game.startPlayerInput();
          game.handlePlayerInput('WRONG' as any);
        }
        game.resetGame();
      }
      
      expect(gamesPlayed).toBe(2); // 25 / 10 = 2 complete games
      expect(ticketManager.getBalance()).toBe(5.00); // Remaining balance
      expect(ticketManager.canAffordGame()).toBe(false);
    });

    it('should maintain precision in calculations', () => {
      // Test that all calculations respect ticket_precision
      const testAmounts = [1.234, 5.678, 10.999, 0.001];
      
      testAmounts.forEach(amount => {
        ticketManager['balance'] = 100.00;
        ticketManager.addReward(amount);
        const balance = ticketManager.getBalance();
        const formatted = ticketManager.getFormattedBalance();
        
        // Check that formatted balance always shows 2 decimal places
        expect(formatted).toMatch(/^\d+\.\d{2}$/);
        
        // Balance might have more precision internally, but formatted should be correct
        const parsedFormatted = parseFloat(formatted);
        expect(parsedFormatted).toBeCloseTo(100.00 + amount, 2);
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all statistics and balance', () => {
      // Play some games
      game.startGameWithTickets();
      game.startPatternDisplay();
      game.startPlayerInput();
      
      const pattern = game.getPattern();
      pattern.forEach(gem => game.handlePlayerInput(gem));
      
      ticketManager.updateHighestRound(5);
      
      // Reset
      ticketManager.reset();
      
      expect(ticketManager.getBalance()).toBe(100.00);
      expect(ticketManager.getTotalEarned()).toBe(0);
      expect(ticketManager.getTotalSpent()).toBe(0);
      expect(ticketManager.getGamesPlayed()).toBe(0);
      expect(ticketManager.getHighestRound()).toBe(0);
    });

    it('should allow playing after reset', () => {
      // Deplete funds
      ticketManager['balance'] = 5.00;
      expect(ticketManager.canAffordGame()).toBe(false);
      
      // Reset
      ticketManager.reset();
      
      // Should be able to play again
      expect(ticketManager.canAffordGame()).toBe(true);
      const started = game.startGameWithTickets();
      expect(started).toBe(true);
    });
  });

  describe('Feedback Levels', () => {
    it('should categorize rewards correctly', () => {
      const testCases = [
        { amount: 0.50, expected: 'small' },
        { amount: 0.99, expected: 'small' },
        { amount: 1.00, expected: 'small' },
        { amount: 4.99, expected: 'small' },
        { amount: 5.00, expected: 'medium' },
        { amount: 9.99, expected: 'medium' },
        { amount: 10.00, expected: 'large' },
        { amount: 19.99, expected: 'large' },
        { amount: 20.00, expected: 'mega' },
        { amount: 100.00, expected: 'mega' },
        { amount: 200.00, expected: 'mega' }
      ];
      
      testCases.forEach(({ amount, expected }) => {
        const level = ticketManager.getRewardFeedbackLevel(amount);
        expect(level).toBe(expected);
      });
    });
  });

  describe('Progressive Difficulty Economics', () => {
    it('should show increasing rewards as rounds progress', () => {
      const rounds = [1, 5, 10, 15, 20];
      const rewards: number[] = [];
      
      rounds.forEach(round => {
        const reward = ticketManager.calculateReward(round, GameVariation.NONE);
        rewards.push(reward);
      });
      
      // Each subsequent reward should be higher
      for (let i = 1; i < rewards.length; i++) {
        expect(rewards[i]).toBeGreaterThan(rewards[i - 1]);
      }
      
      // Verify specific values
      expect(rewards[0]).toBe(0.03); // Round 1
      expect(rewards[1]).toBe(1.25); // Round 5
      expect(rewards[2]).toBe(4.25); // Round 10
      expect(rewards[3]).toBe(9.25); // Round 15
      expect(rewards[4]).toBe(20.00); // Round 20
    });

    it('should make later rounds more valuable than early rounds', () => {
      // Calculate total rewards for playing rounds 1-5 vs 16-20
      let earlyRewards = 0;
      let lateRewards = 0;
      
      for (let round = 1; round <= 5; round++) {
        earlyRewards += ticketManager.calculateReward(round, GameVariation.NONE);
      }
      
      for (let round = 16; round <= 20; round++) {
        lateRewards += ticketManager.calculateReward(round, GameVariation.NONE);
      }
      
      expect(lateRewards).toBeGreaterThan(earlyRewards * 5); // Late game much more valuable
    });
  });

  describe('Game-TicketManager Integration', () => {
    it('should properly integrate reward calculation with game progression', () => {
      // Start game
      game.startGameWithTickets();
      const initialBalance = ticketManager.getBalance();
      
      // Complete round 1
      if (game.getState() === GameState.CALIBRATION) {
        game.startPatternDisplay();
      }
      game.startPlayerInput();
      
      const pattern = game.getPattern();
      pattern.forEach(gem => game.handlePlayerInput(gem));
      
      expect(game.getState()).toBe(GameState.ROUND_COMPLETE);
      
      // Check that reward was added
      const newBalance = ticketManager.getBalance();
      const reward = game.getLastReward();
      
      expect(reward).toBe(0.03); // Round 1 tutorial reward
      expect(newBalance).toBe(initialBalance + reward);
    });

    it('should handle game without ticket manager gracefully', () => {
      const standaloneGame = new GameEngine();
      
      // Should be able to start without tickets
      expect(standaloneGame.canStartGame()).toBe(true);
      standaloneGame.startGame();
      expect(standaloneGame.getState()).toBe(GameState.CALIBRATION);
      
      // Should use fallback scoring
      standaloneGame.startPatternDisplay();
      standaloneGame.startPlayerInput();
      
      const pattern = standaloneGame.getPattern();
      pattern.forEach(gem => standaloneGame.handlePlayerInput(gem));
      
      expect(standaloneGame.getScore()).toBeGreaterThan(0);
      expect(standaloneGame.getLastReward()).toBe(0); // No ticket reward
    });
  });
});