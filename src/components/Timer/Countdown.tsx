import { motion } from 'framer-motion';

interface CountdownProps {
  timeRemaining: number;
  totalTime: number;
  mode: 'work' | 'shortBreak' | 'longBreak';
  isRunning: boolean;
}

export function Countdown({ timeRemaining, totalTime, mode, isRunning }: CountdownProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;

  const size = 280;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const modeLabels: Record<string, string> = {
    work: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  };

  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={{ scale: isRunning ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="ring-glow"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.4, ease: 'linear' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2"
          key={mode}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {modeLabels[mode]}
        </motion.span>
        <motion.span
          className="text-white text-6xl md:text-7xl font-light tracking-tight text-shadow tabular-nums"
          layout
        >
          {String(minutes).padStart(2, '0')}
          <motion.span
            animate={{ opacity: isRunning ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 1, repeat: isRunning ? Infinity : 0, ease: 'linear' }}
          >
            :
          </motion.span>
          {String(seconds).padStart(2, '0')}
        </motion.span>
      </div>
    </motion.div>
  );
}
