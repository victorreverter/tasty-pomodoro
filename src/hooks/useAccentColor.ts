import { useEffect } from 'react';
import { useSettings } from '../store/useSettings';
import type { AccentColor } from '../types';

const COLOR_MAP: Record<AccentColor, { r: number; g: number; b: number }> = {
  red: { r: 255, g: 107, b: 107 },
  pink: { r: 255, g: 133, b: 162 },
  orange: { r: 255, g: 179, b: 71 },
  yellow: { r: 247, g: 220, b: 111 },
  green: { r: 119, g: 221, b: 119 },
  cyan: { r: 78, g: 205, b: 196 },
  blue: { r: 108, g: 92, b: 231 },
  purple: { r: 162, g: 155, b: 254 },
};

export function useAccentColor() {
  const accentColor = useSettings((s) => s.accentColor);

  useEffect(() => {
    const color = COLOR_MAP[accentColor];
    document.documentElement.style.setProperty('--accent-r', String(color.r));
    document.documentElement.style.setProperty('--accent-g', String(color.g));
    document.documentElement.style.setProperty('--accent-b', String(color.b));
  }, [accentColor]);
}