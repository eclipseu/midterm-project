import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { hasSavedGame } from "../services/persistence";
import Button from "../components/ui/Button";

export const StartScreen = () => {
  const navigate = useNavigate();
  const { dispatch, loadGame } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedGameExists, setSavedGameExists] = useState(false);
  const [savedGameInfo, setSavedGameInfo] = useState<{
    playerName: string;
    timestamp: number;
    location: string;
  } | null>(null);

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
      // Start new game with player name
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
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 font-serif">
      <div className="max-w-md w-full">
        {/* Game Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-title text-red-accent mb-2">
            San Gubat Chronicles
          </h1>
          <p className="text-pale-text text-lg font-elegant">
            A Filipino Horror Text Adventure
          </p>
        </div>

        {/* Main Game Start Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 mb-6 animate-slide-up">
          {/* Continue Game Option */}
          {savedGameExists && savedGameInfo && (
            <div className="mb-6 p-4 bg-gray-700 border border-gray-600 rounded-lg">
              <h3 className="text-sm font-semibold text-red-accent mb-2">
                Continue Previous Game
              </h3>
              <div className="text-sm text-pale-text-muted space-y-1">
                <div>
                  Player:{" "}
                  <span className="font-medium text-pale-text">
                    {savedGameInfo.playerName}
                  </span>
                </div>
                <div>
                  Location:{" "}
                  <span className="font-medium text-pale-text">
                    {savedGameInfo.location}
                  </span>
                </div>
                <div>
                  Saved:{" "}
                  <span className="font-medium text-pale-text">
                    {new Date(savedGameInfo.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                onClick={continueGame}
                disabled={isLoading}
                variant="secondary"
                className="w-full mt-3"
              >
                {isLoading ? "Loading..." : "Continue Game"}
              </Button>
            </div>
          )}

          {/* New Game Form */}
          <div
            className={savedGameExists ? "pt-6 border-t border-gray-700" : ""}
          >
            <h2 className="text-xl font-semibold text-pale-text mb-4 font-elegant">
              {savedGameExists ? "Start New Adventure" : "Begin Your Journey"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="playerName"
                  className="block text-sm font-medium text-pale-text-muted mb-2"
                >
                  Enter your name:
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={handleNameChange}
                  placeholder="Your hero's name"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-pale-text focus:ring-2 focus:ring-red-accent focus:border-red-accent transition-colors"
                  maxLength={20}
                  disabled={isLoading}
                  autoFocus
                />
                <div className="text-xs text-pale-text-muted mt-1">
                  2-20 characters required
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !playerName || playerName.length < 2}
                variant="primary"
                size="large"
                className="w-full"
              >
                {isLoading ? "Starting..." : "Start Adventure"}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-pale-text-muted text-xs">
          © 2025 San Gubat Chronicles - A Text Adventure Experience
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
