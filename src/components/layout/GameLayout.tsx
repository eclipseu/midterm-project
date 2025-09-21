import React from "react";

interface GameLayoutProps {
  children: React.ReactNode;
}

function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-400">
            San Gubat Chronicles
          </h1>
          <div className="text-gray-300">
            {/* HP bar placeholder - can be populated by parent components */}
            <div className="text-sm">HP: --/--</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-gray-400 text-sm">
          © Aswang Hunter
        </div>
      </footer>
    </div>
  );
}

export default GameLayout;
