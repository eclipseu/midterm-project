import React from "react";

interface GameLayoutProps {
  children: React.ReactNode;
}

function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-dark text-pale-text flex flex-col font-serif">
      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 p-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-sm text-pale-text-muted">
          &copy; {new Date().getFullYear()} Your Game Name. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default GameLayout;
