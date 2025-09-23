import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../../contexts/AudioContext";

interface AudioControlsProps {
  className?: string;
}

export const SimpleAudioControls: React.FC<AudioControlsProps> = ({
  className = "",
}) => {
  const { isMuted, volume, toggleMute, setVolume } = useAudio();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={toggleMute}
        className="p-2 rounded-lg bg-gray-900/80 hover:bg-gray-800 transition-colors text-red-400 hover:text-red-300 border border-red-900/30 backdrop-blur-sm"
        aria-label={isMuted ? "Unmute" : "Mute"}
        style={{
          boxShadow: "0 0 10px rgba(220, 38, 38, 0.2)"
        }}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          disabled={isMuted}
          className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isMuted ? '#374151' : `linear-gradient(90deg, #dc2626 0%, #dc2626 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
          }}
        />
        <span className="text-sm text-red-400 w-8 font-mono">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
};