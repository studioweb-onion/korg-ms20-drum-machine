import React from 'react';
import { Volume2, Sliders } from 'lucide-react';

interface SoundParams {
  pitch: number;
  attack: number;
  decay: number;
  release: number;
  filter: number;
  resonance: number;
  drive: number;
  reverb: number;
  waveform: number;
}

interface SoundDesignerProps {
  currentTrack: number;
  onTrackChange: (track: number) => void;
  soundParams: SoundParams[];
  onParamsChange: (params: SoundParams[]) => void;
  trackNames: string[];
  onPlaySound: (track: number) => void;
}

const SoundDesigner: React.FC<SoundDesignerProps> = ({
  currentTrack,
  onTrackChange,
  soundParams,
  onParamsChange,
  trackNames,
  onPlaySound
}) => {
  const currentParams = soundParams[currentTrack];

  const updateParam = (param: keyof SoundParams, value: number) => {
    const newParams = [...soundParams];
    newParams[currentTrack] = { ...newParams[currentTrack], [param]: value };
    onParamsChange(newParams);
  };

  const waveforms = ['Sine', 'Square', 'Sawtooth', 'Triangle'];

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-800/30">
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-purple-300">Sound Designer</h3>
      </div>

      {/* Track Selector */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
        {trackNames.map((name, index) => (
          <button
            key={index}
            onClick={() => {
              onTrackChange(index);
              onPlaySound(index);
            }}
            className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentTrack === index
                ? 'bg-purple-500 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Sound Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Pitch */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-purple-300 mb-2">PITCH</label>
          <input
            type="range"
            min="-24"
            max="24"
            value={currentParams.pitch}
            onChange={(e) => updateParam('pitch', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-400 mt-1">{currentParams.pitch}</div>
        </div>

        {/* Attack */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-purple-300 mb-2">ATTACK</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentParams.attack}
            onChange={(e) => updateParam('attack', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-400 mt-1">{currentParams.attack.toFixed(2)}s</div>
        </div>

        {/* Decay */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-purple-300 mb-2">DECAY</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={currentParams.decay}
            onChange={(e) => updateParam('decay', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-400 mt-1">{currentParams.decay.toFixed(1)}s</div>
        </div>

        {/* Filter */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-purple-300 mb-2">FILTER</label>
          <input
            type="range"
            min="100"
            max="8000"
            value={currentParams.filter}
            onChange={(e) => updateParam('filter', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-400 mt-1">{currentParams.filter}Hz</div>
        </div>

        {/* Drive */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-purple-300 mb-2">DRIVE</label>
          <input
            type="range"
            min="0"
            max="100"
            value={currentParams.drive}
            onChange={(e) => updateParam('drive', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-400 mt-1">{currentParams.drive}%</div>
        </div>

        {/* Reverb */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-purple-300 mb-2">REVERB</label>
          <input
            type="range"
            min="0"
            max="100"
            value={currentParams.reverb}
            onChange={(e) => updateParam('reverb', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-400 mt-1">{currentParams.reverb}%</div>
        </div>

        {/* Waveform */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-purple-300 mb-2">WAVEFORM</label>
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={currentParams.waveform}
            onChange={(e) => updateParam('waveform', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-400 mt-1">{waveforms[currentParams.waveform]}</div>
        </div>

        {/* Preview Button */}
        <div className="bg-gray-800/50 rounded-lg p-4 flex items-center">
          <button
            onClick={() => onPlaySound(currentTrack)}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoundDesigner;