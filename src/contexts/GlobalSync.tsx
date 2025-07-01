import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface GlobalSyncType {
  isPlaying: boolean;
  currentStep: number;
  bpm: number;
  play: () => void;
  stop: () => void;
  setBPM: (bpm: number) => void;
  registerStepCallback: (callback: () => void) => void;
  unregisterStepCallback: (callback: () => void) => void;
  registerDrumCallback: (callback: (step: number) => void) => void;
  unregisterDrumCallback: () => void;
}

const GlobalSyncContext = createContext<GlobalSyncType | null>(null);

export const useGlobalSync = () => {
  const context = useContext(GlobalSyncContext);
  if (!context) {
    throw new Error('useGlobalSync must be used within GlobalSyncProvider');
  }
  return context;
};

export const GlobalSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBPMState] = useState(120);
  const intervalRef = useRef<number | null>(null);
  const stepCallbacks = useRef<Set<() => void>>(new Set());
  const drumCallback = useRef<((step: number) => void) | null>(null);
  const lastStepTime = useRef<number>(0);
  const startTime = useRef<number>(0);

  const registerStepCallback = useCallback((callback: () => void) => {
    stepCallbacks.current.add(callback);
  }, []);

  const unregisterStepCallback = useCallback((callback: () => void) => {
    stepCallbacks.current.delete(callback);
  }, []);

  const registerDrumCallback = useCallback((callback: (step: number) => void) => {
    drumCallback.current = callback;
  }, []);

  const unregisterDrumCallback = useCallback(() => {
    drumCallback.current = null;
  }, []);

  const calculateStepTime = useCallback((bpm: number) => {
    return (60 / bpm / 4) * 1000; // 16th notes in milliseconds
  }, []);

  const play = useCallback(() => {
    setIsPlaying(prevPlaying => {
      if (prevPlaying) return prevPlaying;
      
      const stepTime = calculateStepTime(bpm);
      startTime.current = performance.now();
      lastStepTime.current = startTime.current;

      const tick = () => {
        const now = performance.now();
        const elapsed = now - lastStepTime.current;
        
        if (elapsed >= stepTime) {
           setCurrentStep(prev => {
             const nextStep = (prev + 1) % 16;
             
             // Esegui sempre il callback della drum machine se presente
             if (drumCallback.current) {
               try {
                 drumCallback.current(nextStep);
               } catch (error) {
                 console.error('Error in drum callback:', error);
               }
             }
             
             // Esegui gli altri callback
             stepCallbacks.current.forEach(callback => {
               try {
                 callback();
               } catch (error) {
                 console.error('Error in step callback:', error);
               }
             });
             
             return nextStep;
           });
           lastStepTime.current = now;
         }
        
        // Usa requestAnimationFrame per timing più preciso
        if (intervalRef.current !== null) {
          intervalRef.current = requestAnimationFrame(tick);
        }
      };

      // Inizia il tick
      intervalRef.current = requestAnimationFrame(tick);
      return true;
    });
  }, [bpm, calculateStepTime]);

  const stop = useCallback(() => {
    setIsPlaying(prevPlaying => {
      if (!prevPlaying) return prevPlaying;
      
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentStep(0);
      return false;
    });
  }, []);

  const setBPM = useCallback((newBPM: number) => {
    setBPMState(newBPM);
    
    // Se sta suonando, aggiorna il timing senza fermare
    setIsPlaying(prevPlaying => {
      if (prevPlaying) {
        const now = performance.now();
        const newStepTime = calculateStepTime(newBPM);
        lastStepTime.current = now;
        
        // Continua con il nuovo timing
        if (intervalRef.current) {
          cancelAnimationFrame(intervalRef.current);
        }
        
        const tick = () => {
          const currentTime = performance.now();
          const elapsed = currentTime - lastStepTime.current;
          
          if (elapsed >= newStepTime) {
             setCurrentStep(prev => {
               const nextStep = (prev + 1) % 16;
               
               // Esegui sempre il callback della drum machine se presente
               if (drumCallback.current) {
                 try {
                   drumCallback.current(nextStep);
                 } catch (error) {
                   console.error('Error in drum callback:', error);
                 }
               }
               
               // Esegui gli altri callback
               stepCallbacks.current.forEach(callback => {
                 try {
                   callback();
                 } catch (error) {
                   console.error('Error in step callback:', error);
                 }
               });
               
               return nextStep;
             });
             lastStepTime.current = currentTime;
           }
          
          if (intervalRef.current !== null) {
            intervalRef.current = requestAnimationFrame(tick);
          }
        };
        
        intervalRef.current = requestAnimationFrame(tick);
      }
      return prevPlaying;
    });
  }, [calculateStepTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
      }
    };
  }, []);

  return (
    <GlobalSyncContext.Provider value={{
      isPlaying,
      currentStep,
      bpm,
      play,
      stop,
      setBPM,
      registerStepCallback,
      unregisterStepCallback,
      registerDrumCallback,
      unregisterDrumCallback
    }}>
      {children}
    </GlobalSyncContext.Provider>
  );
};