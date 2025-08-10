import type { GameConfig, GemstoneConfig } from './types';
import { GemstoneType } from './types';

export const GAME_CONFIG: GameConfig = {
  initialPatternLength: 4,
  initialTimerSeconds: 8,
  initialDisplaySpeed: 750,
  minTimerSeconds: 3,
  minDisplaySpeed: 300,
  timerDecreasePerRound: 0.25,
  speedDecreasePerRound: 25,
  lengthIncreaseInterval: 3
};

export const GEMSTONES: Record<GemstoneType, GemstoneConfig> = {
  [GemstoneType.EMERALD]: {
    type: GemstoneType.EMERALD,
    color: '#0CF574',
    inactiveColor: '#808080',
    position: { x: 0, y: -140 }, // Top - adjusted for visual balance
    sound: 300
  },
  [GemstoneType.TRILLION]: {
    type: GemstoneType.TRILLION,
    color: '#DB5461',
    inactiveColor: '#808080',
    position: { x: 140, y: 0 }, // Right - adjusted for visual balance
    sound: 500
  },
  [GemstoneType.MARQUISE]: {
    type: GemstoneType.MARQUISE,
    color: '#6461A0',
    inactiveColor: '#808080',
    position: { x: 0, y: 140 }, // Bottom - adjusted for visual balance
    sound: 700
  },
  [GemstoneType.CUSHION]: {
    type: GemstoneType.CUSHION,
    color: '#1CCAD8',
    inactiveColor: '#808080',
    position: { x: -140, y: 0 }, // Left - adjusted for visual balance
    sound: 250
  }
};