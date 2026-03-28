import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, TimerMode, BackgroundCategory, AmbientSound, TimerSettings } from '../types';

interface PomodoroStore extends AppSettings {
  mode: TimerMode;
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
  sessionsCompleted: number;

  setMode: (mode: TimerMode) => void;
  setIsRunning: (running: boolean) => void;
  setTimeRemaining: (time: number) => void;
  setTotalTime: (time: number) => void;
  incrementSessions: () => void;
  resetTimer: (mode: TimerMode) => void;

  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
  setBackgroundCategory: (category: BackgroundCategory) => void;
  setAmbientSound: (sound: AmbientSound) => void;
  setAmbientVolume: (volume: number) => void;
  setShowQuotes: (show: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAutoStartBreaks: (auto: boolean) => void;
  setAutoStartPomodoros: (auto: boolean) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  timer: {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
  },
  backgroundCategory: 'nature',
  ambientSound: 'none',
  ambientVolume: 0.5,
  showQuotes: true,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

export const useSettings = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      mode: 'work',
      isRunning: false,
      timeRemaining: DEFAULT_SETTINGS.timer.workMinutes * 60,
      totalTime: DEFAULT_SETTINGS.timer.workMinutes * 60,
      sessionsCompleted: 0,

      setMode: (mode) => set({ mode }),
      setIsRunning: (isRunning) => set({ isRunning }),
      setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
      setTotalTime: (totalTime) => set({ totalTime }),
      incrementSessions: () => set((s) => ({ sessionsCompleted: s.sessionsCompleted + 1 })),

      resetTimer: (mode) => {
        const { timer } = get();
        const minutes =
          mode === 'work'
            ? timer.workMinutes
            : mode === 'shortBreak'
              ? timer.shortBreakMinutes
              : timer.longBreakMinutes;
        set({
          mode,
          isRunning: false,
          timeRemaining: minutes * 60,
          totalTime: minutes * 60,
        });
      },

      updateTimerSettings: (settings) =>
        set((s) => ({
          timer: { ...s.timer, ...settings },
        })),
      setBackgroundCategory: (backgroundCategory) => set({ backgroundCategory }),
      setAmbientSound: (ambientSound) => set({ ambientSound }),
      setAmbientVolume: (ambientVolume) => set({ ambientVolume }),
      setShowQuotes: (showQuotes) => set({ showQuotes }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setAutoStartBreaks: (autoStartBreaks) => set({ autoStartBreaks }),
      setAutoStartPomodoros: (autoStartPomodoros) => set({ autoStartPomodoros }),
    }),
    {
      name: 'tasty-pomodoro-settings',
      partialize: (state) => ({
        timer: state.timer,
        backgroundCategory: state.backgroundCategory,
        ambientSound: state.ambientSound,
        ambientVolume: state.ambientVolume,
        showQuotes: state.showQuotes,
        soundEnabled: state.soundEnabled,
        autoStartBreaks: state.autoStartBreaks,
        autoStartPomodoros: state.autoStartPomodoros,
      }),
    }
  )
);
