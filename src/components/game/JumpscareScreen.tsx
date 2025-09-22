import { useEffect, useState, useRef } from "react";
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
  duration = 5000, // 3 seconds default
}: JumpscareScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(
    null
  );
  const [hasCompleted, setHasCompleted] = useState(false); // Prevent duplicate calls
  const currentJumpscareRef = useRef<string | null>(null); // Track current jumpscare asset
  const audioPlayedRef = useRef<boolean>(false); // Track if audio has been played for this instance

  useEffect(() => {
    if (isVisible && !hasCompleted) {
      // Check if this is the same jumpscare as currently running
      if (currentJumpscareRef.current === jumpscareAsset) {
        console.log(
          "🎃 JumpscareScreen: Same jumpscare already running, skipping"
        );
        return;
      }

      // Set the current jumpscare
      currentJumpscareRef.current = jumpscareAsset || null;

      console.log("🎃 JumpscareScreen: Starting jumpscare sequence", {
        jumpscareAsset,
      });

      // Smooth entrance sequence
      setIsEntering(true);
      setIsExiting(false);
      setShowContent(true);

      // Start screen shake effect after brief delay
      const enterTimer = setTimeout(() => {
        setIsEntering(false);
        setIsShaking(true);
      }, 200); // Short delay for entrance animation

      // Play audio ONCE using ref to prevent duplicates
      if (!audioPlayedRef.current) {
        // Determine audio file based on jumpscare asset or default to aswang
        let audioFile = "/assets/audio/aswang.wav"; // Default
        if (jumpscareAsset) {
          if (jumpscareAsset.includes("wakwak")) {
            audioFile = "/assets/audio/wakwak.wav";
          } else if (jumpscareAsset.includes("manananggal")) {
            audioFile = "/assets/audio/manananggal.wav";
          } else if (jumpscareAsset.includes("tiyanak")) {
            audioFile = "/assets/audio/tiyanak.wav";
          } else if (jumpscareAsset.includes("aswang")) {
            audioFile = "/assets/audio/aswang.wav";
          }
        }

        // Stop any existing audio before creating new one
        if (audioInstance) {
          console.log("🎃 JumpscareScreen: Stopping previous audio instance");
          audioInstance.pause();
          audioInstance.currentTime = 0;
        }

        console.log("🎃 JumpscareScreen: Creating and playing audio", {
          audioFile,
        });

        // Create and play audio immediately
        const audio = new Audio(audioFile);
        const volumeMap = { low: 0.5, medium: 0.7, high: 0.8 };
        audio.volume = volumeMap[intensity] || 0.8;
        setAudioInstance(audio);
        audioPlayedRef.current = true; // Mark audio as played

        // Play audio immediately
        audio.play().catch((error) => {
          console.warn("Audio playback failed:", error);
        });
      }

      // Stop shake after 1.2 seconds
      const shakeTimer = setTimeout(() => {
        setIsShaking(false);
      }, 1200);

      // Start exit animation with more time before completion
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        if (audioInstance) {
          audioInstance.pause();
          audioInstance.currentTime = 0;
        }
      }, duration - 800); // Start exit 800ms before completion for smoother transition

      // Complete and hide after full duration + extra time for exit animation
      const hideTimer = setTimeout(() => {
        setShowContent(false);
        setIsEntering(false);
        setIsExiting(false);
        setHasCompleted(true); // Mark as completed to prevent duplicate calls
        // Reset refs for next jumpscare
        currentJumpscareRef.current = null;
        audioPlayedRef.current = false;
        // Add extra delay to ensure everything is fully hidden before calling onComplete
        setTimeout(() => {
          console.log("🎃 JumpscareScreen: Calling onComplete");
          onComplete();
        }, 300); // 300ms additional delay after hiding
      }, duration);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(shakeTimer);
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
        if (audioInstance) {
          audioInstance.pause();
          audioInstance.currentTime = 0;
        }
      };
    } else {
      // Clean up when not visible
      setShowContent(false);
      setIsShaking(false);
      setIsEntering(false);
      setIsExiting(false);
      if (audioInstance) {
        console.log("🎃 JumpscareScreen: Stopping existing audio");
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }
    }
  }, [isVisible, duration, intensity, hasCompleted]);

  // Reset completion flag when jumpscare becomes visible
  useEffect(() => {
    if (isVisible) {
      setHasCompleted(false);
      audioPlayedRef.current = false; // Reset ref to allow new audio
      // Don't reset currentJumpscareRef here - let it track the current jumpscare
    }
  }, [isVisible]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
        audioInstance.src = ""; // Clear source to free memory
      }
    };
  }, [audioInstance]);

  if (!isVisible || !showContent) {
    return null;
  }

  const containerClass = `${styles.jumpscareOverlay} ${
    isEntering ? styles.entering : ""
  } ${isExiting ? styles.exiting : ""} ${isShaking ? styles.shakeEffect : ""}`;

  return (
    <div className={containerClass}>
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
              className={`${styles.jumpscareImage} ${
                isEntering ? styles.imageEntering : ""
              } ${isExiting ? styles.imageExiting : ""}`}
              onError={(e) => {
                console.warn("Jumpscare image failed to load:", jumpscareAsset);
                // Fallback to default content
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Horror text overlay */}
            <div
              className={`${styles.horrorText} ${
                isEntering ? styles.textEntering : ""
              } ${isExiting ? styles.textExiting : ""}`}
            >
              PALDO!
            </div>
          </div>
        ) : (
          // Default jumpscare content
          <div className={styles.defaultContent}>
            <Skull
              size={200}
              className={`${styles.skull} ${
                isEntering ? styles.skullEntering : ""
              } ${isExiting ? styles.skullExiting : ""}`}
            />
            <div
              className={`${styles.horrorText} ${
                isEntering ? styles.textEntering : ""
              } ${isExiting ? styles.textExiting : ""}`}
            >
              ASWANG!
            </div>
            <div
              className={`${styles.subText} ${
                isEntering ? styles.textEntering : ""
              } ${isExiting ? styles.textExiting : ""}`}
            >
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
          if (!hasCompleted) {
            setShowContent(false);
            setHasCompleted(true);
            if (audioInstance) {
              audioInstance.pause();
              audioInstance.currentTime = 0;
            }
            onComplete();
          }
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
