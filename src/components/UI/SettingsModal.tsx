import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Clock, Play, RotateCcw } from 'lucide-react';
import { useSettings } from '../../store/useSettings';
import type { BackgroundCategory, AmbientSound } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BACKGROUND_OPTIONS: { value: BackgroundCategory; label: string }[] = [
  { value: 'nature', label: 'Nature' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'lofi', label: 'Lo-Fi' },
  { value: 'abstract', label: 'Abstract' },
];

const SOUND_OPTIONS: { value: AmbientSound; label: string; icon: string }[] = [
  { value: 'none', label: 'Off', icon: '' },
  { value: 'rain', label: 'Rain', icon: '🌧' },
  { value: 'cafe', label: 'Café', icon: '☕' },
  { value: 'whitenoise', label: 'White Noise', icon: '📻' },
  { value: 'forest', label: 'Forest', icon: '🌲' },
  { value: 'ocean', label: 'Ocean', icon: '🌊' },
  { value: 'thunder', label: 'Thunderstorm', icon: '⛈' },
  { value: 'fireplace', label: 'Fireplace', icon: '🔥' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    timer,
    backgroundCategory,
    ambientSound,
    ambientVolume,
    showQuotes,
    soundEnabled,
    autoStartBreaks,
    autoStartPomodoros,
    updateTimerSettings,
    setBackgroundCategory,
    setAmbientSound,
    setAmbientVolume,
    setShowQuotes,
    setSoundEnabled,
    setAutoStartBreaks,
    setAutoStartPomodoros,
  } = useSettings();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative glass-dark rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold tracking-wide">Settings</h2>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <Section title="Timer (minutes)" icon={<Clock size={16} />}>
                <div className="grid grid-cols-3 gap-3">
                  <TimeInput
                    label="Focus"
                    value={timer.workMinutes}
                    onChange={(v) => updateTimerSettings({ workMinutes: v })}
                  />
                  <TimeInput
                    label="Short Break"
                    value={timer.shortBreakMinutes}
                    onChange={(v) => updateTimerSettings({ shortBreakMinutes: v })}
                  />
                  <TimeInput
                    label="Long Break"
                    value={timer.longBreakMinutes}
                    onChange={(v) => updateTimerSettings({ longBreakMinutes: v })}
                  />
                </div>
              </Section>

              <Section title="Background" icon={<Play size={16} />}>
                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUND_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBackgroundCategory(opt.value)}
                      className={`px-3 py-2 rounded-xl text-sm transition-all ${
                        backgroundCategory === opt.value
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Ambient Sound" icon={<Volume2 size={16} />}>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {SOUND_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAmbientSound(opt.value)}
                      className={`px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 ${
                        ambientSound === opt.value
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      {opt.icon && <span className="text-base">{opt.icon}</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
                {ambientSound !== 'none' && (
                  <div className="flex items-center gap-3">
                    <VolumeX size={14} className="text-white/40" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={ambientVolume}
                      onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                      className="flex-1 accent-[var(--accent)] h-1"
                    />
                    <Volume2 size={14} className="text-white/40" />
                  </div>
                )}
              </Section>

              <Section title="Options" icon={<RotateCcw size={16} />}>
                <ToggleRow
                  label="Notification Chime"
                  checked={soundEnabled}
                  onChange={setSoundEnabled}
                />
                <ToggleRow
                  label="Motivational Quotes"
                  checked={showQuotes}
                  onChange={setShowQuotes}
                />
                <ToggleRow
                  label="Auto-start Breaks"
                  checked={autoStartBreaks}
                  onChange={setAutoStartBreaks}
                />
                <ToggleRow
                  label="Auto-start Pomodoros"
                  checked={autoStartPomodoros}
                  onChange={setAutoStartPomodoros}
                />
              </Section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-white/40">{icon}</span>
        <h3 className="text-white/70 text-xs uppercase tracking-wider font-medium">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <label className="text-white/40 text-[10px] uppercase tracking-wider">{label}</label>
      <input
        type="number"
        min="1"
        max="120"
        value={value}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
        className="w-full bg-white/10 text-white text-center rounded-lg py-2 px-1 text-sm border border-white/10 focus:border-white/30 outline-none transition-colors"
      />
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-2 text-sm"
    >
      <span className="text-white/60">{label}</span>
      <div
        className={`w-9 h-5 rounded-full transition-colors relative ${
          checked ? 'bg-[var(--accent)]' : 'bg-white/15'
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
          animate={{ left: checked ? '18px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}
