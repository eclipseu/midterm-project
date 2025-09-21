import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import {
  clearGame,
  savePlayerStats,
  getPlayerStats,
} from "../services/persistence";
import Button from "../components/ui/Button";

export const GameOverScreen = () => {
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
        gamesLost: currentStats.gamesLost + 1,
        lastPlayedAt: Date.now(),
        // Note: We don't increment gamesWon here since this is game over
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
    damageReceived: gameState.player.maxHp - gameState.player.hp,
    currentLocation: gameState.currentNodeId,
    playerName: gameState.player.name,
  };

  // Determine game over reason
  const getGameOverReason = () => {
    if (gameState.player.hp <= 0) {
      return {
        title: "💀 HEALTH DEPLETED",
        message: "Your wounds proved too severe to continue the hunt.",
        color: "text-red-600",
      };
    } else {
      return {
        title: "💀 QUEST FAILED",
        message: "Your adventure has come to an unfortunate end.",
        color: "text-red-600",
      };
    }
  };

  const gameOverInfo = getGameOverReason();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-dark flex items-center justify-center p-4 font-serif animate-fade-in">
      <div className="max-w-2xl w-full">
        {/* Main Game Over Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-red-800 text-white p-6 text-center">
            <div className="text-6xl mb-4 animate-pulse-slow">💀</div>
            <h1 className="text-4xl font-title text-white mb-2">GAME OVER</h1>
            <p className="text-red-200 mt-2 font-elegant">
              {gameOverInfo.message}
            </p>
          </div>

          {/* Player Info */}
          <div className="p-6 bg-gray-700 border-b border-gray-600">
            <h2 className="text-xl font-semibold text-pale-text mb-2 font-elegant">
              {finalStats.playerName}'s Final Moment
            </h2>
            <p className="text-pale-text-muted">
              Your journey through San Gubat ended at:{" "}
              <span className="font-medium text-red-accent">
                {finalStats.currentLocation}
              </span>
            </p>
          </div>

          {/* Final Statistics */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-pale-text mb-4 font-elegant">
              Adventure Statistics
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {finalStats.locationsVisited}
                </div>
                <div className="text-sm text-pale-text-muted">
                  Locations Explored
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {finalStats.itemsCollected}
                </div>
                <div className="text-sm text-pale-text-muted">
                  Items Collected
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">
                  {finalStats.finalHealth}/{finalStats.maxHealth}
                </div>
                <div className="text-sm text-pale-text-muted">Final Health</div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">
                  {finalStats.damageReceived}
                </div>
                <div className="text-sm text-pale-text-muted">Damage Taken</div>
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
                {isResetting ? "Resetting..." : "🔄 Play Again"}
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

export default GameOverScreen;
