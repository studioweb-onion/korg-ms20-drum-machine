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
      {/* Rimuovo l'overlay che bloccava l'interfaccia */}
      {/* L'audio può essere inizializzato tramite il pulsante nell'header */}
      {children}
    </AudioContextContext.Provider>
  );
};