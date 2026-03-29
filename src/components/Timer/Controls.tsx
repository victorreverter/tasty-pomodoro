import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

interface ControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onSkip: () => void;
  onReset: () => void;
}

export function Controls({ isRunning, onToggle, onSkip, onReset }: ControlsProps) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <motion.button
        onClick={onReset}
        className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Reset"
      >
        <RotateCcw size={16} />
      </motion.button>

      <motion.button
        onClick={onToggle}
        className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ background: 'var(--accent)' }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        title={isRunning ? 'Pause' : 'Start'}
      >
        {isRunning ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-0.5" />}
      </motion.button>

      <motion.button
        onClick={onSkip}
        className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Skip"
      >
        <SkipForward size={16} />
      </motion.button>
    </div>
  );
}
