import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { useAudio } from "../contexts/AudioContext";
import {
  clearGame,
  savePlayerStats,
  getPlayerStats,
} from "../services/persistence";
import Button from "../components/ui/Button";

export const VictoryScreen = () => {
  const navigate = useNavigate();
  const { gameState, dispatch } = useGame();
  const { playBackground } = useAudio();
  const [isResetting, setIsResetting] = useState(false);
  const [statsUpdated, setStatsUpdated] = useState(false);

  // Play victory background music when component mounts
  useEffect(() => {
    playBackground("background-victory");
  }, [playBackground]);

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
    <div className="victory-screen flex items-center justify-center p-6 font-serif">
      {/* Background mist/smoke */}
      <div className="victory-bg-mist" aria-hidden>
        <div className="mist-layer" />
        <div className="mist-layer" />
        <div className="mist-layer" />
      </div>

      <div className="max-w-3xl w-full animate-fade-in victory-card">
        {/* Header */}
        <div className="text-center p-8 border-b border-yellow-600/30">
          <div className="text-7xl mb-4"></div>
          <h1 className="text-5xl font-bold tracking-widest flicker-text-gold">
            VICTORY!
          </h1>
          <p className="mt-4 text-yellow-200 italic text-lg max-w-xl mx-auto">
            You have successfully vanquished the darkness and saved the town!
          </p>
        </div>

        {/* Hero Info */}
        <div className="p-6 border-b border-yellow-600/20 text-center">
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            {finalStats.playerName}'s Triumph
          </h2>
          <p className="text-gray-200">
            The sun rises over San Gubat, and the townspeople are safe once
            more.
          </p>
        </div>

        {/* Victory Statistics */}
        <div className="p-8 grid grid-cols-2 gap-6">
          <div className="stat-tile victory-stat-tile stat-glow-gold text-center">
            <div className="text-3xl font-bold text-blue-300">
              {finalStats.locationsVisited}
            </div>
            <p className="text-sm text-gray-300">Locations Explored</p>
          </div>

          <div className="stat-tile victory-stat-tile stat-glow-gold text-center">
            <div className="text-3xl font-bold text-green-300">
              {finalStats.itemsCollected}
            </div>
            <p className="text-sm text-gray-300">Items Collected</p>
          </div>

          <div className="stat-tile victory-stat-tile stat-glow-gold text-center">
            <div className="text-3xl font-bold text-yellow-300">
              {finalStats.healthPercentage}%
            </div>
            <p className="text-sm text-gray-300">Health Remaining</p>
          </div>

          <div className="stat-tile victory-stat-tile stat-glow-gold text-center">
            <div className="text-3xl font-bold text-yellow-300">⭐</div>
            <p className="text-sm text-gray-300">Perfect Victory</p>
          </div>
        </div>

        {/* Actions */}
        <div className="victory-actions">
          <Button
            onClick={handlePlayAgain}
            disabled={isResetting}
            variant="primary"
            size="large"
            className="btn-blessing btn-cta"
          >
            {isResetting ? "Preparing New Quest..." : "New Adventure"}
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="secondary"
            size="large"
            className="btn-ghost btn-cta"
          >
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
