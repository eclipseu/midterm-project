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
  // Define item icons/emojis for better visual representation
  const getItemIcon = (item: string): string => {
    const itemIcons: Record<string, string> = {
      Asin: "🧂", // Salt
      Bawang: "🧄", // Garlic
      Agimat: "✨", // Amulet
      Sword: "⚔️",
      Shield: "🛡️",
      Potion: "🧪",
      Key: "🗝️",
      Torch: "🔦",
      Rope: "🪢",
      Map: "🗺️",
    };

    return itemIcons[item] || "📦"; // Default icon for unknown items
  };

  return (
    <div
      className={`bg-white border-2 border-gray-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {playerName ? `${playerName}'s Inventory` : "Inventory"}
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {items.length} items
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🎒</div>
          <p className="text-gray-500 italic">Your inventory is empty</p>
          <p className="text-sm text-gray-400 mt-1">
            Collect items during your adventure
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 p-3 rounded-lg border border-gray-200"
            >
              <span className="text-xl" aria-label={item}>
                {getItemIcon(item)}
              </span>
              <span className="text-sm font-medium text-gray-700 truncate">
                {item}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Useful items hint */}
      {items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            💡 These items may be useful for certain choices in your adventure
          </p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
