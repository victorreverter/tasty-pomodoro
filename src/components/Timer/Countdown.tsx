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

  const modeColors: Record<string, string> = {
    work: '#ff6b6b',
    shortBreak: '#4ecdc4',
    longBreak: '#6366f1',
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="ring-glow w-[min(280px,65vw)] h-[min(280px,65vw)]"
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={modeColors[mode]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1 md:mb-2"
          key={mode}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {modeLabels[mode]}
        </motion.span>
        <span className="text-white text-5xl md:text-7xl font-light tracking-tight text-shadow tabular-nums">
          {String(minutes).padStart(2, '0')}
          <span
            className="inline-block"
            style={{
              animation: isRunning ? 'blink 1s step-end infinite' : 'none',
              opacity: 1,
            }}
          >
            :
          </span>
          {String(seconds).padStart(2, '0')}
        </span>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
