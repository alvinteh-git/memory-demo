import { GameState, GemstoneType, GameVariation } from './types';
import { GAME_CONFIG } from './constants';
import { TicketManager } from '../economy/TicketManager';
import { VariationManager } from '../variations/VariationManager';

export class GameEngine {
  private state: GameState = GameState.INITIALIZATION;
  private round: number = 1;
  private pattern: GemstoneType[] = [];
  private playerInput: GemstoneType[] = [];
  private currentVariation: GameVariation = GameVariation.NONE;
  private previousVariation: GameVariation | null = null;
  private currentCombinationBase: GameVariation | null = null;
  private variationStartRound: number = 0;
  private timerSeconds: number = GAME_CONFIG.initialTimerSeconds;
  private displaySpeed: number = GAME_CONFIG.initialDisplaySpeed;
  private score: number = 0;
  private ticketManager: TicketManager | null = null;
  private lastReward: number = 0;
  private variationManager: VariationManager;

  constructor(ticketManager?: TicketManager) {
    this.ticketManager = ticketManager || null;
    this.variationManager = new VariationManager();
    this.initialize();
  }

  private initialize(): void {
    this.state = GameState.INITIALIZATION;
    this.round = 1;
    this.pattern = [];
    this.playerInput = [];
    this.score = 0;
    this.currentVariation = GameVariation.NONE;
    this.previousVariation = null;
    this.currentCombinationBase = null;
    this.variationStartRound = 0;
    this.updateDisplaySpeed(); // Initialize speed for round 1
  }

  private updateDisplaySpeed(): void {
    if (this.round === 1) {
      this.displaySpeed = 1000; // Special calibration speed
      return;
    }
    
    const decrease = this.round * GAME_CONFIG.speedDecreasePerRound;
    this.displaySpeed = Math.max(
      GAME_CONFIG.minDisplaySpeed,
      GAME_CONFIG.initialDisplaySpeed - decrease
    );
  }

  public startGame(): void {
    if (this.round === 1) {
      this.state = GameState.CALIBRATION;
      this.generateCalibrationPattern();
    } else {
      this.checkForNewVariation();
      this.generatePattern();
      // Only set to PATTERN_DISPLAY if not already in VARIATION_INTRO
      if (this.state !== GameState.VARIATION_INTRO) {
        this.state = GameState.PATTERN_DISPLAY;
      }
    }
  }

  private generateCalibrationPattern(): void {
    // Round 1: Show all 4 gemstones in random order
    const allGems = [
      GemstoneType.EMERALD,
      GemstoneType.TRILLION,
      GemstoneType.MARQUISE,
      GemstoneType.CUSHION
    ];
    
    // Fisher-Yates shuffle for random order
    for (let i = allGems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allGems[i], allGems[j]] = [allGems[j], allGems[i]];
    }
    
    this.pattern = allGems;
  }

  private generatePattern(): void {
    const patternLength = this.getPatternLength();
    this.pattern = [];
    const gemTypes = Object.values(GemstoneType);
    
    for (let i = 0; i < patternLength; i++) {
      const randomIndex = Math.floor(Math.random() * gemTypes.length);
      this.pattern.push(gemTypes[randomIndex]);
    }
  }

  private getPatternLength(): number {
    if (this.round === 1) {
      return 4; // Calibration round always has 4 gems
    }
    
    const baseLength = GAME_CONFIG.initialPatternLength;
    const additionalLength = Math.floor((this.round - 1) / GAME_CONFIG.lengthIncreaseInterval);
    return baseLength + additionalLength;
  }

  private checkForNewVariation(): void {
    // Use VariationManager to handle variation selection
    const newVariation = this.variationManager.selectVariation(this.round);
    
    // Check if a new variation was selected (happens every 3 rounds)
    if (newVariation !== null && newVariation !== this.currentVariation) {
      this.currentVariation = newVariation;
      this.currentCombinationBase = this.variationManager.getCombinationBase();
      this.variationStartRound = this.round;
      
      // Show variation intro if it's a new variation and not shown before
      if (!this.variationManager.hasShownTutorial(newVariation)) {
        this.state = GameState.VARIATION_INTRO;
        this.variationManager.markTutorialShown(newVariation);
      }
    } else if (newVariation !== null) {
      // Keep the same variation
      this.currentVariation = newVariation;
      this.currentCombinationBase = this.variationManager.getCombinationBase();
    }
  }

  private getAvailableVariations(): GameVariation[] {
    return this.variationManager.getAvailableVariations(this.round);
  }

  public startPatternDisplay(): void {
    this.state = GameState.PATTERN_DISPLAY;
    this.playerInput = [];
  }

  public startPlayerInput(): void {
    this.state = GameState.PLAYER_INPUT;
    // Clear any previous input to ensure clean state
    this.playerInput = [];
    this.updateTimerForRound();
  }

  private updateTimerForRound(): void {
    if (this.round === 1) {
      this.timerSeconds = 10; // Special calibration timer
      return;
    }
    
    const decrease = this.round * GAME_CONFIG.timerDecreasePerRound;
    this.timerSeconds = Math.max(
      GAME_CONFIG.minTimerSeconds,
      GAME_CONFIG.initialTimerSeconds - decrease
    );
  }

  public handlePlayerInput(gemstone: GemstoneType): boolean {
    if (this.state !== GameState.PLAYER_INPUT) return false;

    // First check what the expected gem should be BEFORE adding to array
    const currentIndex = this.playerInput.length;
    let expectedGem = this.pattern[currentIndex];

    // Apply variation rules
    if (this.currentVariation === GameVariation.REVERSE || 
        this.currentVariation === GameVariation.REVERSE_COMBINATION) {
      expectedGem = this.pattern[this.pattern.length - 1 - currentIndex];
    }

    // Check if the input would be correct BEFORE adding it
    if (gemstone !== expectedGem) {
      this.failRound();
      return false;
    }

    // Only add to playerInput if it's correct
    this.playerInput.push(gemstone);

    // Check if pattern is complete
    if (this.playerInput.length === this.pattern.length) {
      this.completeRound();
      return true;
    }

    return true;
  }

  private completeRound(): void {
    this.state = GameState.ROUND_COMPLETE;
    
    // Calculate and award tickets if TicketManager is available
    if (this.ticketManager) {
      this.lastReward = this.ticketManager.calculateReward(this.round, this.currentVariation);
      this.ticketManager.addReward(this.lastReward);
      this.ticketManager.updateHighestRound(this.round);
      this.score += Math.round(this.lastReward * 100); // Convert tickets to score points
    } else {
      // Fallback to simple scoring
      this.score += this.calculateRoundScore();
    }
    
    this.round++;
    this.updateDisplaySpeed(); // Update speed for the new round
  }

  private failRound(): void {
    this.state = GameState.ROUND_FAILED;
    if (this.ticketManager) {
      this.ticketManager.updateHighestRound(this.round);
    }
  }

  private calculateRoundScore(): number {
    // Simple scoring for when ticket system is not available
    let baseScore = 100 * this.round;
    
    // Variation bonuses
    if (this.currentVariation !== GameVariation.NONE) {
      baseScore = Math.round(baseScore * 1.15);
    }
    
    return baseScore;
  }

  public resetGame(): void {
    this.initialize();
    this.lastReward = 0;
    this.variationManager.reset();
  }

  public setTicketManager(ticketManager: TicketManager): void {
    this.ticketManager = ticketManager;
  }

  public getTicketManager(): TicketManager | null {
    return this.ticketManager;
  }

  public getLastReward(): number {
    return this.lastReward;
  }

  public canStartGame(): boolean {
    if (!this.ticketManager) return true; // No ticket system, always can play
    return this.ticketManager.canAffordGame();
  }

  public startGameWithTickets(): boolean {
    if (!this.ticketManager) {
      this.startGame();
      return true;
    }
    
    if (this.ticketManager.deductGameCost()) {
      this.startGame();
      return true;
    }
    
    return false; // Insufficient funds
  }

  public continueToNextRound(): void {
    // This method is used to continue to the next round without charging tickets
    this.startGame();
  }

  // Getters
  public getState(): GameState {
    return this.state;
  }

  public getRound(): number {
    return this.round;
  }

  public getPattern(): GemstoneType[] {
    return [...this.pattern];
  }

  public getPlayerInput(): GemstoneType[] {
    return [...this.playerInput];
  }

  public getCurrentVariation(): GameVariation {
    return this.currentVariation;
  }

  public getCurrentCombinationBase(): GameVariation | null {
    return this.currentCombinationBase;
  }

  public getTimerSeconds(): number {
    return this.timerSeconds;
  }

  public getDisplaySpeed(): number {
    return this.displaySpeed;
  }

  public getScore(): number {
    return this.score;
  }

  public getVariationManager(): VariationManager {
    return this.variationManager;
  }
}