export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export type BackgroundCategory = 'nature' | 'minimal' | 'lofi' | 'abstract';

export type AmbientSound = 'none' | 'rain' | 'cafe' | 'whitenoise' | 'forest' | 'ocean' | 'thunder' | 'fireplace';

export interface TimerSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export interface AppSettings {
  timer: TimerSettings;
  backgroundCategory: BackgroundCategory;
  ambientSound: AmbientSound;
  ambientVolume: number;
  showQuotes: boolean;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface Quote {
  text: string;
  author: string;
}

export interface TimerState {
  mode: TimerMode;
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
  sessionsCompleted: number;
}
