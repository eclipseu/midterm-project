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

  // Get item icons for visual representation
  const getItemIcon = (item: string): string => {
    const itemIcons: Record<string, string> = {
      Asin: "🧂", // Salt
      Bawang: "🧄", // Garlic
      Agimat: "✨", // Amulet
      Sword: "⚔️",
      Shield: "🛡️",
      Potion: "🧪",
      Key: "🗝️",
      Torch: "🔦",
      Rope: "🪢",
      Map: "🗺️",
    };

    return itemIcons[item] || "📦";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Victory Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl font-bold mb-2">VICTORY!</h1>
            <div className="text-2xl font-semibold text-yellow-100">
              🌅 HERO OF SAN GUBAT
            </div>
            <p className="text-yellow-100 mt-2 text-lg">
              You have successfully vanquished the darkness and saved the town!
            </p>
          </div>

          {/* Hero Info */}
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🎉 Congratulations, {finalStats.playerName}!
            </h2>
            <p className="text-gray-700 text-lg">
              The sun rises over San Gubat, and the townspeople are safe once
              more. Your bravery and wisdom have triumphed over the ancient
              evil.
            </p>
          </div>

          {/* Victory Statistics */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Quest Completion Statistics
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">
                  {finalStats.locationsVisited}
                </div>
                <div className="text-sm text-blue-700 font-medium">
                  Locations Explored
                </div>
                <div className="text-xs text-blue-600">
                  Complete exploration
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="text-3xl font-bold text-green-600">
                  {finalStats.itemsCollected}
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Items Collected
                </div>
                <div className="text-xs text-green-600">Inventory mastery</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <div className="text-3xl font-bold text-red-600">
                  {finalStats.healthPercentage}%
                </div>
                <div className="text-sm text-red-700 font-medium">
                  Health Remaining
                </div>
                <div className="text-xs text-red-600">
                  {finalStats.finalHealth}/{finalStats.maxHealth} HP
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">⭐</div>
                <div className="text-sm text-purple-700 font-medium">
                  Perfect Victory
                </div>
                <div className="text-xs text-purple-600">San Gubat saved</div>
              </div>
            </div>

            {/* Final Inventory Display */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                🎒 Hero's Final Inventory
              </h4>
              {finalStats.itemsCollected > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gameState.player.inventory.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-yellow-50 hover:to-yellow-100 transition-colors duration-200 p-3 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <span className="text-2xl" aria-label={item}>
                        {getItemIcon(item)}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-2xl mb-2">🎒</div>
                  <p className="text-gray-600 font-medium">
                    No items collected
                  </p>
                  <p className="text-sm text-gray-500">
                    Victory achieved through pure wit and courage!
                  </p>
                </div>
              )}
            </div>

            {/* Victory Achievement */}
            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-orange-800 mb-2 flex items-center">
                🏆 Achievement Unlocked: Savior of San Gubat
              </h4>
              <p className="text-orange-700 text-sm mb-3">
                You have completed the San Gubat Chronicles with a perfect
                victory ending! The Manananggal has been defeated, and the town
                is safe from supernatural threats.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                  ⚔️ Monster Slayer
                </span>
                <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                  🛡️ Town Protector
                </span>
                <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                  🌅 Dawn Bringer
                </span>
              </div>
            </div>

            {/* Lore & Ending */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-md font-semibold text-blue-800 mb-2">
                📚 Chronicle's End
              </h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                Your name will be remembered in San Gubat's history. The elders
                will tell stories of your courage for generations to come. The
                ancient evil has been banished, and the balance between the
                mortal and supernatural worlds has been restored.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePlayAgain}
                disabled={isResetting}
                variant="primary"
                size="large"
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
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

            <div className="text-center mt-4 text-sm text-gray-600">
              Experience the adventure again with different choices and paths!
            </div>
          </div>
        </div>

        {/* Congratulatory Footer */}
        <div className="text-center mt-6 text-white">
          <p className="italic text-xl mb-2 font-medium drop-shadow-lg">
            "Salamat, bayani. Ang liwanag ay bumalik sa San Gubat."
          </p>
          <p className="text-sm text-yellow-100 drop-shadow">
            "Thank you, hero. The light has returned to San Gubat."
          </p>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
