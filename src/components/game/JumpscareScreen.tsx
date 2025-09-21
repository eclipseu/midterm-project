import { useEffect, useState } from "react";
import { Skull } from "lucide-react";

interface JumpscareScreenProps {
  isVisible: boolean;
  onComplete: () => void;
  jumpscareAsset?: string; // Path to .vg asset or other media
  intensity?: "low" | "medium" | "high";
  duration?: number; // Duration in milliseconds
}

export const JumpscareScreen = ({
  isVisible,
  onComplete,
  jumpscareAsset,
  intensity = "medium",
  duration = 2000,
}: JumpscareScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show jumpscare immediately
      setShowContent(true);
      setIsExiting(false);

      // Play jumpscare sound effect if available
      const audio = new Audio("/sounds/jumpscare.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setShowContent(false);
          onComplete();
        }, 500); // Exit animation duration
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  if (!isVisible || !showContent) {
    return null;
  }

  const intensityClasses = {
    low: "animate-pulse",
    medium: "animate-bounce",
    high: "animate-shake",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle, #7f1d1d 0%, #000000 70%)",
      }}
    >
      {/* Jumpscare Content */}
      <div
        className={`relative ${intensityClasses[intensity]} ${
          isExiting ? "scale-0" : "scale-100"
        } transition-transform duration-500`}
      >
        {/* Video/Asset Container */}
        {jumpscareAsset ? (
          <div className="relative">
            {jumpscareAsset.endsWith(".vg") ? (
              // For .vg files, you might need a specific player
              <div className="w-96 h-96 bg-red-900 rounded-lg flex items-center justify-center border-4 border-red-600">
                <p className="text-white text-center">
                  VG Asset: {jumpscareAsset}
                  <br />
                  <span className="text-sm opacity-75">
                    (VG player implementation needed)
                  </span>
                </p>
              </div>
            ) : jumpscareAsset.match(/\.(mp4|webm|ogg)$/i) ? (
              // Video files
              <video
                autoPlay
                muted
                className="w-96 h-96 object-cover rounded-lg border-4 border-red-600"
                onEnded={() => {
                  setIsExiting(true);
                  setTimeout(onComplete, 500);
                }}
              >
                <source src={jumpscareAsset} type="video/mp4" />
              </video>
            ) : jumpscareAsset.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              // Image files
              <img
                src={jumpscareAsset}
                alt="Jumpscare"
                className="w-96 h-96 object-cover rounded-lg border-4 border-red-600"
              />
            ) : (
              // Unknown format - show placeholder
              <div className="w-96 h-96 bg-red-900 rounded-lg flex items-center justify-center border-4 border-red-600">
                <Skull size={120} className="text-red-300" />
              </div>
            )}
          </div>
        ) : (
          // Default jumpscare without asset
          <div className="w-96 h-96 bg-gradient-to-br from-red-900 to-black rounded-lg flex items-center justify-center border-4 border-red-600 shadow-2xl">
            <div className="text-center">
              <Skull size={120} className="text-red-300 mx-auto mb-4" />
              <h2 className="text-3xl font-title text-red-300 animate-pulse">
                ASWANG!
              </h2>
              <p className="text-red-400 font-elegant mt-2">
                Nakakita ka ng hindi mo dapat nakita...
              </p>
            </div>
          </div>
        )}

        {/* Screen Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Flash effect */}
          <div className="absolute inset-0 bg-white opacity-20 animate-ping"></div>

          {/* Red overlay pulse */}
          <div className="absolute inset-0 bg-red-600 opacity-30 animate-pulse"></div>

          {/* Vignette effect */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background:
                "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 70%)",
            }}
          ></div>
        </div>
      </div>

      {/* Screen shake effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full animate-shake opacity-20 bg-gradient-to-br from-red-800 to-transparent"></div>
      </div>

      {/* Emergency close button (for accessibility) */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onComplete, 100);
        }}
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 opacity-50 hover:opacity-100"
        aria-label="Close jumpscare"
      >
        ✕
      </button>
    </div>
  );
};

export default JumpscareScreen;
