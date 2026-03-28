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
import { useTimer } from './hooks/useTimer';
import { useSettings } from './store/useSettings';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { mode, isRunning, timeRemaining, totalTime, toggle, skip, reset, sessionsCompleted } =
    useTimer();
  const showQuotes = useSettings((s) => s.showQuotes);
  const resetTimer = useSettings((s) => s.resetTimer);

  const modeColors: Record<string, string> = {
    work: 'rgba(255, 107, 107, 0.15)',
    shortBreak: 'rgba(78, 205, 196, 0.15)',
    longBreak: 'rgba(99, 102, 241, 0.15)',
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <ImageLayer />
      <AudioPlayer />

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: modeColors[mode], transition: 'background 1s ease' }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-between py-8 md:py-12 px-4">
        <motion.header
          className="flex items-center justify-between w-full max-w-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-white/80 text-lg font-medium tracking-wide text-shadow">
            tasty-pomodoro
          </h1>
          <div className="flex items-center gap-2">
            <SessionCounter count={sessionsCompleted} />
            <motion.button
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Settings size={16} />
            </motion.button>
          </div>
        </motion.header>

        <main className="flex flex-col items-center gap-6">
          <GlassCard
            className="p-6 md:p-10 flex flex-col items-center gap-6"
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
        </main>

        <footer className="w-full">
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
    <motion.div
      className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5"
      key={count}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--accent)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
      {count > 8 && (
        <span className="text-white/50 text-[10px] ml-0.5">+{count - 8}</span>
      )}
    </motion.div>
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
