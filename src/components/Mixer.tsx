import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Sliders, Headphones, Settings } from 'lucide-react';
import { useAudioContext } from '../contexts/AudioContext';
import { useDrumMachine } from '../contexts/DrumMachineContext';
import { useMS20Synth } from '../contexts/MS20SynthContext';

const Mixer: React.FC = () => {
  const { audioContext } = useAudioContext();
  const { trackGainNodes, trackPanNodes, masterGainNode, trackVolumes, setTrackVolumes } = useDrumMachine();
  const { synthGainNode, synthPanNode, params, setParams } = useMS20Synth();
  
  // Early return if essential data is not available
  if (!trackVolumes || !trackGainNodes || !trackPanNodes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading mixer...</div>
      </div>
    );
  }
  // Utilizziamo il volume dal contesto MS20SynthContext
  const [synthVolume, setSynthVolume] = useState(() => params.volume);
  const [masterVolume, setMasterVolume] = useState(85);
  const [drumPan, setDrumPan] = useState([0, 0, -20, 20, 0, -30, 30, 0]);
  const [synthPan, setSynthPan] = useState(0);
  const [reverbSend, setReverbSend] = useState(30);
  const [delaySend, setDelaySend] = useState(15);
  
  // Audio meters state
  const [drumLevels, setDrumLevels] = useState(Array(8).fill(0));
  const [synthLevel, setSynthLevel] = useState(0);
  const [masterLevel, setMasterLevel] = useState(0);
  
  const analysersRef = useRef<AnalyserNode[]>([]);
  const synthAnalyserRef = useRef<AnalyserNode | null>(null);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const trackNames = ['Kick', 'Snare', 'Hi-Hat', 'Open Hat', 'Crash', 'Perc 1', 'Perc 2', 'Clap'];
  const trackColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96c93d', '#f39c12', '#9b59b6', '#e74c3c', '#1abc9c'];

  // Initialize audio analysers for meters
  useEffect(() => {
    if (!audioContext || !trackGainNodes || trackGainNodes.length === 0 || !masterGainNode || !synthGainNode) return;

    // Create analysers for each track and connect them
    const newAnalysers: AnalyserNode[] = [];
    trackGainNodes.forEach((gainNode, _) => {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      // Disconnect the gain node from master and reconnect through analyser
      gainNode.disconnect();
      gainNode.connect(analyser);
      analyser.connect(masterGainNode);
      
      newAnalysers.push(analyser);
    });
    
    // Create synth analyser
    const synthAnalyser = audioContext.createAnalyser();
    synthAnalyser.fftSize = 256;
    synthAnalyser.smoothingTimeConstant = 0.8;
    
    // Connect synth gain through analyser to master
    if (synthPanNode) {
      synthPanNode.disconnect();
      synthGainNode.connect(synthAnalyser);
      synthAnalyser.connect(masterGainNode);
    }
    
    // Create master analyser
    const masterAnalyser = audioContext.createAnalyser();
    masterAnalyser.fftSize = 256;
    masterAnalyser.smoothingTimeConstant = 0.8;
    
    // Connect master gain through analyser to destination
    masterGainNode.disconnect();
    masterGainNode.connect(masterAnalyser);
    masterAnalyser.connect(audioContext.destination);
    
    analysersRef.current = newAnalysers;
    synthAnalyserRef.current = synthAnalyser;
    masterAnalyserRef.current = masterAnalyser;

    // Start meter animation
    const updateMeters = () => {
      const newDrumLevels = analysersRef.current.map(analyser => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate RMS level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        return Math.min(100, (rms / 255) * 100);
      });
      
      setDrumLevels(newDrumLevels);
      
      // Calculate synth level
      if (synthAnalyserRef.current) {
        const synthDataArray = new Uint8Array(synthAnalyserRef.current.frequencyBinCount);
        synthAnalyserRef.current.getByteFrequencyData(synthDataArray);
        
        let synthSum = 0;
        for (let i = 0; i < synthDataArray.length; i++) {
          synthSum += synthDataArray[i] * synthDataArray[i];
        }
        const synthRms = Math.sqrt(synthSum / synthDataArray.length);
        setSynthLevel(Math.min(100, (synthRms / 255) * 100));
      }
      
      // Calculate master level from master analyser
      if (masterAnalyserRef.current) {
        const masterDataArray = new Uint8Array(masterAnalyserRef.current.frequencyBinCount);
        masterAnalyserRef.current.getByteFrequencyData(masterDataArray);
        
        let masterSum = 0;
        for (let i = 0; i < masterDataArray.length; i++) {
          masterSum += masterDataArray[i] * masterDataArray[i];
        }
        const masterRms = Math.sqrt(masterSum / masterDataArray.length);
        setMasterLevel(Math.min(100, (masterRms / 255) * 100));
      }
      
      animationFrameRef.current = requestAnimationFrame(updateMeters);
    };

    updateMeters();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioContext, trackGainNodes, masterGainNode, synthGainNode, synthPanNode, masterVolume]);

  const handleDrumVolumeChange = (index: number, value: number) => {
    const newVolumes = [...trackVolumes];
    newVolumes[index] = value;
    setTrackVolumes(newVolumes);
    
    // Update the gain node value immediately
    if (trackGainNodes[index]) {
      trackGainNodes[index].gain.value = value / 100;
    }
  };

  const handleDrumPanChange = (index: number, value: number) => {
    const newPan = [...drumPan];
    newPan[index] = value;
    setDrumPan(newPan);
    
    // Update the pan node value immediately
    if (trackPanNodes[index]) {
      trackPanNodes[index].pan.value = value / 50; // Convert -50/+50 to -1/+1
    }
  };
  
  // Effetto per aggiornare il volume del sintetizzatore quando cambia
  useEffect(() => {
    if (synthGainNode) {
      synthGainNode.gain.value = synthVolume / 100 * 0.3;
      // Aggiorna anche il parametro nel contesto
      setParams(prevParams => ({...prevParams, volume: synthVolume}));
    }
  }, [synthVolume, synthGainNode, setParams]);
  
  // Effetto per aggiornare il pan del sintetizzatore quando cambia
  useEffect(() => {
    if (synthPanNode) {
      synthPanNode.pan.value = synthPan / 50; // Convert -50/+50 to -1/+1
    }
  }, [synthPan, synthPanNode]);
  
  // Gestori per i controlli del riverbero e del delay
  const handleReverbSendChange = (value: number) => {
    setReverbSend(value);
    // Qui implementeremo la connessione al nodo di riverbero quando lo aggiungeremo
  };
  
  const handleDelaySendChange = (value: number) => {
    setDelaySend(value);
    // Qui implementeremo la connessione al nodo di delay quando lo aggiungeremo
  };

  const formatPan = (value: number) => {
    if (value === 0) return 'Center';
    return value < 0 ? `L${Math.abs(value)}` : `R${value}`;
  };

  const MeterBar: React.FC<{ level: number; color: string }> = ({ level, color }) => (
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
      <div 
        className="h-full transition-all duration-75 ease-out rounded-full"
        style={{
          width: `${level}%`,
          background: level > 80 
            ? 'linear-gradient(90deg, #ef4444, #dc2626)' // Red for clipping
            : level > 60 
            ? 'linear-gradient(90deg, #f59e0b, #d97706)' // Orange for high
            : `linear-gradient(90deg, ${color}, ${color}dd)` // Normal color
        }}
      />
    </div>
  );

  const VUMeter: React.FC<{ level: number; height?: string }> = ({ level, height = "h-20" }) => (
    <div className={`w-4 bg-gray-800 rounded-full overflow-hidden ${height} flex flex-col-reverse`}>
      <div 
        className="w-full transition-all duration-75 ease-out"
        style={{
          height: `${level}%`,
          background: level > 80 
            ? 'linear-gradient(0deg, #ef4444, #dc2626)' // Red
            : level > 60 
            ? 'linear-gradient(0deg, #f59e0b, #d97706)' // Orange
            : level > 40
            ? 'linear-gradient(0deg, #eab308, #ca8a04)' // Yellow
            : 'linear-gradient(0deg, #22c55e, #16a34a)' // Green
        }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          Mixing Console
        </h2>
        <p className="text-gray-400">Professional audio mixing and mastering</p>
      </div>

      {/* Master Section */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-green-800/30">
        <div className="flex items-center gap-2 mb-6">
          <Volume2 className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-semibold text-green-300">Master Output</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-green-300 mb-2">MASTER VOLUME</label>
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => {
                const newVolume = parseInt(e.target.value);
                setMasterVolume(newVolume);
                // Update the master gain node value immediately
                if (masterGainNode) {
                  masterGainNode.gain.value = newVolume / 100;
                }
              }}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2">
              <span className="text-lg font-bold text-green-400">{masterVolume}%</span>
            </div>
            <div className="mt-3">
              <MeterBar level={masterLevel} color="#22c55e" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-green-300 mb-2">MASTER METER</label>
            <div className="flex justify-center items-end h-24">
              <VUMeter level={masterLevel} height="h-20" />
            </div>
            <div className="text-center mt-2">
              <span className="text-sm text-green-400">{Math.round(masterLevel)}dB</span>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-green-300 mb-2">HEADPHONE LEVEL</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="75"
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2">
              <Headphones className="w-6 h-6 text-green-400 mx-auto" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-green-300 mb-2">MASTER EQ</label>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" />
              EQ Settings
            </button>
          </div>
        </div>
      </div>

      {/* Drum Machine Mixer */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-800/30">
        <div className="flex items-center gap-2 mb-6">
          <Sliders className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-purple-300">Drum Machine Channels</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {trackNames.map((name, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-center mb-3">
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: trackColors[index] }}
                />
                <span className="text-xs font-medium text-gray-300">{name}</span>
              </div>
              
              {/* Meter */}
              <div className="flex justify-center mb-3">
                <VUMeter level={drumLevels[index]} height="h-16" />
              </div>
              
              {/* Volume */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">VOL</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trackVolumes[index]}
                  onChange={(e) => handleDrumVolumeChange(index, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, ${trackColors[index]} 0%, ${trackColors[index]} ${trackVolumes[index]}%, #374151 ${trackVolumes[index]}%, #374151 100%)`
                  }}
                />
                <div className="text-xs text-center text-gray-400 mt-1">{trackVolumes[index]}%</div>
              </div>
              
              {/* Pan */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">PAN</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={drumPan[index]}
                  onChange={(e) => handleDrumPanChange(index, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-center text-gray-400 mt-1">{formatPan(drumPan[index])}</div>
              </div>
              

            </div>
          ))}
        </div>
      </div>

      {/* Synthesizer Mixer */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-800/30">
        <div className="flex items-center gap-2 mb-6">
          <Sliders className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-semibold text-cyan-300">MS20 Synthesizer Channel</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-cyan-300 mb-2">SYNTH METER</label>
            <div className="flex justify-center items-end h-24">
              <VUMeter level={synthLevel} height="h-20" />
            </div>
            <div className="text-center mt-2">
              <span className="text-sm text-cyan-400">{Math.round(synthLevel)}dB</span>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-cyan-300 mb-2">SYNTH VOLUME</label>
            <input
              type="range"
              min="0"
              max="100"
              value={synthVolume}
              onChange={(e) => setSynthVolume(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2">
              <span className="text-lg font-bold text-cyan-400">{synthVolume}%</span>
            </div>
            <div className="mt-3">
              <MeterBar level={synthLevel} color="#06b6d4" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-cyan-300 mb-2">SYNTH PAN</label>
            <input
              type="range"
              min="-50"
              max="50"
              value={synthPan}
              onChange={(e) => setSynthPan(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2">
              <span className="text-sm text-cyan-400">{formatPan(synthPan)}</span>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-cyan-300 mb-2">REVERB SEND</label>
            <input
              type="range"
              min="0"
              max="100"
              value={reverbSend}
              onChange={(e) => handleReverbSendChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2">
              <span className="text-sm text-cyan-400">{reverbSend}%</span>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-cyan-300 mb-2">DELAY SEND</label>
            <input
              type="range"
              min="0"
              max="100"
              value={delaySend}
              onChange={(e) => handleDelaySendChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2">
              <span className="text-sm text-cyan-400">{delaySend}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Effects Section */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-orange-800/30">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-semibold text-orange-300">Global Effects</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-orange-300 mb-4">MASTER REVERB</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Room Size</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="40"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Decay Time</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Wet/Dry</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="25"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-orange-300 mb-4">MASTER COMPRESSOR</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Threshold</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="60"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Ratio</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="30"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Makeup Gain</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="20"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mixer;