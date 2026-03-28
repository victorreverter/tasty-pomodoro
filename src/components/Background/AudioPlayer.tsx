import { useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../../store/useSettings';
import type { AmbientSound } from '../../types';

export function AudioPlayer() {
  const ambientSound = useSettings((s) => s.ambientSound);
  const ambientVolume = useSettings((s) => s.ambientVolume);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const gainRef = useRef<GainNode | null>(null);
  const currentSoundRef = useRef<AmbientSound>('none');

  const createNoiseSource = useCallback(
    (ctx: AudioContext, type: 'white' | 'pink'): AudioBufferSourceNode => {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (type === 'white') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      } else {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      return source;
    },
    []
  );

  const createRainSound = useCallback((ctx: AudioContext, gain: GainNode) => {
    const noise = createNoiseSource(ctx, 'pink');
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;
    noise.connect(filter);
    filter.connect(gain);
    noise.start();
    sourcesRef.current.add(noise);
  }, [createNoiseSource]);

  const createCafeSound = useCallback((ctx: AudioContext, gain: GainNode) => {
    const noise = createNoiseSource(ctx, 'white');
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;
    noise.connect(filter);
    filter.connect(gain);
    noise.start();
    sourcesRef.current.add(noise);
  }, [createNoiseSource]);

  const createWhiteNoiseSound = useCallback((ctx: AudioContext, gain: GainNode) => {
    const noise = createNoiseSource(ctx, 'white');
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 4000;
    noise.connect(filter);
    filter.connect(gain);
    noise.start();
    sourcesRef.current.add(noise);
  }, [createNoiseSource]);

  const stopAll = useCallback(() => {
    sourcesRef.current.forEach((source) => {
      try { source.stop(); } catch { /* already stopped */ }
    });
    sourcesRef.current.clear();
  }, []);

  useEffect(() => {
    if (gainRef.current && audioContextRef.current) {
      gainRef.current.gain.setTargetAtTime(ambientVolume, audioContextRef.current.currentTime, 0.1);
    }
  }, [ambientVolume]);

  useEffect(() => {
    stopAll();
    currentSoundRef.current = ambientSound;

    if (ambientSound === 'none') {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      return;
    }

    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = ambientVolume;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    switch (ambientSound) {
      case 'rain':
        createRainSound(ctx, gain);
        break;
      case 'cafe':
        createCafeSound(ctx, gain);
        break;
      case 'whitenoise':
        createWhiteNoiseSound(ctx, gain);
        break;
    }

    return () => {
      stopAll();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambientSound, stopAll, createRainSound, createCafeSound, createWhiteNoiseSound]);

  useEffect(() => {
    return () => {
      stopAll();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAll]);

  return null;
}
