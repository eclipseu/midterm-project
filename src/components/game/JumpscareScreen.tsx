import { useEffect, useState } from "react";
import { Skull } from "lucide-react";
import styles from "../../styles/components/Jumpscare.module.css";

interface JumpscareScreenProps {
  isVisible: boolean;
  onComplete: () => void;
  jumpscareAsset?: string; // Path to jumpscare image
  intensity?: "low" | "medium" | "high";
  duration?: number; // Duration in milliseconds
}

export const JumpscareScreen = ({
  isVisible,
  onComplete,
  jumpscareAsset,
  intensity = "high",
  duration = 3000, // 3 seconds default
}: JumpscareScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    if (isVisible) {
      // Show jumpscare immediately
      setShowContent(true);

      // Start screen shake effect
      setIsShaking(true);

      // Play jumpscare sound effect
      const audio = new Audio("/sounds/jumpscare.mp3");
      audio.volume = 0.8; // Louder for more intensity
      audio.currentTime = 0;
      setAudioInstance(audio);

      audio.play().catch(() => {
        console.warn(
          "Audio playback failed - user interaction may be required"
        );
      });

      // Stop shake after 1 second
      const shakeTimer = setTimeout(() => {
        setIsShaking(false);
      }, 1000);

      // Auto-hide after duration (3 seconds)
      const hideTimer = setTimeout(() => {
        setShowContent(false);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        onComplete();
      }, duration);

      return () => {
        clearTimeout(shakeTimer);
        clearTimeout(hideTimer);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      };
    } else {
      setShowContent(false);
      setIsShaking(false);
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }
    }
  }, [isVisible, duration, onComplete]); // Removed audioInstance from dependency array

  if (!isVisible || !showContent) {
    return null;
  }

  return (
    <div
      className={`${styles.jumpscareOverlay} ${
        isShaking ? styles.shakeEffect : ""
      }`}
    >
      {/* Full-screen background effects */}
      <div className={styles.backgroundEffects}>
        {/* Blood drip effect */}
        <div className={styles.bloodDrip}></div>

        {/* Flash overlay */}
        <div className={styles.flashOverlay}></div>

        {/* Red pulse overlay */}
        <div className={styles.redPulse}></div>
      </div>

      {/* Main jumpscare content */}
      <div className={styles.jumpscareContent}>
        {jumpscareAsset ? (
          <div className={styles.imageContainer}>
            <img
              src={jumpscareAsset}
              alt="Jumpscare"
              className={styles.jumpscareImage}
              onError={(e) => {
                console.warn("Jumpscare image failed to load:", jumpscareAsset);
                // Fallback to default content
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Horror text overlay */}
            <div className={styles.horrorText}>PALDO!</div>
          </div>
        ) : (
          // Default jumpscare content
          <div className={styles.defaultContent}>
            <Skull size={200} className={styles.skull} />
            <div className={styles.horrorText}>ASWANG!</div>
            <div className={styles.subText}>
              Nakakita ka ng hindi mo dapat nakita...
            </div>
          </div>
        )}
      </div>

      {/* Vignette effect */}
      <div className={styles.vignette}></div>

      {/* Static noise effect */}
      <div className={styles.staticNoise}></div>

      {/* Emergency close button (hidden by default, appears after 2 seconds) */}
      <button
        onClick={() => {
          setShowContent(false);
          if (audioInstance) {
            audioInstance.pause();
            audioInstance.currentTime = 0;
          }
          onComplete();
        }}
        className={styles.emergencyClose}
        aria-label="Close jumpscare"
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        ✕
      </button>
    </div>
  );
};

export default JumpscareScreen;
