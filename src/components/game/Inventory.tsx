import {
  Shield,
  Sword,
  Zap,
  Key,
  Flame,
  Map,
  Package,
  Sparkles,
  Beaker,
} from "lucide-react";
import type { ReactElement } from "react";

interface InventoryProps {
  items: string[];
  playerName?: string;
  className?: string;
}

export const Inventory = ({
  items,
  playerName,
  className = "",
}: InventoryProps) => {
  // Define item icons using Lucide React
  const getItemIcon = (item: string): ReactElement => {
    const iconProps = { size: 20, className: "text-red-accent" };

    const itemIcons: Record<string, ReactElement> = {
      Asin: <Sparkles {...iconProps} />, // Salt - sparkles for magical properties
      Bawang: <Zap {...iconProps} />, // Garlic - zap for protective power
      Agimat: <Shield {...iconProps} />, // Amulet - shield for protection
      Sword: <Sword {...iconProps} />,
      Shield: <Shield {...iconProps} />,
      Potion: <Beaker {...iconProps} />,
      Key: <Key {...iconProps} />,
      Torch: <Flame {...iconProps} />,
      Rope: <Package {...iconProps} />, // Using package for rope/misc items
      Map: <Map {...iconProps} />,
    };

    return itemIcons[item] || <Package {...iconProps} />; // Default icon for unknown items
  };

  return (
    <div
      className={`bg-gray-800 border-2 border-gray-600 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-pale-text">
          {playerName ? `${playerName}'s Inventory` : "Inventory"}
        </h3>
        <span className="text-sm text-pale-text-muted bg-gray-700 px-2 py-1 rounded-full">
          {items.length} items
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6">
          <Package size={48} className="mx-auto mb-2 text-pale-text-muted" />
          <p className="text-pale-text-muted italic">Your inventory is empty</p>
          <p className="text-sm text-pale-text-muted mt-1">
            Collect items during your adventure
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 p-3 rounded-lg border border-gray-600 hover:border-red-accent"
            >
              <span aria-label={item}>{getItemIcon(item)}</span>
              <span className="text-sm font-medium text-pale-text truncate">
                {item}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Useful items hint */}
      {items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <p className="text-xs text-pale-text-muted">
            💡 These items may be useful for certain choices in your adventure
          </p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
