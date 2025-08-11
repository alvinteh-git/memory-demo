import { useCallback, useEffect } from 'react';
import { GemstoneType } from '@/core/game/types';
import { soundManager } from '@/utils/soundManager';

interface UseGameSoundsResult {
  playGemSound: (gemType: GemstoneType) => void;
  stopAllSounds: () => void;
  setMuted: (muted: boolean) => void;
  getMuted: () => boolean;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  startBackgroundMusic: () => Promise<void>;
  stopBackgroundMusic: () => void;
  setMusicVolume: (volume: number) => void;
  getMusicVolume: () => number;
  getIsMusicPlaying: () => boolean;
}

export const useGameSounds = (): UseGameSoundsResult => {
  // Ensure audio context is ready when component mounts
  useEffect(() => {
    soundManager.ensureAudioContext();
  }, []);

  const playGemSound = useCallback((gemType: GemstoneType) => {
    soundManager.playGemSound(gemType);
  }, []);

  const stopAllSounds = useCallback(() => {
    soundManager.stopAllSounds();
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    soundManager.setMuted(muted);
  }, []);

  const getMuted = useCallback(() => {
    return soundManager.getMuted();
  }, []);

  const setVolume = useCallback((volume: number) => {
    soundManager.setVolume(volume);
  }, []);

  const getVolume = useCallback(() => {
    return soundManager.getVolume();
  }, []);

  const startBackgroundMusic = useCallback(async () => {
    await soundManager.startBackgroundMusic();
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    soundManager.stopBackgroundMusic();
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    soundManager.setMusicVolume(volume);
  }, []);

  const getMusicVolume = useCallback(() => {
    return soundManager.getMusicVolume();
  }, []);

  const getIsMusicPlaying = useCallback(() => {
    return soundManager.getIsMusicPlaying();
  }, []);

  return {
    playGemSound,
    stopAllSounds,
    setMuted,
    getMuted,
    setVolume,
    getVolume,
    startBackgroundMusic,
    stopBackgroundMusic,
    setMusicVolume,
    getMusicVolume,
    getIsMusicPlaying
  };
};