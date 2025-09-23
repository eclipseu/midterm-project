import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../../contexts/AudioContext";

interface AudioControlsProps {
  className?: string;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  className = "",
}) => {
  const { isMuted, volume, toggleMute, setVolume } = useAudio();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={toggleMute}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          disabled={isMuted}
          className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <span className="text-sm text-gray-400 w-8">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
};
