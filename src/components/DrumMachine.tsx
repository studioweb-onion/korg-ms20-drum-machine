import React, { useEffect, useState } from 'react';
import { useGlobalSync } from '../contexts/GlobalSync';
import { useDrumMachine } from '../contexts/DrumMachineContext';
import PatternGrid from './drum/PatternGrid';
import AIPatternGenerator from './drum/AIPatternGenerator';
import SoundDesigner from './drum/SoundDesigner';

const DrumMachine: React.FC = () => {
  const { currentStep } = useGlobalSync();
  const { 
    pattern, 
    setPattern, 
    trackVolumes, 
    setTrackVolumes, 
    soundParams, 
    setSoundParams,
    playSound,
    toggleStep
  } = useDrumMachine();
  const [currentEditTrack, setCurrentEditTrack] = useState(0);

  const trackNames = ['Kick', 'Snare', 'Hi-Hat', 'Open Hat', 'Crash', 'Perc 1', 'Perc 2', 'Clap'];







  // Il callback della drum machine è ora gestito globalmente in App.tsx

  // Handle random pattern generation
  useEffect(() => {
    const handleRandom = () => {
      const newPattern = Array(8).fill(null).map(() => Array(16).fill(false));
      
      for (let track = 0; track < 8; track++) {
        for (let step = 0; step < 16; step++) {
          let probability = 0.2;
          if (track === 0) probability = 0.4; // Kick
          if (track === 1) probability = 0.3; // Snare
          if (track === 2) probability = 0.6; // Hi-hat
          
          newPattern[track][step] = Math.random() < probability;
        }
      }
      
      setPattern(newPattern);
    };

    const handleClear = () => {
      setPattern(Array(8).fill(null).map(() => Array(16).fill(false)));
    };

    window.addEventListener('generateRandom', handleRandom);
    window.addEventListener('clearAll', handleClear);

    return () => {
      window.removeEventListener('generateRandom', handleRandom);
      window.removeEventListener('clearAll', handleClear);
    };
  }, [setPattern]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          AI Drum Machine
        </h2>
        <p className="text-gray-400">Create beats with AI-powered pattern generation</p>
      </div>

      <AIPatternGenerator 
        onPatternGenerated={setPattern}
        trackNames={trackNames}
      />

      <SoundDesigner
        currentTrack={currentEditTrack}
        onTrackChange={setCurrentEditTrack}
        soundParams={soundParams}
        onParamsChange={setSoundParams}
        trackNames={trackNames}
        onPlaySound={playSound}
      />

      <PatternGrid
        pattern={pattern}
        onToggleStep={toggleStep}
        currentStep={currentStep}
        trackNames={trackNames}
        trackVolumes={trackVolumes}
        onVolumeChange={setTrackVolumes}
      />
    </div>
  );
};

export default DrumMachine;