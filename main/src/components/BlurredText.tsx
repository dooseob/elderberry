import { cn } from "../utils";

interface BlurredTextProps {
  text: string;
  className?: string;
}

export function BlurredText({ text, className }: BlurredTextProps) {
  return (
    <div className="relative inline-block">
      <div className="absolute inset-0 blur-sm opacity-50 pointer-events-none">
        <span className={cn("hero-heading text-text-main", className)}>
          {text}
        </span>
      </div>
      <span className={cn("relative hero-heading text-text-main", className)}>
        {text}
      </span>
    </div>
  );
}