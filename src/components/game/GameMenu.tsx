import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../../contexts/AudioContext";
import Modal from "../ui/Modal";
import styles from "../../styles/components/Modal.module.css";
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
      {/* Menu Button - Conditionally Rendered */}
      {/* This line is the key change. The button is only rendered if isMenuOpen is false. */}
      {!isMenuOpen && (
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`
            game-menu-button
            bg-black/70 hover:bg-black/90 
            text-white border border-red-500/30 hover:border-red-500/60
            p-3 rounded-lg transition-all duration-200
            shadow-lg hover:shadow-red-500/20
            ${className}
          `}
          aria-label="Open game menu"
          style={{
            position: "fixed",
            top: "120px",
            left: "20px",
            zIndex: 10001,
            pointerEvents: "auto",
          }}
        >
          <Menu size={20} />
        </button>
      )}

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
          <div className={styles.audioSettings}>
            <h3 className={styles.audioSettingsTitle}>Audio Settings</h3>

            {/* Mute Toggle */}
            <div className={styles.settingRow}>
              <span className={styles.volumeLabel}>Sound</span>
              <button
                onClick={toggleMute}
                className={`${styles.soundToggleButton} ${
                  isMuted ? styles.soundToggleMuted : styles.soundToggleEnabled
                }`}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {isMuted ? "Muted" : "Enabled"}
              </button>
            </div>

            {/* Volume Slider */}
            {!isMuted && (
              <div className={styles.volumeControls}>
                <div className={styles.volumeRow}>
                  <span className={styles.volumeLabel}>Volume</span>
                  <span className={styles.volumeDisplay}>
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
                  className={styles.volumeSlider}
                  style={{
                    background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${
                      volume * 100
                    }%, #374151 ${volume * 100}%, #374151 100%)`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Menu Actions */}
          <div className={styles.menuActions}>
            <button
              onClick={() => setIsMenuOpen(false)}
              className={styles.resumeButton}
            >
              Resume Game
            </button>

            <button onClick={handleExitToMenu} className={styles.exitButton}>
              Exit to Main Menu
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default GameMenu;
