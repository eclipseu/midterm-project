import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  animated?: boolean;
}

export const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "large",
  className = "",
  type = "button",
  fullWidth = true,
  animated = true,
}: ButtonProps) => {
  // Base classes that apply to all buttons
  const baseClasses = `font-elegant rounded-lg transition-all duration-300 focus:outline-none focus-horror ${
    animated ? "transform" : ""
  } ${fullWidth ? "w-full" : ""}`;

  // Variant styles using horror theme
  const variantClasses = {
    primary:
      "btn-horror text-white hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none",
    secondary:
      "btn-horror-secondary text-pale-text hover:scale-105 disabled:hover:scale-100",
    danger:
      "bg-red-800 hover:bg-red-700 text-white border border-red-700 hover:scale-105 focus:ring-red-500 disabled:bg-gray-800 disabled:hover:scale-100",
  };

  // Size styles
  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };

  // Disabled state
  const disabledClasses = disabled
    ? "opacity-60 cursor-not-allowed"
    : "cursor-pointer";

  // Combine all classes
  const classes =
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim();

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
