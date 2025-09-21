import type { Choice } from "../../types/game.d";
import Button from "../ui/Button";

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
  // Filter out hidden choices
  const visibleChoices = choices.filter((choice) => !shouldHideChoice(choice));

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
      <h3 className="text-lg font-semibold text-pale-text mb-4 font-elegant">
        Choose your action:
      </h3>

      {visibleChoices.map((choice, index) => {
        const canSelect = canSelectChoice(choice);
        const requiresItem = choice.requires;

        return (
          <div key={index} className="relative">
            <Button
              onClick={() => canSelect && onChoiceSelect(choice)}
              disabled={!canSelect}
              variant={canSelect ? "primary" : "secondary"}
              size="medium"
              className="w-full text-left justify-start p-4 min-h-[60px]"
            >
              <div className="flex flex-col items-start">
                <span className="text-base leading-relaxed">{choice.text}</span>

                {requiresItem && (
                  <span
                    className={`text-sm mt-1 ${
                      canSelect ? "text-red-300" : "text-pale-text-muted"
                    }`}
                  >
                    {canSelect
                      ? `✓ ${requiresItem}`
                      : `⚠️ Requires: ${requiresItem}`}
                  </span>
                )}
              </div>
            </Button>

            {/* Visual indicator for choice number */}
            <div className="absolute left-3 top-3 w-6 h-6 bg-red-accent/20 rounded-full flex items-center justify-center text-xs font-bold text-pale-text">
              {index + 1}
            </div>
          </div>
        );
      })}

      {/* Help text */}
      <div className="mt-4 text-sm text-pale-text-muted">
        <p>💡 Some choices may require specific items from your inventory.</p>
      </div>
    </div>
  );
};

export default ChoiceList;
