import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import {
  clearGame,
  savePlayerStats,
  getPlayerStats,
} from "../services/persistence";
import Button from "../components/ui/Button";

export const VictoryScreen = () => {
  const navigate = useNavigate();
  const { gameState, dispatch } = useGame();
  const [isResetting, setIsResetting] = useState(false);
  const [statsUpdated, setStatsUpdated] = useState(false);

  // Update player statistics when component mounts
  useEffect(() => {
    if (!statsUpdated && gameState.gameStarted) {
      const currentStats = getPlayerStats();
      const newStats = {
        gamesPlayed: currentStats.gamesPlayed + 1,
        gamesWon: currentStats.gamesWon + 1,
        lastPlayedAt: Date.now(),
        bestEnding: "Victory in San Gubat", // Track this as the best ending
      };

      savePlayerStats(newStats);
      setStatsUpdated(true);
    }
  }, [gameState.gameStarted, statsUpdated]);

  const handlePlayAgain = async () => {
    setIsResetting(true);

    try {
      // Clear the current saved game
      await clearGame(false); // Keep settings and overall stats

      // Reset the game state
      dispatch({ type: "RESET_GAME" });

      // Navigate back to start screen
      navigate("/");
    } catch (error) {
      console.error("Failed to reset game:", error);
    } finally {
      setIsResetting(false);
    }
  };

  // Calculate final statistics
  const finalStats = {
    locationsVisited: gameState.visitedNodes.size,
    itemsCollected: gameState.player.inventory.length,
    finalHealth: gameState.player.hp,
    maxHealth: gameState.player.maxHp,
    healthPercentage: Math.round(
      (gameState.player.hp / gameState.player.maxHp) * 100
    ),
    currentLocation: gameState.currentNodeId,
    playerName: gameState.player.name,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-800 via-gray-900 to-dark flex items-center justify-center p-4 font-serif animate-fade-in">
      <div className="max-w-2xl w-full">
        {/* Main Victory Card */}
        <div className="bg-gray-800 border border-yellow-500 rounded-lg shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-500 text-white p-6 text-center">
            <div className="text-6xl mb-4 animate-pulse-slow">🏆</div>
            <h1 className="text-4xl font-title text-white mb-2">VICTORY!</h1>
            <p className="text-yellow-200 mt-2 text-lg font-elegant">
              You have successfully vanquished the darkness and saved the town!
            </p>
          </div>

          {/* Hero Info */}
          <div className="p-6 bg-gray-700 border-b border-gray-600">
            <h2 className="text-2xl font-bold text-pale-text mb-2 font-elegant">
              🎉 Congratulations, {finalStats.playerName}!
            </h2>
            <p className="text-pale-text-muted text-lg">
              The sun rises over San Gubat, and the townspeople are safe once
              more.
            </p>
          </div>

          {/* Victory Statistics */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-pale-text mb-4 font-elegant">
              Quest Completion Statistics
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-400">
                  {finalStats.locationsVisited}
                </div>
                <div className="text-sm text-pale-text-muted font-medium">
                  Locations Explored
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-400">
                  {finalStats.itemsCollected}
                </div>
                <div className="text-sm text-pale-text-muted font-medium">
                  Items Collected
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-3xl font-bold text-red-400">
                  {finalStats.healthPercentage}%
                </div>
                <div className="text-sm text-pale-text-muted font-medium">
                  Health Remaining
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400">⭐</div>
                <div className="text-sm text-pale-text-muted font-medium">
                  Perfect Victory
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-900 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePlayAgain}
                disabled={isResetting}
                variant="primary"
                size="large"
                className="flex-1"
              >
                {isResetting ? "Preparing New Quest..." : "🔄 New Adventure"}
              </Button>

              <Button
                onClick={() => navigate("/")}
                variant="secondary"
                size="large"
                className="flex-1"
              >
                🏠 Main Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
