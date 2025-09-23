import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../../contexts/AudioContext";
import Modal from "../ui/Modal";
import { Menu, VolumeX, Volume2 } from "lucide-react";

interface GameMenuProps {
  className?: string;
}

export const GameMenu = ({ className = "" }: GameMenuProps) => {
  const navigate = useNavigate();
  const { volume, setVolume, isMuted, toggleMute } = useAudio();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleExitToMenu = () => {
    setIsMenuOpen(false);
    navigate("/");
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className={`
          bg-black/70 hover:bg-black/90 
          text-white border border-red-500/30 hover:border-red-500/60
          p-3 rounded-lg transition-all duration-200
          shadow-lg hover:shadow-red-500/20
          ${className}
        `}
        aria-label="Open game menu"
      >
        <Menu size={20} />
      </button>

      {/* Menu Modal */}
      <Modal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Game Menu"
        size="medium"
        showCloseButton={true}
      >
        <div className="space-y-6 p-4">
          {/* Sound Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-pale-text mb-4">
              Audio Settings
            </h3>
            
            {/* Mute Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-pale-text-muted">Sound</span>
              <button
                onClick={toggleMute}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                  ${isMuted 
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30' 
                    : 'bg-green-600/20 text-green-400 border border-green-500/30'
                  }
                `}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {isMuted ? 'Muted' : 'Enabled'}
              </button>
            </div>

            {/* Volume Slider */}
            {!isMuted && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-pale-text-muted">Volume</span>
                  <span className="text-pale-text text-sm">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="
                    w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                    slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 
                    slider-thumb:bg-red-500 slider-thumb:rounded-full slider-thumb:cursor-pointer
                    slider-thumb:shadow-lg slider-thumb:shadow-red-500/30
                  "
                  style={{
                    background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                  }}
                />
              </div>
            )}
          </div>

          {/* Menu Actions */}
          <div className="border-t border-gray-700 pt-6 space-y-3">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="
                w-full bg-gray-700 hover:bg-gray-600 
                text-white py-3 px-4 rounded-lg transition-colors
                border border-gray-600 hover:border-gray-500
              "
            >
              Resume Game
            </button>
            
            <button
              onClick={handleExitToMenu}
              className="
                w-full bg-red-600/20 hover:bg-red-600/30 
                text-red-400 hover:text-red-300 py-3 px-4 rounded-lg transition-colors
                border border-red-500/30 hover:border-red-500/50
              "
            >
              Exit to Main Menu
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default GameMenu;