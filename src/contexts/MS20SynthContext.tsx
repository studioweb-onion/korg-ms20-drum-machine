import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAudioContext } from './AudioContext';

interface MS20SynthContextType {
  params: {
    osc1Freq: number;
    osc1Wave: OscillatorType;
    osc1Detune: number;
    osc2Freq: number;
    osc2Wave: OscillatorType;
    osc2Detune: number;
    oscMix: number;
    filterCutoff: number;
    filterRes: number;
    filterEnvAmt: number;
    envAttack: number;
    envDecay: number;
    envSustain: number;
    envRelease: number;
    lfoRate: number;
    lfoAmount: number;
    lfoTarget: 'filter' | 'pitch';
    volume: number;
    distortion: number;
  };
  setParams: (params: any) => void;
  notePattern: boolean[][];
  setNotePattern: (pattern: boolean[][]) => void;
  currentOctave: number;
  setCurrentOctave: (octave: number) => void;
  synthGainNode: GainNode | null;
  synthPanNode: StereoPannerNode | null;
  playNote: (frequency: number, duration?: number) => void;
  stopAllSounds: () => void;
}

const MS20SynthContext = createContext<MS20SynthContextType | null>(null);

export const useMS20Synth = () => {
  const context = useContext(MS20SynthContext);
  if (!context) {
    throw new Error('useMS20Synth must be used within MS20SynthProvider');
  }
  return context;
};

// Helper functions for localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(`ms20_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(`ms20_${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
};

export const MS20SynthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { audioContext, isAudioReady } = useAudioContext();
  
  // Static reference to active nodes to persist across component unmounts
  const staticActiveNodes = useRef<Set<AudioNode>>(new Set());
  
  // Audio nodes for mixing
  const [synthGainNode, setSynthGainNode] = useState<GainNode | null>(null);
  const [synthPanNode, setSynthPanNode] = useState<StereoPannerNode | null>(null);
  
  const [currentOctave, setCurrentOctaveState] = useState(() => loadFromStorage('octave', 3));
  const [notePattern, setNotePatternState] = useState<boolean[][]>(() => 
    loadFromStorage('pattern', Array(12).fill(null).map(() => Array(16).fill(false)))
  );
  
  const [params, setParamsState] = useState(() => loadFromStorage('params', {
    osc1Freq: 1.0,
    osc1Wave: 'sawtooth' as OscillatorType,
    osc1Detune: 0,
    osc2Freq: 2.0,
    osc2Wave: 'square' as OscillatorType,
    osc2Detune: 0,
    oscMix: 50,
    filterCutoff: 2000,
    filterRes: 5,
    filterEnvAmt: 50,
    envAttack: 0.1,
    envDecay: 0.3,
    envSustain: 0.7,
    envRelease: 0.5,
    lfoRate: 2,
    lfoAmount: 0,
    lfoTarget: 'filter' as 'filter' | 'pitch',
    volume: 70,
    distortion: 0
  }));

  // Wrapper functions that automatically save to localStorage
  const setParams = useCallback((newParams: any) => {
    setParamsState((prev: typeof params) => {
      const updated = typeof newParams === 'function' ? newParams(prev) : { ...prev, ...newParams };
      saveToStorage('params', updated);
      return updated;
    });
  }, []);

  const setNotePattern = useCallback((newPattern: boolean[][]) => {
    setNotePatternState(newPattern);
    saveToStorage('pattern', newPattern);
  }, []);

  const setCurrentOctave = useCallback((octave: number) => {
    setCurrentOctaveState(octave);
    saveToStorage('octave', octave);
  }, []);

  // Initialize audio nodes
  useEffect(() => {
    if (!audioContext || !isAudioReady) return;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = params.volume / 100 * 0.3;
    
    const panNode = audioContext.createStereoPanner();
    panNode.pan.value = 0; // Center by default
    
    // Connect nodes
    gainNode.connect(panNode);
    panNode.connect(audioContext.destination);
    
    setSynthGainNode(gainNode);
    setSynthPanNode(panNode);
    
    return () => {
      gainNode.disconnect();
      panNode.disconnect();
    };
  }, [audioContext, isAudioReady, params.volume]);

  // Update gain when volume changes
  useEffect(() => {
    if (synthGainNode) {
      synthGainNode.gain.value = params.volume / 100 * 0.3;
    }
  }, [params.volume, synthGainNode]);

  const playNote = useCallback((frequency: number, duration: number = 1.0) => {
    if (!audioContext || !synthGainNode || !synthPanNode) return;
    
    const now = audioContext.currentTime;
    
    // Oscillators
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    
    osc1.type = params.osc1Wave;
    osc2.type = params.osc2Wave;
    
    const osc1Freq = frequency * params.osc1Freq;
    const osc2Freq = frequency * params.osc2Freq;
    
    osc1.detune.setValueAtTime(params.osc1Detune, now);
    osc2.detune.setValueAtTime(params.osc2Detune, now);
    
    osc1.frequency.setValueAtTime(osc1Freq, now);
    osc2.frequency.setValueAtTime(osc2Freq, now);
    
    // Oscillator Mix
    const osc1Gain = audioContext.createGain();
    const osc2Gain = audioContext.createGain();
    const mixLevel = params.oscMix / 100;
    
    osc1Gain.gain.setValueAtTime(1 - mixLevel, now);
    osc2Gain.gain.setValueAtTime(mixLevel, now);
    
    // Filter with envelope modulation
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(params.filterCutoff, now);
    filter.Q.setValueAtTime(params.filterRes, now);
    
    // Filter envelope modulation
    const filterEnvAmount = params.filterEnvAmt / 100 * params.filterCutoff;
    filter.frequency.linearRampToValueAtTime(params.filterCutoff + filterEnvAmount, now + params.envAttack);
    filter.frequency.linearRampToValueAtTime(params.filterCutoff + filterEnvAmount * params.envSustain, now + params.envAttack + params.envDecay);
    filter.frequency.linearRampToValueAtTime(params.filterCutoff, now + params.envAttack + params.envDecay + duration + params.envRelease);
    
    // LFO
    let lfo: OscillatorNode | null = null;
    let lfoGain: GainNode | null = null;
    if (params.lfoAmount > 0) {
      lfo = audioContext.createOscillator();
      lfoGain = audioContext.createGain();
      
      lfo.frequency.setValueAtTime(params.lfoRate, now);
      lfo.type = 'sine';
      
      if (params.lfoTarget === 'filter') {
        lfoGain.gain.setValueAtTime(params.lfoAmount / 100 * params.filterCutoff * 0.5, now);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
      } else if (params.lfoTarget === 'pitch') {
        lfoGain.gain.setValueAtTime(params.lfoAmount / 100 * 50, now); // 50 cents max
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.detune);
        lfoGain.connect(osc2.detune);
      }
      
      lfo.start(now);
      lfo.stop(now + params.envAttack + params.envDecay + duration + params.envRelease);
      
      staticActiveNodes.current.add(lfo);
      if (lfoGain) staticActiveNodes.current.add(lfoGain);
    }
    
    // Amplitude Envelope with fade-out for smooth cleanup
    const ampEnv = audioContext.createGain();
    ampEnv.gain.setValueAtTime(0, now);
    ampEnv.gain.linearRampToValueAtTime(1, now + params.envAttack);
    ampEnv.gain.linearRampToValueAtTime(params.envSustain, now + params.envAttack + params.envDecay);
    ampEnv.gain.linearRampToValueAtTime(0, now + params.envAttack + params.envDecay + duration + params.envRelease);
    
    // Connect audio graph
    osc1.connect(osc1Gain);
    osc2.connect(osc2Gain);
    
    osc1Gain.connect(filter);
    osc2Gain.connect(filter);
    filter.connect(ampEnv);
    ampEnv.connect(synthGainNode);
    
    // Track active nodes for cleanup
    staticActiveNodes.current.add(osc1);
    staticActiveNodes.current.add(osc2);
    staticActiveNodes.current.add(osc1Gain);
    staticActiveNodes.current.add(osc2Gain);
    staticActiveNodes.current.add(filter);
    staticActiveNodes.current.add(ampEnv);
    
    // Start and stop
    osc1.start(now);
    osc2.start(now);
    
    const stopTime = now + params.envAttack + params.envDecay + duration + params.envRelease;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    
    // Clean up nodes from tracking after they stop
    setTimeout(() => {
      staticActiveNodes.current.delete(osc1);
      staticActiveNodes.current.delete(osc2);
      staticActiveNodes.current.delete(osc1Gain);
      staticActiveNodes.current.delete(osc2Gain);
      staticActiveNodes.current.delete(filter);
      staticActiveNodes.current.delete(ampEnv);
      if (lfo) staticActiveNodes.current.delete(lfo);
      if (lfoGain) staticActiveNodes.current.delete(lfoGain);
    }, (stopTime - now) * 1000 + 100);
  }, [audioContext, params, synthGainNode, synthPanNode]);

  // Function to stop all sounds
  const stopAllSounds = useCallback(() => {
    if (!audioContext) return;
    
    const now = audioContext.currentTime;
    
    // Fade out all active nodes to avoid clicks
    staticActiveNodes.current.forEach(node => {
      if (node instanceof OscillatorNode) {
        try {
          node.stop(now + 0.1);
        } catch (e) {
          // Ignore errors if node is already stopped
        }
      } else if (node instanceof GainNode) {
        node.gain.linearRampToValueAtTime(0, now + 0.1);
      }
    });
    
    // Clear the set after a short delay
    setTimeout(() => {
      staticActiveNodes.current.clear();
    }, 200);
  }, [audioContext]);

  return (
    <MS20SynthContext.Provider
      value={{
        params,
        setParams,
        notePattern,
        setNotePattern,
        currentOctave,
        setCurrentOctave,
        synthGainNode,
        synthPanNode,
        playNote,
        stopAllSounds
      }}
    >
      {children}
    </MS20SynthContext.Provider>
  );
};