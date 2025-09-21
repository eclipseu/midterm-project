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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Game Over Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-red-600 text-white p-6 text-center">
            <div className="text-6xl mb-4">💀</div>
            <h1 className="text-3xl font-bold mb-2">GAME OVER</h1>
            <div
              className={`text-xl font-semibold ${gameOverInfo.color.replace(
                "text-",
                "text-red-"
              )}`}
            >
              {gameOverInfo.title}
            </div>
            <p className="text-red-100 mt-2">{gameOverInfo.message}</p>
          </div>

          {/* Player Info */}
          <div className="p-6 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {finalStats.playerName}'s Final Moment
            </h2>
            <p className="text-gray-600">
              Your journey through San Gubat ended at:{" "}
              <span className="font-medium">{finalStats.currentLocation}</span>
            </p>
          </div>

          {/* Final Statistics */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Adventure Statistics
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {finalStats.locationsVisited}
                </div>
                <div className="text-sm text-gray-600">Locations Explored</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {finalStats.itemsCollected}
                </div>
                <div className="text-sm text-gray-600">Items Collected</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {finalStats.finalHealth}/{finalStats.maxHealth}
                </div>
                <div className="text-sm text-gray-600">Final Health</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {finalStats.damageReceived}
                </div>
                <div className="text-sm text-gray-600">Damage Taken</div>
              </div>
            </div>

            {/* Inventory Display */}
            {finalStats.itemsCollected > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                  Items in Possession:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {gameState.player.inventory.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Death Analysis */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="text-md font-semibold text-red-800 mb-2">
                What Went Wrong?
              </h4>
              {gameState.player.hp <= 0 ? (
                <p className="text-red-700 text-sm">
                  Your health reached zero. In future adventures, be more
                  cautious with your choices and try to find healing items or
                  avoid dangerous situations.
                </p>
              ) : (
                <p className="text-red-700 text-sm">
                  Your quest ended without achieving victory. Different choices
                  might lead to different outcomes. The creatures of San Gubat
                  are cunning - choose your path wisely.
                </p>
              )}
            </div>

            {/* Encouragement */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-md font-semibold text-blue-800 mb-2">
                Try Again!
              </h4>
              <p className="text-blue-700 text-sm">
                Every choice matters in San Gubat. Different paths lead to
                different fates. Will you gather the right items? Can you avoid
                the deadly traps? Start a new adventure and discover what you
                might have missed!
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t">
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

            <div className="text-center mt-4 text-sm text-gray-500">
              Don't give up! The secrets of San Gubat await your return.
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="text-center mt-6 text-gray-300">
          <p className="italic text-lg mb-2">
            "In the darkness of San Gubat, death is but another teacher."
          </p>
          <p className="text-sm text-gray-400">- Filipino Folk Wisdom</p>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
