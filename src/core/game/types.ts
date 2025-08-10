export enum GameState {
  INITIALIZATION = 'INITIALIZATION',
  CALIBRATION = 'CALIBRATION',
  VARIATION_INTRO = 'VARIATION_INTRO',
  PATTERN_DISPLAY = 'PATTERN_DISPLAY',
  PLAYER_INPUT = 'PLAYER_INPUT',
  ROUND_COMPLETE = 'ROUND_COMPLETE',
  ROUND_FAILED = 'ROUND_FAILED'
}

export enum GemstoneType {
  EMERALD = 'EMERALD',
  TRILLION = 'TRILLION',
  MARQUISE = 'MARQUISE',
  CUSHION = 'CUSHION'
}

export enum GameVariation {
  NONE = 'NONE',
  REVERSE = 'REVERSE',
  GHOST = 'GHOST',
  SPEED_CHAOS = 'SPEED_CHAOS',
  COLOR_SHUFFLE = 'COLOR_SHUFFLE',
  SELECTIVE_ATTENTION = 'SELECTIVE_ATTENTION',
  REVERSE_COMBINATION = 'REVERSE_COMBINATION'
}

export interface GameConfig {
  initialPatternLength: number;
  initialTimerSeconds: number;
  initialDisplaySpeed: number;
  minTimerSeconds: number;
  minDisplaySpeed: number;
  timerDecreasePerRound: number;
  speedDecreasePerRound: number;
  lengthIncreaseInterval: number;
}

export interface GemstoneConfig {
  type: GemstoneType;
  color: string;
  inactiveColor: string;
  position: { x: number; y: number };
  sound: number;
}