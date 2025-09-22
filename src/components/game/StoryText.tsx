import type { StoryNode } from "../../types/game.d";

interface StoryTextProps {
  node: StoryNode | null;
  className?: string;
}

export const StoryText = ({ node, className = "" }: StoryTextProps) => {
  if (!node) {
    return (
      <div className={`p-6 bg-gray-800 rounded-lg ${className}`}>
        <p className="text-pale-text-muted italic">Loading story...</p>
      </div>
    );
  }

  // Check if this is an ending node for special styling
  const isEnding = node.isEnding;
  const isVictory =
    isEnding &&
    (node.text.toLowerCase().includes("saved") ||
      node.text.toLowerCase().includes("victory") ||
      node.text.toLowerCase().includes("sun begins to rise"));
  const isDefeat = isEnding && !isVictory;

  const bgColor = isVictory
    ? "bg-green-900 border-green-600"
    : isDefeat
    ? "bg-red-900 border-red-600"
    : "bg-gray-800 border-gray-600";

  const textColor = isVictory
    ? "text-green-200"
    : isDefeat
    ? "text-red-200"
    : "text-pale-text";

  return (
    <div
      className={`p-6 rounded-lg border-2 shadow-sm ${bgColor} ${className}`}
    >
      {isEnding && (
        <div
          className={`text-sm font-semibold mb-3 ${
            isVictory ? "text-green-400" : "text-red-400"
          }`}
        >
          {isVictory ? "VICTORY!" : "GAME OVER"}
        </div>
      )}

      <div className={`text-lg leading-relaxed ${textColor} font-serif`}>
        {/* Format the story text with proper paragraph breaks */}
        {node.text.split("\n").map((paragraph, index) => (
          <p
            key={index}
            className={paragraph.trim() ? "mb-4 last:mb-0" : "mb-2"}
          >
            {paragraph.trim() || "\u00A0"}{" "}
            {/* Non-breaking space for empty lines */}
          </p>
        ))}
      </div>

      {/* Special ending indicators */}
      {isEnding && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className="text-sm text-pale-text-muted italic">
            {isVictory
              ? "Congratulations! You have completed your quest successfully."
              : "Your adventure has come to an end. Try again to discover a different fate."}
          </p>
        </div>
      )}
    </div>
  );
};

export default StoryText;
