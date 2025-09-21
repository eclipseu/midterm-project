import React from "react";
import { useGame } from "../../contexts/GameContext";
import { HPBar } from "../ui/HPBar";

interface GameLayoutProps {
  children: React.ReactNode;
}

function GameLayout({ children }: GameLayoutProps) {
  const { gameState } = useGame();
  const { player } = gameState;

  return (
    <div className="min-h-screen bg-dark text-pale-text flex flex-col font-serif">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-3xl font-title text-red-accent tracking-wider">
              San Gubat Chronicles
            </h1>
            <div className="text-pale-text-muted">
              <div className="text-sm">Player: {player.name || "Unknown"}</div>
            </div>
          </div>

          {/* HP Bar - Show only when game has started */}
          {gameState.gameStarted && (
            <HPBar
              currentHP={player.hp}
              maxHP={player.maxHp}
              className="max-w-md"
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 p-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-pale-text-muted text-sm">
          © 2025 San Gubat Chronicles. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default GameLayout;
