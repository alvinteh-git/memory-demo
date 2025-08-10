import { GameVariation } from '../game/types';
import type { TicketConfig } from '../../utils/yaml-loader';

export class TicketManager {
  private config: TicketConfig;
  private balance: number;
  private totalEarned: number = 0;
  private totalSpent: number = 0;
  private gamesPlayed: number = 0;
  private highestRound: number = 0;
  private currentDifficulty: string;

  constructor(config: TicketConfig) {
    this.config = config;
    this.balance = config.demo.starting_balance;
    this.currentDifficulty = config.default_difficulty;
  }

  // Balance Management
  public getBalance(): number {
    return this.balance;
  }

  public getFormattedBalance(): string {
    return this.balance.toFixed(this.config.game.ticket_precision);
  }

  public getGameCost(): number {
    return this.config.game.cost_to_play;
  }

  public canAffordGame(): boolean {
    return this.balance >= this.config.game.cost_to_play;
  }

  public deductGameCost(): boolean {
    if (!this.canAffordGame()) {
      return false;
    }
    
    this.balance -= this.config.game.cost_to_play;
    this.totalSpent += this.config.game.cost_to_play;
    this.gamesPlayed++;
    return true;
  }

  public addReward(amount: number): void {
    const newBalance = this.balance + amount;
    this.balance = Math.min(newBalance, this.config.limits.max_balance);
    this.totalEarned += amount;
  }

  // Reward Calculation
  public calculateReward(round: number, variation: GameVariation): number {
    const baseReward = this.config.base_reward;
    const roundMultiplier = this.getRoundMultiplier(round);
    const variationBonus = this.getVariationBonus(variation);
    const difficultyMultiplier = this.getDifficultyMultiplier();
    
    let reward = baseReward * roundMultiplier * variationBonus * difficultyMultiplier;
    
    // Apply max payout limit
    reward = Math.min(reward, this.config.limits.max_single_payout);
    
    // Round to ticket precision
    return this.roundToTicketPrecision(reward);
  }

  private getRoundMultiplier(round: number): number {
    const multipliers = this.config.round_multipliers;
    
    if (round <= 0) return 0;
    if (round <= multipliers.length) {
      return multipliers[round - 1];
    }
    
    // For rounds beyond the array, use formula: 8.00 + (round - 20) * 1.0
    return 8.00 + (round - 20) * 1.0;
  }

  private getVariationBonus(variation: GameVariation): number {
    const bonusMap: Record<GameVariation, keyof typeof this.config.variation_bonuses> = {
      [GameVariation.NONE]: 'none',
      [GameVariation.REVERSE]: 'reverse',
      [GameVariation.GHOST]: 'ghost',
      [GameVariation.SPEED_CHAOS]: 'speed_chaos',
      [GameVariation.COLOR_SHUFFLE]: 'color_shuffle',
      [GameVariation.SELECTIVE_ATTENTION]: 'selective',
      [GameVariation.REVERSE_COMBINATION]: 'reverse_combo'
    };
    
    const bonusKey = bonusMap[variation];
    return this.config.variation_bonuses[bonusKey] || 1.00;
  }

  private getDifficultyMultiplier(): number {
    const difficulty = this.config.difficulty_settings[this.currentDifficulty];
    return difficulty ? difficulty.reward_multiplier : 1.00;
  }

  private roundToTicketPrecision(value: number): number {
    const precision = this.config.game.ticket_precision;
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
  }

  public getNextRoundReward(currentRound: number, variation: GameVariation): number {
    return this.calculateReward(currentRound + 1, variation);
  }

  // Difficulty Management
  public getCurrentDifficulty(): string {
    return this.currentDifficulty;
  }

  public setDifficulty(difficulty: string): void {
    if (this.config.difficulty_settings[difficulty]) {
      this.currentDifficulty = difficulty;
    }
  }

  public getDifficultySettings() {
    return this.config.difficulty_settings[this.currentDifficulty];
  }

  // Statistics
  public getTotalEarned(): number {
    return this.totalEarned;
  }

  public getTotalSpent(): number {
    return this.totalSpent;
  }

  public getGamesPlayed(): number {
    return this.gamesPlayed;
  }

  public getHighestRound(): number {
    return this.highestRound;
  }

  public updateHighestRound(round: number): void {
    if (round > this.highestRound) {
      this.highestRound = round;
    }
  }

  public getRTP(): number {
    if (this.totalSpent === 0) return 0;
    return this.totalEarned / this.totalSpent;
  }

  // Reset
  public reset(): void {
    this.balance = this.config.demo.starting_balance;
    this.totalEarned = 0;
    this.totalSpent = 0;
    this.gamesPlayed = 0;
    this.highestRound = 0;
  }

  // Reward Feedback
  public getRewardFeedbackLevel(amount: number): 'small' | 'medium' | 'large' | 'mega' {
    const thresholds = this.config.feedback_thresholds;
    
    if (amount >= thresholds.mega) return 'mega';
    if (amount >= thresholds.large) return 'large';
    if (amount >= thresholds.medium) return 'medium';
    return 'small';
  }

  // Configuration Access
  public getConfig(): TicketConfig {
    return this.config;
  }
}