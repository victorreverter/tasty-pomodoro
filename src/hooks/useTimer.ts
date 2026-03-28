import { useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../store/useSettings';

const workerUrl = import.meta.env.BASE_URL + 'workers/timerWorker.js';

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

function handleSessionCompleteLogic() {
  const state = useSettings.getState();
  if (state.mode === 'work') {
    state.incrementSessions();
    const newCount = state.sessionsCompleted;
    const nextMode =
      newCount % state.timer.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
    state.resetTimer(nextMode);
    if (state.autoStartBreaks) {
      setTimeout(() => {
        const current = useSettings.getState();
        if (!current.isRunning) {
          const w = new Worker(workerUrl);
          w.postMessage({ action: 'start', duration: current.timeRemaining });
          w.onmessage = (e: MessageEvent) => {
            const { type, remaining } = e.data;
            if (type === 'tick') {
              useSettings.getState().setTimeRemaining(remaining);
            } else if (type === 'complete') {
              useSettings.getState().setIsRunning(false);
              if (useSettings.getState().soundEnabled) playChimeSound();
              w.terminate();
            }
          };
          useSettings.getState().setIsRunning(true);
        }
      }, 500);
    }
  } else {
    state.resetTimer('work');
    if (state.autoStartPomodoros) {
      setTimeout(() => {
        const current = useSettings.getState();
        if (!current.isRunning) {
          const w = new Worker(workerUrl);
          w.postMessage({ action: 'start', duration: current.timeRemaining });
          w.onmessage = (e: MessageEvent) => {
            const { type, remaining } = e.data;
            if (type === 'tick') {
              useSettings.getState().setTimeRemaining(remaining);
            } else if (type === 'complete') {
              useSettings.getState().setIsRunning(false);
              if (useSettings.getState().soundEnabled) playChimeSound();
              w.terminate();
            }
          };
          useSettings.getState().setIsRunning(true);
        }
      }, 500);
    }
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
  const resetTimer = useSettings((s) => s.resetTimer);

  // Keep soundEnabled ref in sync
  useEffect(() => {
    return useSettings.subscribe((state) => {
      soundEnabledRef.current = state.soundEnabled;
    });
  }, []);

  // Create worker ONCE on mount, never re-create
  useEffect(() => {
    const worker = new Worker(workerUrl);
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
        handleSessionCompleteLogic();
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    handleSessionCompleteLogic();
  }, [setIsRunning]);

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
