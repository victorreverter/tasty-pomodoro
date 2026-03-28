import { useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../store/useSettings';

function playChimeSound() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio context not available
  }
}

export function useTimer() {
  const workerRef = useRef<Worker | null>(null);
  const {
    mode,
    isRunning,
    timeRemaining,
    timer,
    soundEnabled,
    autoStartBreaks,
    autoStartPomodoros,
    sessionsCompleted,
    setIsRunning,
    setTimeRemaining,
    incrementSessions,
    resetTimer,
  } = useSettings();

  const handleSessionComplete = useCallback(() => {
    const state = useSettings.getState();
    if (state.mode === 'work') {
      const newCount = state.sessionsCompleted + 1;
      incrementSessions();
      const nextMode =
        newCount % state.timer.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      resetTimer(nextMode);
      if (autoStartBreaks) {
        setTimeout(() => {
          const current = useSettings.getState();
          if (!current.isRunning) {
            const w = new Worker('/workers/timerWorker.js');
            w.postMessage({ action: 'start', duration: current.timeRemaining });
            w.onmessage = (e: MessageEvent) => {
              const { type, remaining } = e.data;
              if (type === 'tick') {
                useSettings.getState().setTimeRemaining(remaining);
              } else if (type === 'complete') {
                useSettings.getState().setIsRunning(false);
                w.terminate();
              }
            };
            useSettings.getState().setIsRunning(true);
          }
        }, 500);
      }
    } else {
      resetTimer('work');
      if (autoStartPomodoros) {
        setTimeout(() => {
          const current = useSettings.getState();
          if (!current.isRunning) {
            const w = new Worker('/workers/timerWorker.js');
            w.postMessage({ action: 'start', duration: current.timeRemaining });
            w.onmessage = (e: MessageEvent) => {
              const { type, remaining } = e.data;
              if (type === 'tick') {
                useSettings.getState().setTimeRemaining(remaining);
              } else if (type === 'complete') {
                useSettings.getState().setIsRunning(false);
                w.terminate();
              }
            };
            useSettings.getState().setIsRunning(true);
          }
        }, 500);
      }
    }
  }, [autoStartBreaks, autoStartPomodoros, incrementSessions, resetTimer]);

  useEffect(() => {
    workerRef.current = new Worker('/workers/timerWorker.js');

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, remaining } = e.data;
      if (type === 'tick') {
        setTimeRemaining(remaining);
      } else if (type === 'complete') {
        setIsRunning(false);
        if (soundEnabled) {
          playChimeSound();
        }
        handleSessionComplete();
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [soundEnabled, handleSessionComplete, setTimeRemaining, setIsRunning]);

  const start = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ action: 'start', duration: timeRemaining });
    setIsRunning(true);
  }, [timeRemaining, setIsRunning]);

  const pause = useCallback(() => {
    workerRef.current?.postMessage({ action: 'pause' });
    setIsRunning(false);
  }, [setIsRunning]);

  const reset = useCallback(
    (toMode?: 'work' | 'shortBreak' | 'longBreak') => {
      workerRef.current?.postMessage({ action: 'stop' });
      resetTimer(toMode ?? mode);
    },
    [mode, resetTimer]
  );

  const skip = useCallback(() => {
    workerRef.current?.postMessage({ action: 'stop' });
    setIsRunning(false);
    handleSessionComplete();
  }, [setIsRunning, handleSessionComplete]);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, start, pause]);

  return {
    mode,
    isRunning,
    timeRemaining,
    totalTime: useSettings((s) => s.totalTime),
    sessionsCompleted,
    timerSettings: timer,
    start,
    pause,
    reset,
    skip,
    toggle,
  };
}
