import React, { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';

interface AIPatternGeneratorProps {
  onPatternGenerated: (pattern: boolean[][]) => void;
  trackNames: string[];
}

const AIPatternGenerator: React.FC<AIPatternGeneratorProps> = ({ 
  onPatternGenerated, 
  trackNames 
}) => {
  const [aiInput, setAiInput] = useState('');

  const presets = [
    'rock', 'funk', 'latin', 'jazz', 'reggae', 'electronic',
    'ballad', 'shuffle', 'hiphop', 'trap', 'house', 'techno',
    'dubstep', 'dnb', 'afrobeat', 'bossa', 'blues', 'metal',
    'ambient', 'breakbeat'
  ];

  const generatePattern = (type: string) => {
    const newPattern: boolean[][] = Array(8).fill(null).map(() => Array(16).fill(false));
    
    switch(type) {
      case 'rock':
        // Kick: 1, 9 (strong backbeat)
        newPattern[0][0] = newPattern[0][8] = true;
        // Snare: 5, 13 (2 and 4)
        newPattern[1][4] = newPattern[1][12] = true;
        // Hi-hat: every 8th note
        for (let i = 0; i < 16; i += 2) newPattern[2][i] = true;
        // Crash on 1
        newPattern[4][0] = true;
        break;
        
      case 'funk':
        // Kick: syncopated pattern
        newPattern[0][0] = newPattern[0][6] = newPattern[0][10] = true;
        // Snare: 5, 13 with ghost notes
        newPattern[1][4] = newPattern[1][12] = true;
        newPattern[1][2] = newPattern[1][10] = true; // ghost notes
        // Hi-hat: 16th note pattern
        for (let i = 0; i < 16; i++) newPattern[2][i] = true;
        // Open hat on off-beats
        newPattern[3][6] = newPattern[3][14] = true;
        break;
        
      case 'latin':
        // Kick: Latin clave pattern
        newPattern[0][0] = newPattern[0][6] = newPattern[0][10] = true;
        // Snare: cross-stick pattern
        newPattern[1][4] = newPattern[1][12] = true;
        // Hi-hat: steady 8th notes
        for (let i = 0; i < 16; i += 2) newPattern[2][i] = true;
        // Perc 1: conga pattern
        newPattern[5][2] = newPattern[5][6] = newPattern[5][10] = newPattern[5][14] = true;
        // Perc 2: bongo pattern
        newPattern[6][1] = newPattern[6][5] = newPattern[6][9] = newPattern[6][13] = true;
        break;
        
      case 'jazz':
        // Kick: walking pattern
        newPattern[0][0] = newPattern[0][12] = true;
        // Snare: 2 and 4 with brushes
        newPattern[1][4] = newPattern[1][12] = true;
        // Hi-hat: swing pattern
        newPattern[2][0] = newPattern[2][3] = newPattern[2][6] = newPattern[2][9] = newPattern[2][12] = newPattern[2][15] = true;
        // Open hat: swing accents
        newPattern[3][6] = newPattern[3][14] = true;
        break;
        
      case 'reggae':
        // Kick: one drop pattern
        newPattern[0][8] = true; // only on 3
        // Snare: 2 and 4
        newPattern[1][4] = newPattern[1][12] = true;
        // Hi-hat: skank pattern
        newPattern[2][2] = newPattern[2][6] = newPattern[2][10] = newPattern[2][14] = true;
        // Open hat: emphasis
        newPattern[3][4] = newPattern[3][12] = true;
        break;
        
      case 'house':
        // Kick: four on the floor
        for (let i = 0; i < 16; i += 4) newPattern[0][i] = true;
        // Snare: 2 and 4
        newPattern[1][4] = newPattern[1][12] = true;
        // Hi-hat: 8th notes
        for (let i = 0; i < 16; i += 2) newPattern[2][i] = true;
        // Open hat: off-beat
        newPattern[3][8] = true;
        break;
        
      case 'trap':
        // Kick: trap pattern
        newPattern[0][0] = newPattern[0][6] = newPattern[0][8] = newPattern[0][14] = true;
        // Snare: 2 and 4
        newPattern[1][4] = newPattern[1][12] = true;
        // Hi-hat: rapid 16th notes
        for (let i = 0; i < 16; i += 2) newPattern[2][i] = true;
        // Clap: trap claps
        newPattern[7][2] = newPattern[7][6] = newPattern[7][10] = newPattern[7][14] = true;
        break;
        
      case 'techno':
        // Kick: four on the floor
        for (let i = 0; i < 16; i += 4) newPattern[0][i] = true;
        // Snare: minimal
        newPattern[1][4] = newPattern[1][12] = true;
        // Hi-hat: 16th notes
        for (let i = 0; i < 16; i++) newPattern[2][i] = true;
        // Perc: techno percussion
        newPattern[5][1] = newPattern[5][5] = newPattern[5][9] = newPattern[5][13] = true;
        break;
        
      case 'dubstep':
        // Kick: dubstep pattern
        newPattern[0][0] = newPattern[0][8] = true;
        // Snare: syncopated
        newPattern[1][4] = newPattern[1][6] = newPattern[1][12] = newPattern[1][14] = true;
        // Hi-hat: sparse
        newPattern[2][2] = newPattern[2][10] = true;
        // Perc: wobble rhythm
        newPattern[6][1] = newPattern[6][3] = newPattern[6][9] = newPattern[6][11] = true;
        break;
        
      case 'dnb':
        // Kick: drum and bass pattern
        newPattern[0][0] = newPattern[0][10] = true;
        // Snare: amen break inspired
        newPattern[1][4] = newPattern[1][13] = true;
        // Hi-hat: fast pattern
        for (let i = 0; i < 16; i += 2) newPattern[2][i] = true;
        // Perc: jungle breaks
        newPattern[5][2] = newPattern[5][6] = newPattern[5][11] = newPattern[5][15] = true;
        break;
        
      case 'afrobeat':
        // Kick: afrobeat pattern
        newPattern[0][0] = newPattern[0][6] = newPattern[0][12] = true;
        // Snare: cross-stick
        newPattern[1][4] = newPattern[1][10] = true;
        // Hi-hat: steady
        for (let i = 0; i < 16; i += 2) newPattern[2][i] = true;
        // Perc 1: talking drum pattern
        newPattern[5][1] = newPattern[5][3] = newPattern[5][7] = newPattern[5][11] = newPattern[5][15] = true;
        // Perc 2: shaker pattern
        newPattern[6][2] = newPattern[6][6] = newPattern[6][10] = newPattern[6][14] = true;
        break;
        
      case 'bossa':
        // Kick: bossa nova pattern
        newPattern[0][0] = newPattern[0][8] = true;
        // Snare: rim shot
        newPattern[1][6] = newPattern[1][14] = true;
        // Hi-hat: bossa rhythm
        newPattern[2][2] = newPattern[2][5] = newPattern[2][8] = newPattern[2][11] = true;
        // Perc: shaker
        newPattern[5][1] = newPattern[5][9] = true;
        break;
        
      case 'blues':
        // Kick: shuffle feel
        newPattern[0][0] = newPattern[0][12] = true;
        // Snare: 2 and 4
        newPattern[1][6] = newPattern[1][14] = true;
        // Hi-hat: shuffle pattern
        newPattern[2][2] = newPattern[2][5] = newPattern[2][8] = newPattern[2][11] = newPattern[2][14] = true;
        break;
        
      case 'metal':
        // Kick: double bass
        newPattern[0][0] = newPattern[0][2] = newPattern[0][8] = newPattern[0][10] = true;
        // Snare: 2 and 4
        newPattern[1][4] = newPattern[1][12] = true;
        // Hi-hat: 8th notes
        for (let i = 0; i < 16; i += 2) newPattern[2][i] = true;
        // Crash: accents
        newPattern[4][0] = newPattern[4][8] = true;
        break;
        
      case 'ambient':
        // Kick: minimal
        newPattern[0][0] = true;
        // Snare: sparse
        newPattern[1][8] = true;
        // Hi-hat: atmospheric
        newPattern[2][4] = newPattern[2][12] = true;
        // Crash: texture
        newPattern[4][0] = newPattern[4][8] = true;
        break;
        
      case 'breakbeat':
        // Kick: amen break pattern
        newPattern[0][0] = newPattern[0][10] = true;
        // Snare: classic break
        newPattern[1][4] = newPattern[1][6] = newPattern[1][13] = true;
        // Hi-hat: breakbeat pattern
        newPattern[2][2] = newPattern[2][5] = newPattern[2][8] = newPattern[2][11] = newPattern[2][14] = true;
        // Perc: break elements
        newPattern[5][3] = newPattern[5][7] = newPattern[5][15] = true;
        break;
        
      case 'hiphop':
        // Kick: hip hop pattern
        newPattern[0][0] = newPattern[0][8] = true;
        // Snare: 2 and 4
        newPattern[1][4] = newPattern[1][12] = true;
        // Hi-hat: hip hop rhythm
        newPattern[2][2] = newPattern[2][6] = newPattern[2][10] = newPattern[2][14] = true;
        // Clap: hip hop claps
        newPattern[7][6] = newPattern[7][14] = true;
        break;
        
      case 'shuffle':
        // Kick: shuffle pattern
        newPattern[0][0] = newPattern[0][8] = true;
        // Snare: shuffle snare
        newPattern[1][4] = newPattern[1][12] = true;
        // Hi-hat: shuffle feel
        newPattern[2][2] = newPattern[2][5] = newPattern[2][8] = newPattern[2][11] = newPattern[2][14] = true;
        break;
        
      case 'ballad':
        // Kick: simple pattern
        newPattern[0][0] = newPattern[0][12] = true;
        // Snare: soft 2 and 4
        newPattern[1][8] = true;
        // Hi-hat: gentle
        newPattern[2][4] = newPattern[2][12] = true;
        break;
        
      default:
        // Generate random pattern
        for (let track = 0; track < 8; track++) {
          for (let step = 0; step < 16; step++) {
            let probability = 0.2;
            if (track === 0) probability = 0.4; // Kick
            if (track === 1) probability = 0.3; // Snare
            if (track === 2) probability = 0.6; // Hi-hat
            
            newPattern[track][step] = Math.random() < probability;
          }
        }
    }
    
    onPatternGenerated(newPattern);
  };

  const handleAIGenerate = () => {
    const input = aiInput.toLowerCase();
    let patternType = 'random';
    
    for (const preset of presets) {
      if (input.includes(preset)) {
        patternType = preset;
        break;
      }
    }
    
    generatePattern(patternType);
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-800/30">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-purple-300">AI Pattern Generator</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Describe the rhythm you want... e.g. 'powerful rock groove' or 'latin rhythm'"
            className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            rows={3}
          />
        </div>
        
        <button
          onClick={handleAIGenerate}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Wand2 className="w-5 h-5" />
          Generate Pattern
        </button>
        
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => generatePattern(preset)}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white text-xs py-2 px-3 rounded-md transition-all duration-200 capitalize"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIPatternGenerator;