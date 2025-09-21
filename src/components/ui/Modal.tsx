import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: "small" | "medium" | "large" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = "medium",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
}: ModalProps) => {
  // Silence the living, a chilling presence
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // A dark shroud descends, a gasp stolen
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Don't turn your back on the shadows...
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-xs",
    medium: "max-w-md",
    large: "max-w-xl",
    full: "max-w-full mx-2",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 animate-pulse-slow">
      {/* The encroaching void */}
      <div
        className="absolute inset-0 bg-black/90 animate-fade-in-slow"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* The maw of the abyss */}
      <div
        className={`
          relative w-full ${sizeClasses[size]} mx-4 max-h-[95vh] 
          bg-gray-950 border border-red-900 
          transform transition-all duration-300 ease-in
          animate-shudder
          drop-shadow-[0_0_15px_rgba(255,0,0,0.5)] 
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* A grim whisper, a cold gaze */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-red-900">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-mono text-gray-500 tracking-wider"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto p-1 text-gray-700 hover:text-red-600 transition-colors duration-200 rounded-full focus:outline-none"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* The dreadful truth within */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// ... Utility components with horror-themed names and colors ...
export const ModalContent = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`space-y-4 ${className}`}>{children}</div>;

export const ModalFooter = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-4 border-t border-red-900 ${className}`}
  >
    {children}
  </div>
);

export const ModalBody = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`text-red-100/70 leading-relaxed ${className}`}>
    {children}
  </div>
);

export default Modal;
