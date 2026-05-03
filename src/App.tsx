import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { ImageLayer } from './components/Background/ImageLayer';
import { AudioPlayer } from './components/Background/AudioPlayer';
import { Countdown } from './components/Timer/Countdown';
import { Controls } from './components/Timer/Controls';
import { GlassCard } from './components/UI/GlassCard';
import { QuoteDisplay } from './components/UI/QuoteDisplay';
import { SettingsModal } from './components/UI/SettingsModal';
import { TaskList } from './components/UI/TaskList';
import { useTimer } from './hooks/useTimer';
import { useAccentColor } from './hooks/useAccentColor';
import { useSettings } from './store/useSettings';

function App() {
  useAccentColor();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { mode, isRunning, timeRemaining, totalTime, toggle, skip, reset, sessionsCompleted } =
    useTimer();
  const showQuotes = useSettings((s) => s.showQuotes);
  const resetTimer = useSettings((s) => s.resetTimer);
  const enableTaskList = useSettings((s) => s.enableTaskList);

  const modeColors: Record<string, string> = {
    work: 'rgba(255, 107, 107, 0.15)',
    shortBreak: 'rgba(78, 205, 196, 0.15)',
    longBreak: 'rgba(99, 102, 241, 0.15)',
  };

  return (
    <div className="relative min-h-dvh w-screen overflow-x-hidden">
      <ImageLayer />
      <AudioPlayer />

      <div
        className="absolute inset-0 z-[1] pointer-events-none py-12 md:py-20"
        style={{ background: modeColors[mode], transition: 'background 1s ease' }}
      />

      <div className="relative z-10 flex flex-col min-h-dvh py-4 md:py-12 px-4">
        <motion.header
          className="flex items-center justify-between max-w-lg mx-auto w-full py-4 md:py-2 mb-4 md:mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="tracking-wide text-shadow flex items-baseline gap-1.5 md:gap-2">
            <span style={{ fontFamily: 'Caveat, cursive' }} className="font-bold text-2xl md:text-3xl text-[var(--accent)] [text-shadow:_0_10px_32px_rgba(0,0,0,0.9),_0_0_40px_var(--accent-glow),_0_0_60px_var(--accent-glow)]">
              tasty
            </span>
            <span className="font-medium text-sm md:text-base text-white/90 uppercase tracking-[0.15em] [text-shadow:_0_8px_24px_rgba(0,0,0,0.95),_0_4px_12px_rgba(0,0,0,0.9)]">
              pomodoro
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <SessionCounter count={sessionsCompleted} />
            <motion.button
              onClick={() => setSettingsOpen(true)}
              className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/50 flex items-center justify-center text-white/80 hover:text-white transition-all duration-200 [box-shadow:0_8px_36px_rgba(0,0,0,0.6),0_0_24px_rgba(0,0,0,0.4)] hover:[box-shadow:0_12px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(0,0,0,0.6)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings size={20} className="drop-shadow-lg" />
            </motion.button>
          </div>
        </motion.header>

        <main className={`flex flex-col ${enableTaskList ? 'md:flex-row md:items-start md:justify-center' : 'justify-center items-center'} md:gap-6 gap-4 md:gap-6 flex-1 w-full max-w-lg mx-auto`}>
          <GlassCard
            className="p-4 md:p-10 flex flex-col items-center gap-4 md:gap-6"
            style={{ borderRadius: '24px' }}
          >
            <Countdown
              timeRemaining={timeRemaining}
              totalTime={totalTime}
              mode={mode}
              isRunning={isRunning}
            />

            <div className="flex items-center gap-2">
              <ModeIndicator
                mode="work"
                currentMode={mode}
                label="Focus"
                onClick={() => resetTimer('work')}
              />
              <ModeIndicator
                mode="shortBreak"
                currentMode={mode}
                label="Short"
                onClick={() => resetTimer('shortBreak')}
              />
              <ModeIndicator
                mode="longBreak"
                currentMode={mode}
                label="Long"
                onClick={() => resetTimer('longBreak')}
              />
            </div>

            <Controls
              isRunning={isRunning}
              onToggle={toggle}
              onSkip={skip}
              onReset={() => reset()}
            />
          </GlassCard>

          {enableTaskList && (
            <div className="w-full md:w-auto md:min-w-[300px]">
              <TaskList />
            </div>
          )}
        </main>

        <footer className="w-full pb-12 md:pb-20 pt-4 space-y-6">
          <AnimatePresence>
            {showQuotes && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <QuoteDisplay />
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function SessionCounter({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {count === 0 ? (
        <span className="text-white/60 text-[10px] font-medium [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]">0</span>
      ) : (
        <>
          {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
            <motion.div
              key={`${count}-${i}`}
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_var(--accent)]"
              style={{ background: 'var(--accent)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 15 }}
            />
          ))}
          {count > 8 && (
            <span className="text-white/70 text-[10px] font-semibold [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)] ml-1">+{count - 8}</span>
          )}
        </>
      )}
    </div>
  );
}

function ModeIndicator({
  mode,
  currentMode,
  label,
  onClick,
}: {
  mode: string;
  currentMode: string;
  label: string;
  onClick: () => void;
}) {
  const isActive = mode === currentMode;
  return (
    <button
      onClick={onClick}
      className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full transition-all ${
        isActive
          ? 'bg-white/20 text-white'
          : 'text-white/30 hover:text-white/50 hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}

export default App;
