import React, { createContext, useContext, useEffect, useState } from "react";
import { audioService } from "../services/audioService";

interface AudioContextType {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playBackground: (audioKey: string) => void;
  stopBackground: () => void;
  playSoundEffect: (soundKey: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.3);

  const toggleMute = () => {
    const newMutedState = audioService.toggleMute();
    setIsMuted(newMutedState);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    audioService.setVolume(newVolume);
  };

  const playBackground = (audioKey: string) => {
    audioService.playBackground(audioKey);
  };

  const stopBackground = () => {
    audioService.stopBackground();
  };

  const playSoundEffect = (soundKey: string) => {
    audioService.playSoundEffect(soundKey);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      audioService.stopBackground();
    };
  }, []);

  const value: AudioContextType = {
    isMuted,
    volume,
    toggleMute,
    setVolume,
    playBackground,
    stopBackground,
    playSoundEffect,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};
