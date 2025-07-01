import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAudioContext } from './AudioContext';

interface DrumMachineContextType {
  pattern: boolean[][];
  setPattern: (pattern: boolean[][]) => void;
  samples: AudioBuffer[];
  setSamples: (samples: AudioBuffer[]) => void;
  trackVolumes: number[];
  setTrackVolumes: (volumes: number[]) => void;
  soundParams: any[];
  setSoundParams: (params: any[]) => void;
  generateSample: (trackIndex: number) => AudioBuffer | null;
  playSound: (track: number) => void;
  toggleStep: (track: number, step: number) => void;
  trackGainNodes: GainNode[];
  trackPanNodes: StereoPannerNode[];
  masterGainNode: GainNode | null;
}

const DrumMachineContext = createContext<DrumMachineContextType | null>(null);

export const useDrumMachine = () => {
  const context = useContext(DrumMachineContext);
  if (!context) {
    throw new Error('useDrumMachine must be used within DrumMachineProvider');
  }
  return context;
};

// Funzioni per localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignora errori di localStorage
  }
};

export const DrumMachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { audioContext, isAudioReady } = useAudioContext();
  
  const [pattern, setPatternState] = useState<boolean[][]>(() => 
    loadFromStorage('drumPattern', Array(8).fill(null).map(() => Array(16).fill(false)))
  );
  const [samples, setSamples] = useState<AudioBuffer[]>([]);
  const [trackVolumesState, setTrackVolumesState] = useState<number[]>(loadFromStorage('trackVolumes', [80, 75, 60, 50, 70, 65, 65, 70]));
  const [soundParamsState, setSoundParamsState] = useState<any[]>(loadFromStorage('soundParams', [
    { attack: 0.01, decay: 0.5, release: 0.1, pitch: 0, filter: 8000 },
    { attack: 0.01, decay: 0.3, release: 0.1, pitch: 0, filter: 6000 },
    { attack: 0.01, decay: 0.15, release: 0.05, pitch: 0, filter: 8000 },
    { attack: 0.01, decay: 0.8, release: 0.2, pitch: 0, filter: 7000 },
    { attack: 0.01, decay: 2.0, release: 0.5, pitch: 0, filter: 5000 },
    { attack: 0.01, decay: 0.4, release: 0.1, pitch: 0, filter: 4000 },
    { attack: 0.01, decay: 0.3, release: 0.1, pitch: 0, filter: 3500 },
    { attack: 0.01, decay: 0.2, release: 0.05, pitch: 0, filter: 6500 }
  ]));
  
  // Audio nodes for mixing and analysis
  const [trackGainNodes, setTrackGainNodes] = useState<GainNode[]>([]);
  const [trackPanNodes, setTrackPanNodes] = useState<StereoPannerNode[]>([]);
  const [masterGainNode, setMasterGainNode] = useState<GainNode | null>(null);

  const trackNames = ['Kick', 'Snare', 'Hi-Hat', 'Open Hat', 'Crash', 'Perc 1', 'Perc 2', 'Clap'];

  // Wrapper functions che salvano automaticamente nel localStorage
  const setPattern = useCallback((newPattern: boolean[][]) => {
    setPatternState(newPattern);
    saveToStorage('drumPattern', newPattern);
  }, []);

  const setTrackVolumes = useCallback((newVolumes: number[]) => {
    setTrackVolumesState(newVolumes);
    saveToStorage('trackVolumes', newVolumes);
  }, []);

  const setSoundParams = useCallback((newParams: any[]) => {
    setSoundParamsState(newParams);
    saveToStorage('soundParams', newParams);
  }, []);

  // Generate synthetic samples
  const generateSample = useCallback((trackIndex: number) => {
    if (!audioContext) return null;

    const sampleRate = audioContext.sampleRate;
    const params = soundParamsState[trackIndex];
    
    let duration: number, frequency: number, type: string;

    switch(trackIndex) {
      case 0: // Kick
        duration = 0.5 * params.decay;
        frequency = 45 * Math.pow(2, params.pitch / 12);
        type = 'kick';
        break;
      case 1: // Snare
        duration = 0.25 * params.decay;
        frequency = 180 * Math.pow(2, params.pitch / 12);
        type = 'snare';
        break;
      case 2: // Hi-Hat
        duration = 0.12 * params.decay;
        frequency = 10000 * Math.pow(2, params.pitch / 12);
        type = 'hihat';
        break;
      case 3: // Open Hat
        duration = 0.6 * params.decay;
        frequency = 8000 * Math.pow(2, params.pitch / 12);
        type = 'openhat';
        break;
      case 4: // Crash
        duration = 1.8 * params.decay;
        frequency = 4000 * Math.pow(2, params.pitch / 12);
        type = 'crash';
        break;
      case 5: // Perc 1
        duration = 0.3 * params.decay;
        frequency = 600 * Math.pow(2, params.pitch / 12);
        type = 'perc';
        break;
      case 6: // Perc 2
        duration = 0.25 * params.decay;
        frequency = 350 * Math.pow(2, params.pitch / 12);
        type = 'perc';
        break;
      case 7: // Clap
        duration = 0.15 * params.decay;
        frequency = 800 * Math.pow(2, params.pitch / 12);
        type = 'clap';
        break;
      default:
        return null;
    }

    const length = Math.max(sampleRate * duration, sampleRate * 0.05);
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Envelope
      let envelope = 1;
      const attackTime = params.attack;
      const decayTime = params.decay;
      const releaseTime = params.release;
      const sustainLevel = 0.3;
      
      if (t < attackTime) {
        envelope = t / attackTime;
      } else if (t < attackTime + decayTime) {
        const decayProgress = (t - attackTime) / decayTime;
        envelope = 1 - decayProgress * (1 - sustainLevel);
      } else {
        const releaseStart = attackTime + decayTime;
        const releaseProgress = (t - releaseStart) / releaseTime;
        envelope = sustainLevel * Math.exp(-releaseProgress * 5);
      }

      // Generate waveform based on type
      switch(type) {
        case 'kick':
          const kickPitchEnv = Math.exp(-t * 30);
          const kickFreq = frequency * (1 + kickPitchEnv * 3);
          sample = Math.sin(2 * Math.PI * kickFreq * t) * envelope;
          if (t < 0.005) {
            sample += (Math.random() * 2 - 1) * envelope * 2;
          }
          break;
          
        case 'snare':
          const snareNoise = (Math.random() * 2 - 1) * 0.8;
          const snareTone = Math.sin(2 * Math.PI * frequency * t) * 0.3;
          sample = (snareNoise + snareTone) * envelope;
          break;
          
        case 'hihat':
        case 'openhat':
        case 'crash':
          sample = (Math.random() * 2 - 1) * envelope;
          for (let h = 1; h <= 6; h++) {
            sample += Math.sin(2 * Math.PI * frequency * h * t) * (1/h) * 0.1 * envelope;
          }
          break;
          
        case 'perc':
          sample = Math.sin(2 * Math.PI * frequency * t) * envelope;
          sample += Math.sin(2 * Math.PI * frequency * 2.1 * t) * 0.3 * envelope;
          break;
          
        case 'clap':
          sample = (Math.random() * 2 - 1) * envelope;
          if (t < 0.003 || (t > 0.008 && t < 0.012) || (t > 0.015 && t < 0.020)) {
            sample *= 2;
          }
          break;
      }

      // Apply filter
      if (params.filter < 8000) {
        const filterAmount = params.filter / 8000;
        sample *= filterAmount;
      }

      data[i] = Math.max(-1, Math.min(1, sample * 0.4));
    }

    // Apply fade-out at the end to prevent clicking
    const fadeOutSamples = Math.min(Math.floor(sampleRate * 0.005), length); // 5ms fade-out
    for (let i = length - fadeOutSamples; i < length; i++) {
      const fadeProgress = (length - i) / fadeOutSamples;
      data[i] *= fadeProgress;
    }

    return buffer;
  }, [audioContext, soundParamsState]);

  // Initialize audio nodes when audio context is ready
  useEffect(() => {
    if (isAudioReady && audioContext) {
      // Create gain and pan nodes for each track
      const newTrackGainNodes: GainNode[] = [];
      const newTrackPanNodes: StereoPannerNode[] = [];
      
      for (let i = 0; i < 8; i++) {
        const gainNode = audioContext.createGain();
        gainNode.gain.value = trackVolumesState[i] / 100;
        
        const panNode = audioContext.createStereoPanner();
        panNode.pan.value = 0; // Default center pan
        
        // Connect gain to pan
        gainNode.connect(panNode);
        
        newTrackGainNodes.push(gainNode);
        newTrackPanNodes.push(panNode);
      }
      
      // Create master gain node
      const newMasterGainNode = audioContext.createGain();
      newMasterGainNode.gain.value = 0.85;
      
      // Connect track pan nodes to master gain node
      newTrackPanNodes.forEach(trackPan => {
        trackPan.connect(newMasterGainNode);
      });
      
      // Connect master gain to destination
      newMasterGainNode.connect(audioContext.destination);
      
      setTrackGainNodes(newTrackGainNodes);
      setTrackPanNodes(newTrackPanNodes);
      setMasterGainNode(newMasterGainNode);
    }
  }, [isAudioReady, audioContext, trackVolumesState]);

  // Generate all samples when audio context is ready or sound parameters change
  useEffect(() => {
    if (isAudioReady && audioContext) {
      console.log('Generating drum samples...');
      const newSamples: AudioBuffer[] = [];
      for (let i = 0; i < 8; i++) {
        const sample = generateSample(i);
        if (sample) {
          newSamples.push(sample);
          console.log(`Generated sample for track ${i} (${trackNames[i]})`);
        } else {
          console.warn(`Failed to generate sample for track ${i} (${trackNames[i]})`);
        }
      }
      setSamples(newSamples);
      console.log(`Total samples generated: ${newSamples.length}/8`);
    }
  }, [isAudioReady, audioContext, generateSample, soundParamsState]);

  const playSound = useCallback((track: number) => {
    if (!audioContext || !samples[track] || !trackGainNodes[track]) return;

    const source = audioContext.createBufferSource();
    source.buffer = samples[track];
    
    // Connect source directly to the track's gain node
    source.connect(trackGainNodes[track]);
    
    source.start();
  }, [audioContext, samples, trackGainNodes]);

  const toggleStep = useCallback((track: number, step: number) => {
    const newPattern = [...pattern];
    newPattern[track][step] = !newPattern[track][step];
    setPattern(newPattern);
  }, [pattern, setPattern]);

  return (
    <DrumMachineContext.Provider value={{
      pattern,
      setPattern,
      samples,
      setSamples,
      trackVolumes: trackVolumesState,
      setTrackVolumes,
      soundParams: soundParamsState,
      setSoundParams,
      generateSample,
      playSound,
      toggleStep,
      trackGainNodes,
      trackPanNodes,
      masterGainNode
    }}>
      {children}
    </DrumMachineContext.Provider>
  );
};