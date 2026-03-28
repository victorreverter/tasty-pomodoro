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
  const soundEnabledRef = useRef(useSettings.getState().soundEnabled);

  const mode = useSettings((s) => s.mode);
  const isRunning = useSettings((s) => s.isRunning);
  const timeRemaining = useSettings((s) => s.timeRemaining);
  const totalTime = useSettings((s) => s.totalTime);
  const timer = useSettings((s) => s.timer);
  const sessionsCompleted = useSettings((s) => s.sessionsCompleted);
  const setIsRunning = useSettings((s) => s.setIsRunning);
  const incrementSessions = useSettings((s) => s.incrementSessions);
  const resetTimer = useSettings((s) => s.resetTimer);

  // Keep soundEnabled ref in sync without re-creating the worker
  useEffect(() => {
    return useSettings.subscribe((state) => {
      soundEnabledRef.current = state.soundEnabled;
    });
  }, []);

  const handleSessionComplete = useCallback(() => {
    const state = useSettings.getState();
    if (state.mode === 'work') {
      incrementSessions();
      const newCount = state.sessionsCompleted + 1;
      const nextMode =
        newCount % state.timer.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      resetTimer(nextMode);
      if (state.autoStartBreaks) {
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
                playChimeSound();
                w.terminate();
              }
            };
            useSettings.getState().setIsRunning(true);
          }
        }, 500);
      }
    } else {
      resetTimer('work');
      if (state.autoStartPomodoros) {
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
                playChimeSound();
                w.terminate();
              }
            };
            useSettings.getState().setIsRunning(true);
          }
        }, 500);
      }
    }
  }, [incrementSessions, resetTimer]);

  // Create worker once, use refs for dynamic values
  useEffect(() => {
    const worker = new Worker('/workers/timerWorker.js');
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const { type, remaining } = e.data;
      if (type === 'tick') {
        useSettings.getState().setTimeRemaining(remaining);
      } else if (type === 'complete') {
        useSettings.getState().setIsRunning(false);
        if (soundEnabledRef.current) {
          playChimeSound();
        }
        handleSessionComplete();
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [handleSessionComplete]);

  const start = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({
      action: 'start',
      duration: useSettings.getState().timeRemaining,
    });
    setIsRunning(true);
  }, [setIsRunning]);

  const pause = useCallback(() => {
    workerRef.current?.postMessage({ action: 'pause' });
    setIsRunning(false);
  }, [setIsRunning]);

  const reset = useCallback(
    (toMode?: 'work' | 'shortBreak' | 'longBreak') => {
      workerRef.current?.postMessage({ action: 'stop' });
      resetTimer(toMode ?? useSettings.getState().mode);
    },
    [resetTimer]
  );

  const skip = useCallback(() => {
    workerRef.current?.postMessage({ action: 'stop' });
    setIsRunning(false);
    handleSessionComplete();
  }, [setIsRunning, handleSessionComplete]);

  const toggle = useCallback(() => {
    if (useSettings.getState().isRunning) {
      pause();
    } else {
      start();
    }
  }, [start, pause]);

  return {
    mode,
    isRunning,
    timeRemaining,
    totalTime,
    sessionsCompleted,
    timerSettings: timer,
    start,
    pause,
    reset,
    skip,
    toggle,
  };
}
