import React from "react";

type HeartVariant = "full" | "half" | "empty";

interface HeartBarProps {
  current: number;
  max: number;
  size?: number; // pixel size per heart
  className?: string;
}

const HeartIcon: React.FC<{
  variant: HeartVariant;
  size: number;
  idSuffix: string;
}> = ({ variant, size, idSuffix }) => {
  const gradId = `heartGrad-${idSuffix}`;
  const clipId = `heartHalf-${idSuffix}`;
  const stroke = variant !== "empty" ? "#a11" : "#333";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`heart ${
        variant === "full"
          ? "heart-full"
          : variant === "half"
          ? "heart-half"
          : "heart-empty"
      }`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="100%" stopColor="#b50000" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      {/* Base heart path */}
      <path
        d="M12 21s-6.716-4.265-9.294-7.22C.7 11.529.86 8.39 3.05 6.77 4.9 5.4 7.37 5.67 9 7.2l.94.9.94-.9c1.63-1.53 4.1-1.8 5.95-.43 2.19 1.62 2.35 4.76.344 7.01C18.716 16.735 12 21 12 21z"
        fill={
          variant === "empty"
            ? "#0b0b0b"
            : variant === "full"
            ? `url(#${gradId})`
            : "#0b0b0b"
        }
        stroke={stroke}
        strokeWidth="1"
      />
      {variant === "half" && (
        <path
          d="M12 21s-6.716-4.265-9.294-7.22C.7 11.529.86 8.39 3.05 6.77 4.9 5.4 7.37 5.67 9 7.2l.94.9.94-.9c1.63-1.53 4.1-1.8 5.95-.43 2.19 1.62 2.35 4.76.344 7.01C18.716 16.735 12 21 12 21z"
          fill={`url(#${gradId})`}
          clipPath={`url(#${clipId})`}
        />
      )}
    </svg>
  );
};

export const HeartBar: React.FC<HeartBarProps> = ({
  current,
  max,
  size = 22,
  className = "",
}) => {
  const totalSlots = 10;
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const heartsValue = ratio * totalSlots;
  const fullCount = Math.floor(heartsValue);
  const hasHalf = heartsValue - fullCount >= 0.5 ? 1 : 0;
  const hearts: HeartVariant[] = Array.from({ length: totalSlots }, (_, i) => {
    if (i < fullCount) return "full";
    if (i === fullCount && hasHalf) return "half";
    return "empty";
  });
  const isLow = ratio <= 0.25;

  return (
    <div
      className={`heart-bar ${
        isLow ? "heart-bar-low" : ""
      } ${className}`.trim()}
    >
      {hearts.map((variant, idx) => (
        <HeartIcon
          key={idx}
          variant={variant}
          size={size}
          idSuffix={`${idx}`}
        />
      ))}
    </div>
  );
};

export default HeartBar;
