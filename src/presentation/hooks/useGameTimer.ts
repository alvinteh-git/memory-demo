import { useState, useCallback } from 'react';
import { GemstoneType } from '@/core/game/types';

interface UseGameTimerResult {
  timeLeft: number;
  startTimer: (duration: number, onTimeout: () => void) => void;
  stopTimer: () => void;
  getTimerState: (totalDuration: number) => 'normal' | 'warning' | 'critical';
}

export const useGameTimer = (): UseGameTimerResult => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const startTimer = useCallback((duration: number, onTimeout: () => void) => {
    // Clear any existing timer
    if (intervalId) {
      clearInterval(intervalId);
    }

    setTimeLeft(duration);
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setIntervalId(interval);
  }, [intervalId]);

  const stopTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimeLeft(0);
  }, [intervalId]);

  const getTimerState = useCallback((totalDuration: number): 'normal' | 'warning' | 'critical' => {
    const percentage = (timeLeft / totalDuration) * 100;
    if (percentage > 30) return 'normal';
    if (percentage > 10) return 'warning';
    return 'critical';
  }, [timeLeft]);

  return {
    timeLeft,
    startTimer,
    stopTimer,
    getTimerState
  };
};