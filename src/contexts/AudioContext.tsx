import React, { createContext, useContext, useEffect, useState } from 'react';

interface AudioContextType {
  audioContext: AudioContext | null;
  isAudioReady: boolean;
  initializeAudio: () => Promise<void>;
}

const AudioContextContext = createContext<AudioContextType | null>(null);

export const useAudioContext = () => {
  const context = useContext(AudioContextContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioContextProvider');
  }
  return context;
};

export const AudioContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [showInitButton, setShowInitButton] = useState(true);

  const initializeAudio = async () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      setAudioContext(ctx);
      setIsAudioReady(true);
      setShowInitButton(false);
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  };

  useEffect(() => {
    // Initialize audio context on first user interaction
    const handleFirstInteraction = () => {
      if (!isAudioReady) {
        initializeAudio();
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isAudioReady]);

  return (
    <AudioContextContext.Provider value={{ audioContext, isAudioReady, initializeAudio }}>
      {showInitButton && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-purple-500/30 shadow-2xl max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.846 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.846l3.537-3.816a1 1 0 011.617.816zM16 8a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Attiva Audio</h2>
              <p className="text-gray-300 mb-6">
                Per utilizzare la drum machine e il sintetizzatore, è necessario attivare il motore audio.
              </p>
              <button
                onClick={initializeAudio}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🎵 Attiva Motore Audio
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Richiesto dai browser per la riproduzione audio
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </AudioContextContext.Provider>
  );
};