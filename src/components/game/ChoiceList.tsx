import type { Choice } from "../../types/game.d";
import Button from "../ui/Button";
import { useAudio } from "../../contexts/AudioContext";

interface ChoiceListProps {
  choices: Choice[];
  onChoiceSelect: (choice: Choice) => void;
  canSelectChoice: (choice: Choice) => boolean;
  shouldHideChoice: (choice: Choice) => boolean;
  className?: string;
}

export const ChoiceList = ({
  choices,
  onChoiceSelect,
  canSelectChoice,
  shouldHideChoice,
  className = "",
}: ChoiceListProps) => {
  const { playSoundEffect } = useAudio();

  // Filter out hidden choices
  const visibleChoices = choices.filter((choice) => !shouldHideChoice(choice));

  const handleChoiceClick = (choice: Choice) => {
    const canSelect = canSelectChoice(choice);
    if (canSelect) {
      playSoundEffect("choice");
      onChoiceSelect(choice);
    }
  };

  if (visibleChoices.length === 0) {
    return (
      <div className={`p-4 bg-gray-700 rounded-lg ${className}`}>
        <p className="text-pale-text-muted italic text-center">
          No choices available
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleChoices.map((choice, index) => {
        const canSelect = canSelectChoice(choice);
        const requiresItem = choice.requires;

        return (
          <div key={index} className="relative">
            <Button
              onClick={() => handleChoiceClick(choice)}
              disabled={!canSelect}
              variant={canSelect ? "primary" : "secondary"}
              size="medium"
              fullWidth={false}
              className="horror-choice-button p-4 min-h-[52px]"
            >
              <div className="flex flex-col items-center text-center w-full">
                <span className="choice-text text-base leading-relaxed uppercase tracking-wide">
                  {choice.text}
                </span>

                {requiresItem && (
                  <span
                    className={`text-sm mt-1 text-center ${
                      canSelect ? "text-red-300" : "text-pale-text-muted"
                    }`}
                  >
                    {canSelect
                      ? ` ✓ ${requiresItem}`
                      : ` ⚠️ Requires: ${requiresItem}`}
                  </span>
                )}
              </div>
            </Button>

            <div className="absolute left-3 top-3 w-6 h-6 bg-red-accent/20 rounded-full flex items-center justify-center text-xs font-bold text-pale-text"></div>
          </div>
        );
      })}

      {/* Muted helper text */}
      <div className="mt-2 choices-help-text">
        <p>Some choices may require specific items from your inventory.</p>
      </div>
    </div>
  );
};

export default ChoiceList;
