import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ 
  text = "Loading...", 
  className,
  size = "md" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative flex items-center justify-center">
        {/* Segmented spinner */}
        <svg
          className={cn("animate-spin", sizeClasses[size])}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle (dim) */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeDasharray="8 4"
            opacity="0.3"
          />
          
          {/* Animated arc (bright) */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeDasharray="8 4"
            strokeDashoffset="0"
            strokeLinecap="round"
            style={{
              strokeDasharray: "70 212",
              transformOrigin: "center",
            }}
            className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
          />
        </svg>

        {/* Loading text */}
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center font-medium text-foreground",
            textSizeClasses[size]
          )}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
