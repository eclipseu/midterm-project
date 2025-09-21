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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            San Gubat Chronicles
          </h1>
          <p className="text-gray-300 text-lg">
            A Filipino Horror Text Adventure
          </p>
          <div className="mt-4 text-sm text-gray-400">
            Face the creatures of Philippine folklore in this interactive story
          </div>
        </div>

        {/* Main Game Start Card */}
        <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
          {/* Continue Game Option */}
          {savedGameExists && savedGameInfo && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Continue Previous Game
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div>
                  Player:{" "}
                  <span className="font-medium">
                    {savedGameInfo.playerName}
                  </span>
                </div>
                <div>
                  Location:{" "}
                  <span className="font-medium">{savedGameInfo.location}</span>
                </div>
                <div>
                  Saved:{" "}
                  <span className="font-medium">
                    {new Date(savedGameInfo.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                onClick={continueGame}
                disabled={isLoading}
                variant="primary"
                className="w-full mt-3"
              >
                {isLoading ? "Loading..." : "Continue Game"}
              </Button>
            </div>
          )}

          {/* New Game Form */}
          <div
            className={savedGameExists ? "pt-6 border-t border-gray-200" : ""}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {savedGameExists ? "Start New Adventure" : "Begin Your Journey"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="playerName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter your name:
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={handleNameChange}
                  placeholder="Your hero's name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  maxLength={20}
                  disabled={isLoading}
                  autoFocus
                />
                <div className="text-xs text-gray-500 mt-1">
                  2-20 characters required
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
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

        {/* Game Info */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-gray-300 text-sm space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <span>🎮 Interactive Story</span>
              <span>💾 Auto-save</span>
              <span>🏆 Multiple Endings</span>
            </div>
            <div className="text-xs text-gray-400">
              Your choices shape the story. Choose wisely, brave adventurer.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-xs">
          © 2025 San Gubat Chronicles - A Text Adventure Experience
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
