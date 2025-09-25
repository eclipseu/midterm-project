import { useState, useEffect, useCallback, useRef } from "react";
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
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const timerRef = useRef<number | null>(null);

  const text = node?.text || "";

  // Typewriter animation effect
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!text) {
      setDisplayedText("");
      setIsTyping(false);
      setShowArrow(false);
      return;
    }

    // Reset animation when text changes
    setDisplayedText("");
    setIsTyping(true);
    setShowArrow(false);

    let currentIndex = 0;
    timerRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        currentIndex++;
        setDisplayedText(text.slice(0, currentIndex));
      } else {
        setIsTyping(false);
        setShowArrow(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 30); // 30ms per character for smooth typewriter effect

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text]);

  // Skip animation or continue to next dialogue
  const handleContinue = useCallback(() => {
    if (isTyping) {
      // Clear the timer to stop animation
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Skip typewriter animation
      setDisplayedText(text);
      setIsTyping(false);
      setShowArrow(true);
    } else {
      // Continue to next dialogue
      setShowArrow(false);
      onDialogueComplete();
    }
  }, [isTyping, text, onDialogueComplete]);

  // Spacebar event listener
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        handleContinue();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleContinue]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  if (!node) {
    return null;
  }

  return (
    <div className={`dialogue-box relative ${className}`}>
      {/* Arrow Button - Top Right (Inside DialogueBox container) */}
      {showArrow && (
        <button
          onClick={handleContinue}
          className="arrow-button absolute top-4 right-4 z-25"
          aria-label="Continue dialogue"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Dialogue Content */}
      <div className="dialogue-text">
        <p className="font-body text-justify">
          {displayedText}
          {isTyping && <span className="typewriter-cursor">|</span>}
        </p>

        {/* Spacebar prompts */}
        <div className="spacebar-prompt">
          {isTyping && (
            <span className="skip-prompt">Press SPACE to skip...</span>
          )}
          {!isTyping && showArrow && (
            <span className="continue-prompt">Press SPACE to continue...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogueBox;
