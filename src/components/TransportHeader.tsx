import React from 'react';
import { Play, Pause, Square, RotateCcw, Shuffle, Settings, Volume2, VolumeX } from 'lucide-react';
import { useGlobalSync } from '../contexts/GlobalSync';
import { useAudioContext } from '../contexts/AudioContext';

const TransportHeader: React.FC = () => {
  const { isPlaying, bpm, play, stop, setBPM } = useGlobalSync();
  const { isAudioReady, initializeAudio } = useAudioContext();

  const handleBPMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBPM(parseInt(e.target.value));
  };

  const generateRandom = () => {
    // This will be implemented in the DrumMachine component
    window.dispatchEvent(new CustomEvent('generateRandom'));
  };

  const clearAll = () => {
    // This will be implemented in the DrumMachine component
    window.dispatchEvent(new CustomEvent('clearAll'));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-800/30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🎵</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Music Studio
              </h1>
            </div>
            {/* Audio Status Indicator */}
            <div className="flex items-center space-x-2">
              {isAudioReady ? (
                <div className="flex items-center space-x-1 text-green-400">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">Audio Ready</span>
                </div>
              ) : (
                <button
                  onClick={initializeAudio}
                  className="flex items-center space-x-1 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <VolumeX className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">Click to Enable Audio</span>
                </button>
              )}
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Play/Pause */}
            <button
              onClick={isPlaying ? stop : play}
              className={`p-2 sm:p-3 rounded-full transition-all duration-300 ${
                isPlaying 
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30' 
                  : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Stop */}
            <button
              onClick={stop}
              className="p-2 sm:p-3 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30"
            >
              <Square className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Random */}
            <button
              onClick={generateRandom}
              className="p-2 sm:p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Clear */}
            <button
              onClick={clearAll}
              className="p-2 sm:p-3 rounded-full bg-purple-500 hover:bg-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/30"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* BPM Control */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-xs sm:text-sm font-medium text-gray-300">BPM</span>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="60"
                max="200"
                value={bpm}
                onChange={handleBPMChange}
                className="w-16 sm:w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="min-w-[3rem] text-center">
                <span className="text-sm sm:text-base font-bold text-cyan-400">{bpm}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TransportHeader;