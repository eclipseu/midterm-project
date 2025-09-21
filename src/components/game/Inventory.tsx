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
    // Replaced with a class that uses the horror accent color
    const iconProps = { size: 20, className: "text-horror" };

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
    // Use the `card-horror` class for a consistent, dark aesthetic
    <div className={`card-horror ${className}`}>
      <div className="flex items-center justify-between mb-2 border-b border-gray-700 pb-2">
        <h3 className="text-base font-elegant text-pale-text">
          {playerName ? `${playerName}'s Inventory` : "Inventory"}
        </h3>
        <span className="text-xs text-pale-text-muted bg-gray-700 px-2 py-1 rounded-full">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-3">
          <Package size={32} className="mx-auto mb-1 text-pale-text-muted" />
          <p className="text-sm text-pale-text-muted italic">
            A chilling emptiness...
          </p>
        </div>
      ) : (
        // Use a horror-themed class for the list container
        <div className="space-y-1">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="inventory-item focus-horror"
            >
              <span aria-label={item}>{getItemIcon(item)}</span>
              <span className="text-sm font-medium text-pale-text">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventory;
