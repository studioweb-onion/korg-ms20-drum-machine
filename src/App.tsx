import React, { useState, useEffect, useCallback } from 'react';
import DrumMachine from './components/DrumMachine';
import MS20Synthesizer from './components/MS20Synthesizer';
import Mixer from './components/Mixer';
import BottomNavigation from './components/BottomNavigation';
import TransportHeader from './components/TransportHeader';
import { AudioContextProvider, useAudioContext } from './contexts/AudioContext';
import { GlobalSyncProvider, useGlobalSync } from './contexts/GlobalSync';
import { DrumMachineProvider, useDrumMachine } from './contexts/DrumMachineContext';
import { MS20SynthProvider } from './contexts/MS20SynthContext';

// Componente che gestisce il callback della drum machine globalmente
const DrumMachineController: React.FC = () => {
  const { registerDrumCallback, unregisterDrumCallback } = useGlobalSync();
  const { pattern, samples, playSound } = useDrumMachine();
  const { audioContext } = useAudioContext();

  const playStep = useCallback((step: number) => {
    if (!audioContext || samples.length === 0) return;

    for (let track = 0; track < 8; track++) {
      if (pattern[track][step]) {
        try {
          playSound(track);
        } catch (error) {
          console.error(`Error playing track ${track}:`, error);
        }
      }
    }
  }, [audioContext, samples, pattern, playSound]);

  useEffect(() => {
    registerDrumCallback(playStep);
    return () => unregisterDrumCallback();
  }, [playStep, registerDrumCallback, unregisterDrumCallback]);

  return null;
};

function App() {
  const [currentPage, setCurrentPage] = useState<'drums' | 'synth' | 'mixer'>('drums');

  // Renderizza tutti i componenti ma mostra solo quello attivo
  const renderPages = () => {
    return (
      <>
        <div className={currentPage === 'drums' ? 'block' : 'hidden'}>
          <DrumMachine />
        </div>
        <div className={currentPage === 'synth' ? 'block' : 'hidden'}>
          <MS20Synthesizer />
        </div>
        <div className={currentPage === 'mixer' ? 'block' : 'hidden'}>
          <Mixer />
        </div>
      </>
    );
  };

  return (
    <AudioContextProvider>
      <GlobalSyncProvider>
        <DrumMachineProvider>
          <MS20SynthProvider>
            <DrumMachineController />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
              {/* Transport Header */}
              <TransportHeader />

              {/* Main Content */}
              <main className="pt-20 pb-20 px-4 min-h-screen">
                <div className="max-w-7xl mx-auto">
                  {renderPages()}
                </div>
              </main>

              {/* Bottom Navigation */}
              <BottomNavigation 
                currentPage={currentPage} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </MS20SynthProvider>
        </DrumMachineProvider>
      </GlobalSyncProvider>
    </AudioContextProvider>
  );
}

export default App;