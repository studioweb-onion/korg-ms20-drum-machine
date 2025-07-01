import React from 'react';

interface PatternGridProps {
  pattern: boolean[][];
  onToggleStep: (track: number, step: number) => void;
  currentStep: number;
  trackNames: string[];
  trackVolumes: number[];
  onVolumeChange: (volumes: number[]) => void;
}

const PatternGrid: React.FC<PatternGridProps> = ({
  pattern,
  onToggleStep,
  currentStep,
  trackNames,
  trackVolumes,
  onVolumeChange
}) => {
  const trackColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96c93d',
    '#f39c12', '#9b59b6', '#e74c3c', '#1abc9c'
  ];

  const handleVolumeChange = (track: number, value: number) => {
    const newVolumes = [...trackVolumes];
    newVolumes[track] = value / 100;
    onVolumeChange(newVolumes);
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-800/30">
      <h3 className="text-xl font-semibold mb-6 text-center text-purple-300">Pattern Grid</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header with step numbers */}
          <div className="grid grid-cols-[120px_repeat(16,1fr)] gap-1 mb-4">
            <div className="text-center text-sm font-medium text-gray-400">Track</div>
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="text-center text-xs font-medium text-purple-400">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Pattern rows */}
          {pattern.map((trackPattern, trackIndex) => (
            <div key={trackIndex} className="grid grid-cols-[120px_repeat(16,1fr)] gap-1 mb-3">
              <div className="flex items-center bg-gray-800/50 rounded-lg p-2">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: trackColors[trackIndex] }}
                />
                <span className="text-sm font-medium">{trackNames[trackIndex]}</span>
              </div>
              
              {trackPattern.map((isActive, stepIndex) => (
                <button
                  key={stepIndex}
                  onClick={() => onToggleStep(trackIndex, stepIndex)}
                  className={`
                    h-8 rounded transition-all duration-200 border-2
                    ${isActive 
                      ? 'border-white shadow-lg transform scale-105' 
                      : 'border-gray-600 hover:border-gray-400'
                    }
                    ${stepIndex === currentStep 
                      ? 'ring-2 ring-cyan-400 ring-opacity-75' 
                      : ''
                    }
                  `}
                  style={{
                    backgroundColor: isActive ? trackColors[trackIndex] : 'rgba(55, 65, 81, 0.5)'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Volume controls */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h4 className="text-lg font-medium mb-4 text-purple-300">Track Volumes</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {trackNames.map((name, index) => (
            <div key={index} className="text-center">
              <label className="block text-xs font-medium mb-2 text-gray-300">{name}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={trackVolumes[index] * 100}
                onChange={(e) => handleVolumeChange(index, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                {Math.round(trackVolumes[index] * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatternGrid;