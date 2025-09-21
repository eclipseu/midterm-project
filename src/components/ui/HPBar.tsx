import React from "react";

interface HPBarProps {
  currentHP: number;
  maxHP: number;
  className?: string;
}

export const HPBar: React.FC<HPBarProps> = ({
  currentHP,
  maxHP,
  className = "",
}) => {
  const hpPercentage = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));

  // Different colors based on HP level
  const getBarColor = (percentage: number) => {
    if (percentage > 60) return "bg-green-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-red-accent";
  };

  return (
    <div className={`w-full ${className}`}>
      {/* HP Text */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-pale-text">Health</span>
        <span className="text-sm font-medium text-pale-text">
          {currentHP} / {maxHP}
        </span>
      </div>

      {/* Progress Bar Background */}
      <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
        {/* Progress Bar Fill */}
        <div
          className={`h-3 rounded-full transition-all duration-500 ease-out ${getBarColor(
            hpPercentage
          )} shadow-lg`}
          style={{ width: `${hpPercentage}%` }}
        >
          {/* Inner highlight for 3D effect */}
          <div className="h-full w-full bg-gradient-to-t from-transparent to-white opacity-20 rounded-full"></div>
        </div>
      </div>

      {/* Low HP warning */}
      {hpPercentage <= 25 && (
        <div className="text-xs text-red-400 mt-1 animate-pulse">
          ⚠️ Critical Health!
        </div>
      )}
    </div>
  );
};

export default HPBar;
