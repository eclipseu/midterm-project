import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import StoryText from "../components/game/StoryText";
import ChoiceList from "../components/game/ChoiceList";
import Inventory from "../components/game/Inventory";
import StatBar from "../components/ui/StatBar";
import Button from "../components/ui/Button";
import type { Choice } from "../types/game.d";

export const GameScreen = () => {
  const navigate = useNavigate();
  const {
    gameState,
    dispatch,
    getCurrentNode,
    canSelectChoice,
    shouldHideChoice,
    saveGame,
  } = useGame();

  const currentNode = getCurrentNode();

  // Auto-save when game state changes
  useEffect(() => {
    if (gameState.gameStarted) {
      saveGame();
    }
  }, [gameState, saveGame]);

  // Navigate to appropriate screen when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      navigate("/gameover");
    } else if (gameState.isVictory) {
      navigate("/victory");
    }
  }, [gameState.isGameOver, gameState.isVictory, navigate]);

  const handleChoiceSelect = (choice: Choice) => {
    if (!canSelectChoice(choice)) {
      return;
    }

    dispatch({ type: "NAVIGATE_TO_NODE", nodeId: choice.to });
  };

  const handleResetGame = () => {
    dispatch({ type: "RESET_GAME" });
  };

  if (!gameState.gameStarted) {
    // Redirect to start screen if game hasn't been started
    navigate("/");
    return null;
  }

  const isGameEnded = gameState.isGameOver || gameState.isVictory;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with player info */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {gameState.player.name}'s Adventure
              </h1>
              <p className="text-sm text-gray-600">San Gubat Chronicles</p>
            </div>

            {/* Health bar */}
            <div className="w-full sm:w-64">
              <StatBar
                label="Health"
                current={gameState.player.hp}
                max={gameState.player.maxHp}
                color="red"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main game content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Story and choices - main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Story text */}
            <StoryText node={currentNode} className="w-full" />

            {/* Choices or game end actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {isGameEnded ? (
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {gameState.isVictory ? "Victory!" : "Game Over"}
                  </h3>
                  <p className="text-gray-600">
                    {gameState.isVictory
                      ? "Congratulations! You have successfully completed your quest in San Gubat."
                      : "Your adventure has come to an end. Would you like to try again?"}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleResetGame} variant="primary">
                      Start New Adventure
                    </Button>
                  </div>

                  {/* Game statistics */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Adventure Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        Locations visited: {gameState.visitedNodes.size}
                      </div>
                      <div>
                        Items collected: {gameState.player.inventory.length}
                      </div>
                      <div>
                        Final health: {gameState.player.hp}/
                        {gameState.player.maxHp}
                      </div>
                      <div>
                        Status:{" "}
                        {gameState.isVictory ? "🏆 Victory" : "💀 Defeated"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                currentNode?.choices && (
                  <ChoiceList
                    choices={currentNode.choices}
                    onChoiceSelect={handleChoiceSelect}
                    canSelectChoice={canSelectChoice}
                    shouldHideChoice={shouldHideChoice}
                  />
                )
              )}
            </div>
          </div>

          {/* Sidebar with inventory and game info */}
          <div className="space-y-6">
            {/* Inventory */}
            <Inventory
              items={gameState.player.inventory}
              playerName={gameState.player.name}
            />

            {/* Game progress info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Progress
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Locations explored:</span>
                  <span className="font-medium">
                    {gameState.visitedNodes.size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Items found:</span>
                  <span className="font-medium">
                    {gameState.player.inventory.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current location:</span>
                  <span className="font-medium text-blue-600">
                    {gameState.currentNodeId}
                  </span>
                </div>
              </div>

              {/* Game controls */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleResetGame}
                  variant="secondary"
                  size="small"
                  className="w-full"
                >
                  Restart Adventure
                </Button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                💡 Tips
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Collect items to unlock new choices</li>
                <li>• Watch your health carefully</li>
                <li>• Some paths lead to different endings</li>
                <li>• Your choices matter!</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameScreen;
