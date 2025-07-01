import React, { useEffect, useCallback } from 'react';
import { useGlobalSync } from '../contexts/GlobalSync';
import { useMS20Synth } from '../contexts/MS20SynthContext';
import { Piano, RotateCcw } from 'lucide-react';

const MS20Synthesizer: React.FC = () => {
  const { currentStep, registerStepCallback, unregisterStepCallback, isPlaying } = useGlobalSync();
  const { 
    params, 
    setParams, 
    notePattern, 
    setNotePattern, 
    currentOctave, 
    setCurrentOctave,
    playNote,
    stopAllSounds
  } = useMS20Synth();
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Funzione per convertire il nome della nota e l'ottava in frequenza
  const getFrequency = useCallback((noteIndex: number) => {
    const noteName = noteNames[noteIndex];
    // Calcolo manuale della frequenza
    const noteFreqs: { [key: string]: number } = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };
    
    const baseFreq = noteFreqs[noteName];
    const octaveMultiplier = Math.pow(2, currentOctave - 4);
    return baseFreq * octaveMultiplier;
  }, [currentOctave, noteNames]);
  
  // Play step callback
  const playStep = useCallback(() => {
    for (let note = 0; note < 12; note++) {
      if (notePattern[note][currentStep]) {
        const frequency = getFrequency(note);
        playNote(frequency, 0.2);
      }
    }
  }, [notePattern, currentStep, getFrequency, playNote]);

  // Register step callback
  useEffect(() => {
    registerStepCallback(playStep);
    return () => unregisterStepCallback(playStep);
  }, [playStep, registerStepCallback, unregisterStepCallback]);

  // Stop all sounds when the global playback stops
  useEffect(() => {
    if (!isPlaying) {
      stopAllSounds();
    }
  }, [isPlaying, stopAllSounds]);

  const toggleNote = (note: number, step: number) => {
    const newPattern = [...notePattern];
    newPattern[note][step] = !newPattern[note][step];
    setNotePattern(newPattern);
    
    // Preview note
    if (newPattern[note][step]) {
      const frequency = getFrequency(note);
      playNote(frequency, 0.3);
    }
  };

  const clearPattern = () => {
    setNotePattern(Array(12).fill(null).map(() => Array(16).fill(false)));
    stopAllSounds(); // Stop all sounds when clearing the pattern
  };

  const playKeyboardNote = (note: string) => {
    // Trova l'indice della nota nel noteNames array
    const noteIndex = noteNames.indexOf(note);
    if (noteIndex !== -1) {
      const frequency = getFrequency(noteIndex);
      playNote(frequency, 0.5);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          KORG MS20 Synthesizer
        </h2>
        <p className="text-gray-400">Classic analog synthesizer emulation</p>
      </div>

      {/* MS20 Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Oscillator 1 Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-800/30">
          <h4 className="text-lg font-semibold text-cyan-300 mb-4">OSCILLATOR 1</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">FREQ RATIO</label>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={params.osc1Freq}
                onChange={(e) => setParams({...params, osc1Freq: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">×{params.osc1Freq}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">WAVEFORM</label>
              <select
                value={params.osc1Wave}
                onChange={(e) => setParams({...params, osc1Wave: e.target.value as OscillatorType})}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="sawtooth">Sawtooth</option>
                <option value="square">Square</option>
                <option value="triangle">Triangle</option>
                <option value="sine">Sine</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">DETUNE</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={params.osc1Detune}
                onChange={(e) => setParams({...params, osc1Detune: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.osc1Detune} cents</div>
            </div>
          </div>
        </div>

        {/* Oscillator 2 Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-800/30">
          <h4 className="text-lg font-semibold text-cyan-300 mb-4">OSCILLATOR 2</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">FREQ RATIO</label>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={params.osc2Freq}
                onChange={(e) => setParams({...params, osc2Freq: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">×{params.osc2Freq}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">WAVEFORM</label>
              <select
                value={params.osc2Wave}
                onChange={(e) => setParams({...params, osc2Wave: e.target.value as OscillatorType})}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="sawtooth">Sawtooth</option>
                <option value="square">Square</option>
                <option value="triangle">Triangle</option>
                <option value="sine">Sine</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">DETUNE</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={params.osc2Detune}
                onChange={(e) => setParams({...params, osc2Detune: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.osc2Detune} cents</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">OSC MIX</label>
              <input
                type="range"
                min="0"
                max="100"
                value={params.oscMix}
                onChange={(e) => setParams({...params, oscMix: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.oscMix}%</div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-800/30">
          <h4 className="text-lg font-semibold text-cyan-300 mb-4">FILTER</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CUTOFF</label>
              <input
                type="range"
                min="100"
                max="8000"
                value={params.filterCutoff}
                onChange={(e) => setParams({...params, filterCutoff: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.filterCutoff}Hz</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">RESONANCE</label>
              <input
                type="range"
                min="0"
                max="30"
                value={params.filterRes}
                onChange={(e) => setParams({...params, filterRes: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.filterRes}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ENV AMOUNT</label>
              <input
                type="range"
                min="0"
                max="100"
                value={params.filterEnvAmt}
                onChange={(e) => setParams({...params, filterEnvAmt: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.filterEnvAmt}%</div>
            </div>
          </div>
        </div>

        {/* Envelope Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-800/30">
          <h4 className="text-lg font-semibold text-cyan-300 mb-4">ENVELOPE</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ATTACK</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={params.envAttack}
                onChange={(e) => setParams({...params, envAttack: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.envAttack.toFixed(2)}s</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">DECAY</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.01"
                value={params.envDecay}
                onChange={(e) => setParams({...params, envDecay: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.envDecay.toFixed(2)}s</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">SUSTAIN</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={params.envSustain}
                onChange={(e) => setParams({...params, envSustain: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{(params.envSustain * 100).toFixed(0)}%</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">RELEASE</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.01"
                value={params.envRelease}
                onChange={(e) => setParams({...params, envRelease: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.envRelease.toFixed(2)}s</div>
            </div>
          </div>
        </div>

        {/* LFO Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-800/30">
          <h4 className="text-lg font-semibold text-cyan-300 mb-4">LFO</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">RATE</label>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={params.lfoRate}
                onChange={(e) => setParams({...params, lfoRate: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.lfoRate.toFixed(1)}Hz</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">AMOUNT</label>
              <input
                type="range"
                min="0"
                max="100"
                value={params.lfoAmount}
                onChange={(e) => setParams({...params, lfoAmount: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.lfoAmount}%</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">TARGET</label>
              <select
                value={params.lfoTarget}
                onChange={(e) => setParams({...params, lfoTarget: e.target.value as 'filter' | 'pitch'})}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="filter">Filter</option>
                <option value="pitch">Pitch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-800/30">
          <h4 className="text-lg font-semibold text-cyan-300 mb-4">OUTPUT</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">VOLUME</label>
              <input
                type="range"
                min="0"
                max="100"
                value={params.volume}
                onChange={(e) => setParams({...params, volume: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-400 mt-1">{params.volume}%</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">OCTAVE</label>
              <select
                value={currentOctave}
                onChange={(e) => setCurrentOctave(parseInt(e.target.value))}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Piano Roll */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-800/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Piano className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-semibold text-cyan-300">Piano Roll</h3>
          </div>
          
          <button
            onClick={clearPattern}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
        </div>

        {/* Piano Keyboard */}
        <div className="mb-6">
          <div className="flex space-x-1 justify-center">
            {noteNames.map((note) => {
              const isBlackKey = note.includes('#');
              return (
                <button
                  key={note}
                  onClick={() => playKeyboardNote(note)}
                  className={`
                    h-16 transition-all duration-200 font-medium text-sm
                    ${isBlackKey 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white w-8 -mx-2 z-10 rounded-b-lg' 
                      : 'bg-white hover:bg-gray-200 text-black w-12 border border-gray-300 rounded-b-lg'
                    }
                  `}
                >
                  {note}
                </button>
              );
            })}
          </div>
        </div>

        {/* Note Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="grid grid-cols-[80px_repeat(16,1fr)] gap-1 mb-2">
              <div></div>
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className={`
                  text-center text-xs font-medium py-1 rounded
                  ${i === currentStep 
                    ? 'bg-cyan-500 text-white' 
                    : 'text-cyan-400 bg-cyan-500/20'
                  }
                `}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Note rows */}
            {noteNames.slice().reverse().map((note, noteIndex) => {
              const actualNoteIndex = 11 - noteIndex;
              return (
                <div key={note} className="grid grid-cols-[80px_repeat(16,1fr)] gap-1 mb-1">
                  <div className={`
                    flex items-center justify-center text-sm font-medium rounded p-2
                    ${note.includes('#') 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-gray-100 text-black'
                    }
                  `}>
                    {note}{currentOctave}
                  </div>
                  
                  {Array.from({ length: 16 }, (_, stepIndex) => (
                    <button
                      key={stepIndex}
                      onClick={() => toggleNote(actualNoteIndex, stepIndex)}
                      className={`
                        h-8 rounded transition-all duration-200 border
                        ${notePattern[actualNoteIndex][stepIndex]
                          ? 'bg-cyan-500 border-white shadow-lg'
                          : 'bg-gray-700/50 border-gray-600 hover:border-gray-400'
                        }
                        ${stepIndex === currentStep 
                          ? 'ring-2 ring-cyan-400' 
                          : ''
                        }
                      `}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MS20Synthesizer;