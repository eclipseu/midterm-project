import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { StoryNode } from "../../types/game.d";

interface DialogueBoxProps {
  node: StoryNode | null;
  onDialogueComplete: () => void;
  className?: string;
}

export const DialogueBox = ({
  node,
  onDialogueComplete,
  className = "",
}: DialogueBoxProps) => {
  const [showArrow, setShowArrow] = useState(true);

  if (!node) {
    return null;
  }

  const handleArrowClick = () => {
    setShowArrow(false);
    onDialogueComplete();
  };

  return (
    <div className={`dialogue-box relative ${className}`}>
      {/* Arrow Button - Top Right (Inside DialogueBox container) */}
      {showArrow && (
        <button
          onClick={handleArrowClick}
          className="arrow-button absolute top-4 right-4 z-25"
          aria-label="Continue dialogue"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Dialogue Content */}
      <div className="dialogue-text">
        <p className="font-body text-justify">{node.text}</p>
      </div>
    </div>
  );
};

export default DialogueBox;
