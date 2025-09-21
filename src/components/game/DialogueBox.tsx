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
    <div className={`dialogue-box card-horror relative ${className}`}>
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
      <div className="p-8 h-full flex flex-col justify-center">
        <div className="max-w-none">
          <p className="text-lg leading-relaxed text-gray-100 font-body">
            {node.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DialogueBox;
