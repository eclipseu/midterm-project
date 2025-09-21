interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color?: "green" | "red" | "blue" | "yellow";
  showNumbers?: boolean;
  className?: string;
}

export const StatBar = ({
  label,
  current,
  max,
  color = "green",
  showNumbers = true,
  className = "",
}: StatBarProps) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isLow = percentage < 25;
  const isCritical = percentage < 10;

  const colorClasses = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
  };

  // Dynamic color based on health percentage
  const barColor = isCritical
    ? "bg-red-600"
    : isLow
    ? "bg-yellow-500"
    : colorClasses[color];

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showNumbers && (
          <span
            className={`text-sm font-medium ${
              isCritical
                ? "text-red-600"
                : isLow
                ? "text-yellow-600"
                : "text-gray-600"
            }`}
          >
            {current}/{max}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shine effect for better visual */}
          <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>
      {(isLow || isCritical) && (
        <div
          className={`text-xs mt-1 font-medium ${
            isCritical ? "text-red-600" : "text-yellow-600"
          }`}
        >
          {isCritical ? "⚠️ Critical!" : "⚠️ Low"}
        </div>
      )}
    </div>
  );
};

export default StatBar;
