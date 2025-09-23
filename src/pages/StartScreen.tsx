import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { useAudio } from "../contexts/AudioContext";
import { hasSavedGame, clearGame } from "../services/persistence";
import Modal from "../components/ui/Modal";
import styles from "../styles/components/StartScreen.module.css";

export const StartScreen = () => {
  const navigate = useNavigate();
  const { dispatch, loadGame } = useGame();
  const { playBackground } = useAudio();
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedGameExists, setSavedGameExists] = useState(false);
  const [savedGameInfo, setSavedGameInfo] = useState<{
    playerName: string;
    timestamp: number;
    location: string;
  } | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showNewGameForm, setShowNewGameForm] = useState(false);

  // Play menu background music when component mounts
  useEffect(() => {
    playBackground("background-menu");
  }, [playBackground]);

  // Check for existing saved game on component mount
  useEffect(() => {
    const checkSavedGame = () => {
      const { exists, saveInfo } = hasSavedGame();
      setSavedGameExists(exists);
      setSavedGameInfo(saveInfo || null);
    };

    checkSavedGame();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value.trim());
    setError(""); // Clear error when user starts typing
  };

  const startNewGame = async () => {
    if (!playerName || playerName.length < 2) {
      setError("Please enter a name with at least 2 characters");
      return;
    }

    if (playerName.length > 20) {
      setError("Player name must be 20 characters or less");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Clear any existing saved game data before starting new game
      console.log("Clearing existing save data...");
      const clearResult = clearGame(false); // Only clear current game, keep settings/stats
      if (!clearResult.success) {
        console.warn("Failed to clear existing save:", clearResult.error);
      } else {
        console.log("Save data cleared successfully");
      }

      // Start new game with player name
      console.log("Starting new game with player:", playerName);
      dispatch({ type: "START_GAME", playerName });

      // Navigate to game screen
      navigate("/game");
    } catch (err) {
      setError("Failed to start game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const continueGame = async () => {
    setIsLoading(true);
    setError("");

    try {
      const success = loadGame();

      if (success) {
        // Game loaded successfully, navigate to game screen
        navigate("/game");
      } else {
        setError("Failed to load saved game");
        setSavedGameExists(false);
        setSavedGameInfo(null);
      }
    } catch (err) {
      setError("Failed to load saved game. Please start a new game.");
      setSavedGameExists(false);
      setSavedGameInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startNewGame();
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${styles.menuBackground}`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className={styles.backgroundOverlay}></div>
        <div className={styles.scanlines}></div>
        <div className={styles.vignette}></div>
      </div>

      {/* Main Menu Container */}
      <div className="relative z-10 flex items-center justify-center w-full max-w-5xl mx-auto px-6">
        {/* Left Side - Game Logo */}
        <div className="w-[28rem] max-w-full flex items-center justify-center p-8">
          <div className="text-center">
            <div className={styles.logoContainer}>
              <h1 className={styles.mainTitle}>SAN GUBAT</h1>
              <h2 className={styles.subTitle}>CHRONICLES</h2>
              <div className={styles.tagline}>A Filipino Horror Experience</div>
            </div>
          </div>
        </div>

        {/* Right Side - Menu Options */}
        <div className="w-96 p-8 flex flex-col justify-center items-center text-center">
          <div className={styles.menuContainer}>
            {/* Start New Game Option */}
            <div className={styles.menuSection}>
              <button
                onClick={() => setShowNewGameForm(!showNewGameForm)}
                className={`${styles.menuButton} ${styles.startButton} w-full mb-4`}
                type="button"
              >
                START NEW GAME
              </button>

              {/* Expanded New Game Form */}
              {showNewGameForm && (
                <div className={`${styles.newGameForm} mb-6`}>
                  <form onSubmit={handleSubmit} className={styles.formGroup}>
                    <div className="mb-4 w-full text-center">
                      <label className={`${styles.inputLabel} block mb-3`}>
                        ENTER NAME:
                      </label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={handleNameChange}
                        placeholder="WHISPER YOUR NAME..."
                        className={`${styles.textInput} w-full text-center`}
                        maxLength={20}
                        disabled={isLoading}
                        autoFocus
                      />
                      <div className={`${styles.inputHint} mt-2 text-xs`}>
                        2–20 CHARACTERS
                      </div>
                    </div>

                    {error && (
                      <div className={`${styles.errorBox} mb-4`}>
                        {error.toUpperCase()}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={startNewGame}
                      disabled={
                        isLoading || !playerName || playerName.length < 2
                      }
                      className={`${styles.menuButton} ${styles.confirmButton} w-full`}
                    >
                      {isLoading ? "SUMMONING DARKNESS..." : "ENTER THE ABYSS"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Continue Game Option */}
            <div className={styles.menuSection}>
              <button
                onClick={savedGameExists ? continueGame : undefined}
                disabled={!savedGameExists || isLoading}
                className={`${styles.menuButton} ${
                  savedGameExists
                    ? styles.continueButton
                    : styles.disabledButton
                } w-full`}
                type="button"
              >
                {savedGameExists ? "CONTINUE" : "NO PROGRESS FOUND"}
              </button>

              {savedGameExists && savedGameInfo && (
                <div className={`${styles.saveInfo} mt-2 text-xs`}>
                  <div className="text-yellow-300">
                    {savedGameInfo.playerName} • {savedGameInfo.location}
                  </div>
                  <div className="text-gray-400">
                    {new Date(savedGameInfo.timestamp).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Buttons */}
            <div className={`${styles.buttonGroup} space-y-3`}>
              <button
                onClick={() => setShowTutorial(true)}
                className={`${styles.menuButton} ${styles.secondaryButton} w-full`}
                type="button"
              >
                ANCIENT KNOWLEDGE
              </button>

              <button
                onClick={() => setShowCredits(true)}
                className={`${styles.menuButton} ${styles.secondaryButton} w-full`}
                type="button"
              >
                SOUL CONTRIBUTORS
              </button>

              <a
                href="https://github.com/eclipseu/midterm-project"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.menuButton} ${styles.githubButton} block text-center`}
              >
                CURSED CODEX
              </a>
            </div>

            {/* Copyright */}
            <div className={styles.copyright}>© 2025 eclipseu webdev</div>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      <Modal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        title="How to Play"
        size="large"
        showCloseButton={true}
      >
        <div className="space-y-4">
          <div className="space-y-4 text-pale-text">
            <div>
              <h3 className="font-semibold text-pale-text mb-2">
                Reading the Story
              </h3>
              <p className="text-sm text-pale-text-muted">
                Each scene presents you with a story segment. Take your time to
                read and immerse yourself in the Filipino horror atmosphere.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-pale-text mb-2">
                Making Choices
              </h3>
              <p className="text-sm text-pale-text-muted">
                Click the arrow button to proceed through dialogue, then choose
                from available options. Your choices affect the story outcome.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-pale-text mb-2">
                Health System
              </h3>
              <p className="text-sm text-pale-text-muted">
                Monitor your HP bar. Some choices may trigger jump scares and
                reduce your health. Reach 0 HP and it's game over!
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-pale-text mb-2">Inventory</h3>
              <p className="text-sm text-pale-text-muted">
                Collect items during your adventure. They may help you in
                crucial moments or reveal important story elements.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-pale-text mb-2"> Saving</h3>
              <p className="text-sm text-pale-text-muted">
                Your progress is automatically saved. You can continue your
                adventure anytime from where you left off.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Credits Modal */}
      <Modal
        isOpen={showCredits}
        onClose={() => setShowCredits(false)}
        title="Credits"
        size="large"
        showCloseButton={true}
      >
        <div className="space-y-4">
          <div className="space-y-6 text-pale-text">
            <div>
              <h3 className="font-semibold text-pale-text mb-2">
                Game Development
              </h3>
              <p className="text-sm text-pale-text-muted">
                Created as a midterm project showcasing interactive storytelling
                and web development skills.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-pale-text mb-2">
                Cultural Heritage
              </h3>
              <p className="text-sm text-pale-text-muted">
                Inspired by rich Filipino folklore and the mystical creatures
                that have been part of our culture for centuries.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-pale-text mb-2">
                Technology Stack
              </h3>
              <ul className="text-sm text-pale-text-muted space-y-1">
                <li>• React 19 with TypeScript</li>
                <li>• Vite for fast development</li>
                <li>• Tailwind CSS for styling</li>
                <li>• React Router for navigation</li>
                <li>• Context API for state management</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-pale-text mb-2">
                Design Elements
              </h3>
              <ul className="text-sm text-pale-text-muted space-y-1">
                <li>• Google Fonts (Uncial Antiqua, Cinzel, Inter)</li>
                <li>• Lucide React icons</li>
                <li>• Custom horror-themed UI components</li>
                <li>• Responsive design principles</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-pale-text-muted text-center">
                Thank you for playing San Gubat Chronicles!
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StartScreen;
