import { describe, it, expect, beforeEach } from 'vitest';
import { TicketManager } from '@/core/economy/TicketManager';
import { GameVariation } from '@/core/game/types';
import type { TicketConfig } from '@/utils/yaml-loader';

// Mock configuration for testing
const mockConfig: TicketConfig = {
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
  }
};

describe('TicketManager', () => {
  let ticketManager: TicketManager;

  beforeEach(() => {
    ticketManager = new TicketManager(mockConfig);
  });

  describe('Initialization', () => {
    it('should initialize with starting balance from config', () => {
      expect(ticketManager.getBalance()).toBe(100.00);
    });

    it('should set game cost from config', () => {
      expect(ticketManager.getGameCost()).toBe(10.00);
    });

    it('should track total earned starting at 0', () => {
      expect(ticketManager.getTotalEarned()).toBe(0);
    });

    it('should track total spent starting at 0', () => {
      expect(ticketManager.getTotalSpent()).toBe(0);
    });

    it('should set difficulty to default from config', () => {
      expect(ticketManager.getCurrentDifficulty()).toBe('normal');
    });
  });

  describe('Balance Management', () => {
    it('should check if player can afford game', () => {
      expect(ticketManager.canAffordGame()).toBe(true);
      
      // Set balance to less than game cost
      ticketManager = new TicketManager(mockConfig);
      ticketManager['balance'] = 5.00;
      expect(ticketManager.canAffordGame()).toBe(false);
    });

    it('should deduct game cost from balance', () => {
      const initialBalance = ticketManager.getBalance();
      ticketManager.deductGameCost();
      expect(ticketManager.getBalance()).toBe(initialBalance - 10.00);
      expect(ticketManager.getTotalSpent()).toBe(10.00);
    });

    it('should not deduct if insufficient balance', () => {
      ticketManager['balance'] = 5.00;
      const result = ticketManager.deductGameCost();
      expect(result).toBe(false);
      expect(ticketManager.getBalance()).toBe(5.00);
    });

    it('should add rewards to balance', () => {
      ticketManager.addReward(25.50);
      expect(ticketManager.getBalance()).toBe(125.50);
      expect(ticketManager.getTotalEarned()).toBe(25.50);
    });

    it('should respect max balance limit', () => {
      ticketManager.addReward(10000.00);
      expect(ticketManager.getBalance()).toBe(9999.99);
    });

    it('should format balance with correct precision', () => {
      ticketManager['balance'] = 123.456;
      expect(ticketManager.getFormattedBalance()).toBe('123.46');
    });
  });

  describe('Reward Calculation', () => {
    it('should calculate round 1 reward (tutorial)', () => {
      const reward = ticketManager.calculateReward(1, GameVariation.NONE);
      // base_reward * round_multiplier * variation_bonus * difficulty_multiplier
      // 2.50 * 0.01 * 1.00 * 1.00 = 0.025, rounded to 0.03
      expect(reward).toBe(0.03);
    });

    it('should calculate round 5 reward with no variation', () => {
      const reward = ticketManager.calculateReward(5, GameVariation.NONE);
      // 2.50 * 0.50 * 1.00 * 1.00 = 1.25
      expect(reward).toBe(1.25);
    });

    it('should apply variation bonus', () => {
      const reward = ticketManager.calculateReward(5, GameVariation.REVERSE);
      // 2.50 * 0.50 * 1.15 * 1.00 = 1.4375, rounded to 1.44
      expect(reward).toBe(1.44);
    });

    it('should apply combination variation bonus', () => {
      const reward = ticketManager.calculateReward(17, GameVariation.REVERSE_COMBINATION);
      // 2.50 * 5.00 * 1.35 * 1.00 = 16.875, rounded to 16.88
      expect(reward).toBe(16.88);
    });

    it('should calculate rewards for rounds beyond array length', () => {
      const reward = ticketManager.calculateReward(25, GameVariation.NONE);
      // For round 25: 8.00 + (25 - 20) * 1.0 = 13.00
      // 2.50 * 13.00 * 1.00 * 1.00 = 32.50
      expect(reward).toBe(32.50);
    });

    it('should apply difficulty multiplier', () => {
      // Add hard difficulty to config
      mockConfig.difficulty_settings.hard = {
        name: "Hard",
        reward_multiplier: 2.00,
        pattern_display_time_multiplier: 0.50,
        response_time_multiplier: 0.50,
        description: "Less time, more tickets"
      };
      ticketManager = new TicketManager(mockConfig);
      ticketManager.setDifficulty('hard');
      
      const reward = ticketManager.calculateReward(5, GameVariation.NONE);
      // 2.50 * 0.50 * 1.00 * 2.00 = 2.50
      expect(reward).toBe(2.50);
    });

    it('should respect max single payout limit', () => {
      const reward = ticketManager.calculateReward(50, GameVariation.REVERSE_COMBINATION);
      expect(reward).toBeLessThanOrEqual(200.00);
    });

    it('should round to ticket precision', () => {
      const reward = ticketManager.calculateReward(3, GameVariation.NONE);
      // 2.50 * 0.20 * 1.00 * 1.00 = 0.50
      expect(reward).toBe(0.50);
      expect(reward.toFixed(2)).toBe('0.50');
    });
  });

  describe('Next Reward Preview', () => {
    it('should calculate next round reward', () => {
      const nextReward = ticketManager.getNextRoundReward(5, GameVariation.GHOST);
      // For round 6: 2.50 * 0.70 * 1.15 * 1.00 = 2.0125, rounded to 2.01
      expect(nextReward).toBe(2.01);
    });

    it('should show reward for current variation', () => {
      const currentReward = ticketManager.calculateReward(10, GameVariation.SPEED_CHAOS);
      // 2.50 * 1.70 * 1.20 * 1.00 = 5.10
      expect(currentReward).toBe(5.10);
    });
  });

  describe('Difficulty Settings', () => {
    it('should change difficulty', () => {
      // Add easy difficulty to config first
      mockConfig.difficulty_settings.easy = {
        name: "Easy",
        reward_multiplier: 0.50,
        pattern_display_time_multiplier: 1.50,
        response_time_multiplier: 1.50,
        description: "More time, fewer tickets"
      };
      ticketManager = new TicketManager(mockConfig);
      
      ticketManager.setDifficulty('easy');
      expect(ticketManager.getCurrentDifficulty()).toBe('easy');
    });

    it('should apply easy difficulty multiplier', () => {
      // Add easy difficulty to mock config
      mockConfig.difficulty_settings.easy = {
        name: "Easy",
        reward_multiplier: 0.50,
        pattern_display_time_multiplier: 1.50,
        response_time_multiplier: 1.50,
        description: "More time, fewer tickets"
      };
      
      ticketManager = new TicketManager(mockConfig);
      ticketManager.setDifficulty('easy');
      
      const reward = ticketManager.calculateReward(5, GameVariation.NONE);
      // 2.50 * 0.50 * 1.00 * 0.50 = 0.625, rounded to 0.63
      expect(reward).toBe(0.63);
    });

    it('should apply hard difficulty multiplier', () => {
      // Add hard difficulty to mock config
      mockConfig.difficulty_settings.hard = {
        name: "Hard",
        reward_multiplier: 2.00,
        pattern_display_time_multiplier: 0.50,
        response_time_multiplier: 0.50,
        description: "Less time, more tickets"
      };
      
      ticketManager = new TicketManager(mockConfig);
      ticketManager.setDifficulty('hard');
      
      const reward = ticketManager.calculateReward(5, GameVariation.NONE);
      // 2.50 * 0.50 * 1.00 * 2.00 = 2.50
      expect(reward).toBe(2.50);
    });
  });

  describe('Statistics Tracking', () => {
    it('should track games played', () => {
      expect(ticketManager.getGamesPlayed()).toBe(0);
      ticketManager.deductGameCost();
      expect(ticketManager.getGamesPlayed()).toBe(1);
    });

    it('should track highest round reached', () => {
      expect(ticketManager.getHighestRound()).toBe(0);
      ticketManager.updateHighestRound(5);
      expect(ticketManager.getHighestRound()).toBe(5);
      ticketManager.updateHighestRound(3);
      expect(ticketManager.getHighestRound()).toBe(5);
    });

    it('should calculate Return to Player (RTP)', () => {
      ticketManager.deductGameCost(); // Spend 10
      ticketManager.addReward(9.00);   // Earn 9
      expect(ticketManager.getRTP()).toBe(0.90); // 90% RTP
    });

    it('should handle RTP with no games played', () => {
      expect(ticketManager.getRTP()).toBe(0);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset balance to starting amount', () => {
      ticketManager.deductGameCost();
      ticketManager.addReward(50.00);
      ticketManager.reset();
      expect(ticketManager.getBalance()).toBe(100.00);
    });

    it('should reset statistics', () => {
      ticketManager.deductGameCost();
      ticketManager.addReward(50.00);
      ticketManager.updateHighestRound(10);
      ticketManager.reset();
      
      expect(ticketManager.getTotalEarned()).toBe(0);
      expect(ticketManager.getTotalSpent()).toBe(0);
      expect(ticketManager.getGamesPlayed()).toBe(0);
      expect(ticketManager.getHighestRound()).toBe(0);
    });
  });

  describe('Reward Feedback', () => {
    it('should determine feedback level for rewards', () => {
      expect(ticketManager.getRewardFeedbackLevel(0.50)).toBe('small');
      expect(ticketManager.getRewardFeedbackLevel(5.00)).toBe('medium');
      expect(ticketManager.getRewardFeedbackLevel(10.00)).toBe('large');
      expect(ticketManager.getRewardFeedbackLevel(20.00)).toBe('mega');
    });
  });
});