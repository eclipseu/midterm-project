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

  useEffect(() => {
    if (!statsUpdated && gameState.gameStarted) {
      const currentStats = getPlayerStats();
      const newStats = {
        gamesPlayed: currentStats.gamesPlayed + 1,
        gamesLost: currentStats.gamesLost + 1,
        lastPlayedAt: Date.now(),
      };

      savePlayerStats(newStats);
      setStatsUpdated(true);
    }
  }, [gameState.gameStarted, statsUpdated]);

  const handlePlayAgain = async () => {
    setIsResetting(true);
    try {
      await clearGame(false);
      dispatch({ type: "RESET_GAME" });
      navigate("/");
    } catch (error) {
      console.error("Failed to reset game:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const finalStats = {
    locationsVisited: gameState.visitedNodes.size,
    itemsCollected: gameState.player.inventory.length,
    finalHealth: gameState.player.hp,
    maxHealth: gameState.player.maxHp,
    damageReceived: gameState.player.maxHp - gameState.player.hp,
    currentLocation: gameState.currentNodeId,
    playerName: gameState.player.name,
  };

  const getGameOverReason = () => {
    if (gameState.player.hp <= 0) {
      return {
        title: "HEALTH DEPLETED",
        message: "Your wounds proved too severe to continue the hunt.",
        color: "text-red-600",
      };
    } else {
      return {
        title: "QUEST FAILED",
        message: "Your adventure has come to an unfortunate end.",
        color: "text-red-600",
      };
    }
  };

  const gameOverInfo = getGameOverReason();

  return (
    <div className="game-over-screen flex items-center justify-center p-6 font-serif">
      {/* Background mist/smoke */}
      <div className="game-over-bg-mist" aria-hidden>
        <div className="mist-layer" />
        <div className="mist-layer" />
        <div className="mist-layer" />
      </div>

      <div className="max-w-3xl w-full animate-fade-in game-over-card">
        {/* Header */}
        <div className="text-center p-8 border-b border-red-900/40">
          <div className="text-7xl mb-4"></div>
          <h1 className="text-5xl font-bold tracking-widest text-red-200 flicker-text">
            GAME OVER
          </h1>
          <p className="mt-4 text-red-300 italic text-lg max-w-xl mx-auto">
            {gameOverInfo.message}
          </p>
        </div>

        {/* Player Info */}
        <div className="p-6 border-b border-red-900/30 text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            {finalStats.playerName}'s Final Stand
          </h2>
          <p className="text-gray-300">
            Your journey ended at{" "}
            <span className="font-bold text-red-500">
              {finalStats.currentLocation}
            </span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="p-8 grid grid-cols-2 gap-6">
          <div className="stat-tile stat-glow-blue text-center">
            <div className="text-3xl font-bold text-blue-400">
              {finalStats.locationsVisited}
            </div>
            <p className="text-sm text-gray-400">Locations Explored</p>
          </div>

          <div className="stat-tile stat-glow-green text-center">
            <div className="text-3xl font-bold text-green-400">
              {finalStats.itemsCollected}
            </div>
            <p className="text-sm text-gray-400">Items Collected</p>
          </div>

          <div className="stat-tile stat-glow-red text-center">
            <div className="text-3xl font-bold text-red-400">
              {finalStats.finalHealth}/{finalStats.maxHealth}
            </div>
            <p className="text-sm text-gray-400">Final Health</p>
          </div>

          <div className="stat-tile stat-glow-purple text-center">
            <div className="text-3xl font-bold text-purple-400">
              {finalStats.damageReceived}
            </div>
            <p className="text-sm text-gray-400">Damage Taken</p>
          </div>
        </div>

        {/* Actions */}
        <div className="game-over-actions">
          <Button
            onClick={handlePlayAgain}
            disabled={isResetting}
            variant="primary"
            size="large"
            className="btn-blood btn-cta"
          >
            {isResetting ? "Resetting..." : "Play Again"}
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

export default GameOverScreen;
