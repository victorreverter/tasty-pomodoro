import { useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../../store/useSettings';
import type { AmbientSound } from '../../types';

interface AudioNodeGraph {
  nodes: AudioNode[];
  sources: AudioBufferSourceNode[];
  oscillators: OscillatorNode[];
}

function createReverb(ctx: AudioContext, decay: number = 2): ConvolverNode {
  const rate = ctx.sampleRate;
  const length = rate * decay;
  const impulse = ctx.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }

  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBuffer {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
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
  } else {
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
  }

  return buffer;
}

function createLoopingSource(ctx: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function createNoiseSource(ctx: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBufferSourceNode {
  return createLoopingSource(ctx, createNoiseBuffer(ctx, type));
}

function buildRain(ctx: AudioContext, masterGain: GainNode): AudioNodeGraph {
  const graph: AudioNodeGraph = { nodes: [], sources: [], oscillators: [] };

  const rain = createNoiseSource(ctx, 'pink');
  const rainFilter = ctx.createBiquadFilter();
  rainFilter.type = 'lowpass';
  rainFilter.frequency.value = 600;
  rainFilter.Q.value = 0.7;
  const rainGain = ctx.createGain();
  rainGain.gain.value = 0.6;

  rain.connect(rainFilter);
  rainFilter.connect(rainGain);
  rainGain.connect(masterGain);
  rain.start();
  graph.sources.push(rain);
  graph.nodes.push(rainFilter, rainGain);

  const drops = createNoiseSource(ctx, 'white');
  const dropFilter = ctx.createBiquadFilter();
  dropFilter.type = 'bandpass';
  dropFilter.frequency.value = 4000;
  dropFilter.Q.value = 2;
  const dropGain = ctx.createGain();
  dropGain.gain.value = 0.08;

  drops.connect(dropFilter);
  dropFilter.connect(dropGain);
  dropGain.connect(masterGain);
  drops.start();
  graph.sources.push(drops);
  graph.nodes.push(dropFilter, dropGain);

  const reverb = createReverb(ctx, 1.5);
  rainGain.disconnect();
  rainGain.connect(reverb);
  reverb.connect(masterGain);
  graph.nodes.push(reverb);

  return graph;
}

function buildCafe(ctx: AudioContext, masterGain: GainNode): AudioNodeGraph {
  const graph: AudioNodeGraph = { nodes: [], sources: [], oscillators: [] };

  const base = createNoiseSource(ctx, 'pink');
  const baseFilter = ctx.createBiquadFilter();
  baseFilter.type = 'bandpass';
  baseFilter.frequency.value = 800;
  baseFilter.Q.value = 0.4;
  const baseGain = ctx.createGain();
  baseGain.gain.value = 0.5;

  base.connect(baseFilter);
  baseFilter.connect(baseGain);
  baseGain.connect(masterGain);
  base.start();
  graph.sources.push(base);
  graph.nodes.push(baseFilter, baseGain);

  const chatter = createNoiseSource(ctx, 'white');
  const chatterFilter = ctx.createBiquadFilter();
  chatterFilter.type = 'bandpass';
  chatterFilter.frequency.value = 1500;
  chatterFilter.Q.value = 1;

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.3;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.15;
  lfo.connect(lfoGain);

  const chatterGain = ctx.createGain();
  chatterGain.gain.value = 0.12;
  lfoGain.connect(chatterGain.gain);

  chatter.connect(chatterFilter);
  chatterFilter.connect(chatterGain);
  chatterGain.connect(masterGain);
  chatter.start();
  lfo.start();
  graph.sources.push(chatter);
  graph.oscillators.push(lfo);
  graph.nodes.push(chatterFilter, chatterGain, lfoGain);

  const clink = createNoiseSource(ctx, 'white');
  const clinkFilter = ctx.createBiquadFilter();
  clinkFilter.type = 'highpass';
  clinkFilter.frequency.value = 6000;
  const clinkGain = ctx.createGain();
  clinkGain.gain.value = 0.03;

  clink.connect(clinkFilter);
  clinkFilter.connect(clinkGain);
  clinkGain.connect(masterGain);
  clink.start();
  graph.sources.push(clink);
  graph.nodes.push(clinkFilter, clinkGain);

  return graph;
}

function buildWhiteNoise(ctx: AudioContext, masterGain: GainNode): AudioNodeGraph {
  const graph: AudioNodeGraph = { nodes: [], sources: [], oscillators: [] };

  const noise = createNoiseSource(ctx, 'white');
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 4000;
  const gain = ctx.createGain();
  gain.gain.value = 0.4;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  noise.start();
  graph.sources.push(noise);
  graph.nodes.push(filter, gain);

  return graph;
}

function buildForest(ctx: AudioContext, masterGain: GainNode): AudioNodeGraph {
  const graph: AudioNodeGraph = { nodes: [], sources: [], oscillators: [] };

  const wind = createNoiseSource(ctx, 'brown');
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = 'lowpass';
  windFilter.frequency.value = 400;

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain);
  lfoGain.connect(windFilter.frequency);

  const windGain = ctx.createGain();
  windGain.gain.value = 0.35;

  wind.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(masterGain);
  wind.start();
  lfo.start();
  graph.sources.push(wind);
  graph.oscillators.push(lfo);
  graph.nodes.push(windFilter, windGain, lfoGain);

  const leaves = createNoiseSource(ctx, 'pink');
  const leavesFilter = ctx.createBiquadFilter();
  leavesFilter.type = 'highpass';
  leavesFilter.frequency.value = 2000;
  const leavesGain = ctx.createGain();
  leavesGain.gain.value = 0.06;

  leaves.connect(leavesFilter);
  leavesFilter.connect(leavesGain);
  leavesGain.connect(masterGain);
  leaves.start();
  graph.sources.push(leaves);
  graph.nodes.push(leavesFilter, leavesGain);

  return graph;
}

function buildOcean(ctx: AudioContext, masterGain: GainNode): AudioNodeGraph {
  const graph: AudioNodeGraph = { nodes: [], sources: [], oscillators: [] };

  const wave1 = createNoiseSource(ctx, 'brown');
  const wave1Filter = ctx.createBiquadFilter();
  wave1Filter.type = 'lowpass';
  wave1Filter.frequency.value = 300;

  const waveLfo1 = ctx.createOscillator();
  waveLfo1.type = 'sine';
  waveLfo1.frequency.value = 0.08;
  const waveLfoGain1 = ctx.createGain();
  waveLfoGain1.gain.value = 0.25;
  waveLfo1.connect(waveLfoGain1);

  const wave1Gain = ctx.createGain();
  wave1Gain.gain.value = 0.5;
  waveLfoGain1.connect(wave1Gain.gain);

  wave1.connect(wave1Filter);
  wave1Filter.connect(wave1Gain);
  wave1Gain.connect(masterGain);
  wave1.start();
  waveLfo1.start();
  graph.sources.push(wave1);
  graph.oscillators.push(waveLfo1);
  graph.nodes.push(wave1Filter, wave1Gain, waveLfoGain1);

  const wave2 = createNoiseSource(ctx, 'brown');
  const wave2Filter = ctx.createBiquadFilter();
  wave2Filter.type = 'lowpass';
  wave2Filter.frequency.value = 500;

  const waveLfo2 = ctx.createOscillator();
  waveLfo2.type = 'sine';
  waveLfo2.frequency.value = 0.12;
  const waveLfoGain2 = ctx.createGain();
  waveLfoGain2.gain.value = 0.18;
  waveLfo2.connect(waveLfoGain2);

  const wave2Gain = ctx.createGain();
  wave2Gain.gain.value = 0.3;
  waveLfoGain2.connect(wave2Gain.gain);

  wave2.connect(wave2Filter);
  wave2Filter.connect(wave2Gain);
  wave2Gain.connect(masterGain);
  wave2.start();
  waveLfo2.start();
  graph.sources.push(wave2);
  graph.oscillators.push(waveLfo2);
  graph.nodes.push(wave2Filter, wave2Gain, waveLfoGain2);

  const foam = createNoiseSource(ctx, 'white');
  const foamFilter = ctx.createBiquadFilter();
  foamFilter.type = 'highpass';
  foamFilter.frequency.value = 3000;
  const foamGain = ctx.createGain();
  foamGain.gain.value = 0.04;

  foam.connect(foamFilter);
  foamFilter.connect(foamGain);
  foamGain.connect(masterGain);
  foam.start();
  graph.sources.push(foam);
  graph.nodes.push(foamFilter, foamGain);

  return graph;
}

function buildThunder(ctx: AudioContext, masterGain: GainNode): AudioNodeGraph {
  const graph: AudioNodeGraph = { nodes: [], sources: [], oscillators: [] };

  const rain = createNoiseSource(ctx, 'pink');
  const rainFilter = ctx.createBiquadFilter();
  rainFilter.type = 'lowpass';
  rainFilter.frequency.value = 500;
  const rainGain = ctx.createGain();
  rainGain.gain.value = 0.35;

  rain.connect(rainFilter);
  rainFilter.connect(rainGain);
  rainGain.connect(masterGain);
  rain.start();
  graph.sources.push(rain);
  graph.nodes.push(rainFilter, rainGain);

  const reverb = createReverb(ctx, 3);
  rainGain.disconnect();
  rainGain.connect(reverb);
  reverb.connect(masterGain);
  graph.nodes.push(reverb);

  return graph;
}

function buildFireplace(ctx: AudioContext, masterGain: GainNode): AudioNodeGraph {
  const graph: AudioNodeGraph = { nodes: [], sources: [], oscillators: [] };

  const crackle = createNoiseSource(ctx, 'brown');
  const crackleFilter = ctx.createBiquadFilter();
  crackleFilter.type = 'bandpass';
  crackleFilter.frequency.value = 600;
  crackleFilter.Q.value = 0.8;
  const crackleGain = ctx.createGain();
  crackleGain.gain.value = 0.5;

  crackle.connect(crackleFilter);
  crackleFilter.connect(crackleGain);
  crackleGain.connect(masterGain);
  crackle.start();
  graph.sources.push(crackle);
  graph.nodes.push(crackleFilter, crackleGain);

  const hiss = createNoiseSource(ctx, 'white');
  const hissFilter = ctx.createBiquadFilter();
  hissFilter.type = 'bandpass';
  hissFilter.frequency.value = 3500;
  hissFilter.Q.value = 3;
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0.04;

  const hissLfo = ctx.createOscillator();
  hissLfo.type = 'sine';
  hissLfo.frequency.value = 0.5;
  const hissLfoGain = ctx.createGain();
  hissLfoGain.gain.value = 0.03;
  hissLfo.connect(hissLfoGain);
  hissLfoGain.connect(hissGain.gain);

  hiss.connect(hissFilter);
  hissFilter.connect(hissGain);
  hissGain.connect(masterGain);
  hiss.start();
  hissLfo.start();
  graph.sources.push(hiss);
  graph.oscillators.push(hissLfo);
  graph.nodes.push(hissFilter, hissGain, hissLfoGain);

  const rumble = createNoiseSource(ctx, 'brown');
  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = 'lowpass';
  rumbleFilter.frequency.value = 150;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.2;

  rumble.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(masterGain);
  rumble.start();
  graph.sources.push(rumble);
  graph.nodes.push(rumbleFilter, rumbleGain);

  return graph;
}

const soundBuilders: Record<Exclude<AmbientSound, 'none'>, (ctx: AudioContext, gain: GainNode) => AudioNodeGraph> = {
  rain: buildRain,
  cafe: buildCafe,
  whitenoise: buildWhiteNoise,
  forest: buildForest,
  ocean: buildOcean,
  thunder: buildThunder,
  fireplace: buildFireplace,
};

export function AudioPlayer() {
  const ambientSound = useSettings((s) => s.ambientSound);
  const ambientVolume = useSettings((s) => s.ambientVolume);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const graphRef = useRef<AudioNodeGraph | null>(null);
  const currentSoundRef = useRef<AmbientSound>('none');

  const stopGraph = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.sources.forEach((s) => { try { s.stop(); } catch { /* noop */ } });
      graphRef.current.oscillators.forEach((o) => { try { o.stop(); } catch { /* noop */ } });
      graphRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(ambientVolume, ctxRef.current.currentTime, 0.15);
    }
  }, [ambientVolume]);

  useEffect(() => {
    if (ambientSound === currentSoundRef.current) return;
    currentSoundRef.current = ambientSound;

    stopGraph();

    if (ambientSound === 'none') {
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
      gainRef.current = null;
      return;
    }

    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
    }

    const ctx = ctxRef.current;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(ambientVolume, ctx.currentTime + 0.5);
    gain.connect(ctx.destination);
    gainRef.current = gain;

    const builder = soundBuilders[ambientSound];
    if (builder) {
      graphRef.current = builder(ctx, gain);
    }

    return () => { stopGraph(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambientSound, stopGraph]);

  useEffect(() => {
    return () => {
      stopGraph();
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close();
      }
      ctxRef.current = null;
    };
  }, [stopGraph]);

  return null;
}
