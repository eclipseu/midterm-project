interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color?: "red-abyss" | "green-rot" | "blue-chill";
  showNumbers?: boolean;
  className?: string;
}

export const StatBar = ({
  label,
  current,
  max,
  color = "red-abyss",
  showNumbers = true,
  className = "",
}: StatBarProps) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isLow = percentage < 25;
  const isCritical = percentage < 10;

  const colorClasses = {
    "green-rot": "bg-green-700",
    "red-abyss": "bg-red-800",
    "blue-chill": "bg-blue-900",
  };

  const barColor = isCritical
    ? "bg-red-600 animate-pulse-fast"
    : isLow
    ? "bg-red-900 animate-pulse-slow"
    : colorClasses[color];

  return (
    <div className={`w-full font-mono ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm tracking-wider text-gray-500">{label}</span>
        {showNumbers && (
          <span
            className={`text-sm tracking-wider ${
              isCritical
                ? "text-red-400 animate-flicker"
                : isLow
                ? "text-red-600"
                : "text-gray-400"
            }`}
          >
            {current}/{max}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-950 rounded-full h-3 overflow-hidden shadow-inner-dark border border-gray-800">
        <div
          className={`h-full transition-all duration-300 ease-in-out ${barColor} drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]`}
          style={{ width: `${percentage}%` }}
        >
          {/* Unstable energy pulse */}
          <div className="h-full bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-pulse-shine"></div>
        </div>
      </div>
      {(isLow || isCritical) && (
        <div
          className={`text-xs mt-1 tracking-widest ${
            isCritical ? "text-red-400 animate-pulse-text" : "text-red-600"
          }`}
        >
          {isCritical ? "⚠️ CRITICAL SYSTEM FAILURE" : "⚠️ RESOURCE DEPLETION"}
        </div>
      )}
    </div>
  );
};

export default StatBar;
