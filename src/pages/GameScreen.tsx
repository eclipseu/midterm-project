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

  return (
    <div className="min-h-screen bg-dark text-pale-text font-serif">
      {/* Header with player info */}
      <header className="bg-gray-900 shadow-lg border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-pale-text font-elegant">
                {gameState.player.name}'s Adventure
              </h1>
              <p className="text-sm text-pale-text-muted">
                San Gubat Chronicles
              </p>
            </div>

            {/* Health bar */}
            <div className="w-full sm:w-64">
              <StatBar
                label="Health"
                current={gameState.player.hp}
                max={gameState.player.maxHp}
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
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 h-96 overflow-y-auto">
              <StoryText node={currentNode} />
            </div>

            {/* Choices */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
              {currentNode?.choices && (
                <ChoiceList
                  choices={currentNode.choices}
                  onChoiceSelect={handleChoiceSelect}
                  canSelectChoice={canSelectChoice}
                  shouldHideChoice={shouldHideChoice}
                />
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
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-pale-text mb-3 font-elegant">
                Progress
              </h3>
              <div className="space-y-2 text-sm text-pale-text-muted">
                <div className="flex justify-between">
                  <span>Locations explored:</span>
                  <span className="font-medium text-pale-text">
                    {gameState.visitedNodes.size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Items found:</span>
                  <span className="font-medium text-pale-text">
                    {gameState.player.inventory.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current location:</span>
                  <span className="font-medium text-red-accent">
                    {gameState.currentNodeId}
                  </span>
                </div>
              </div>

              {/* Game controls */}
              <div className="mt-4 pt-4 border-t border-gray-700">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameScreen;
