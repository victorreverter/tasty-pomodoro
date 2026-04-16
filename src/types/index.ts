export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export type BackgroundCategory = 'nature' | 'minimal' | 'lofi' | 'abstract';

export type AmbientSound = 'none' | 'rain' | 'cafe' | 'whitenoise' | 'forest' | 'ocean' | 'thunder' | 'fireplace';

export type AccentColor = 'red' | 'pink' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple';

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
  enableTaskList: boolean;
  accentColor: AccentColor;
}

export interface Quote {
  text: string;
  author: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface TimerState {
  mode: TimerMode;
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
  sessionsCompleted: number;
}
