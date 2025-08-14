import { ChevronRight } from "lucide-react";

interface CTAButtonsProps {
  onStartBuilding?: () => void;
  onLearnMore?: () => void;
}

export function CTAButtons({ onStartBuilding, onLearnMore }: CTAButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      {/* Primary CTA */}
      <div className="relative">
        <div className="absolute inset-0 blur-sm opacity-50 pointer-events-none">
          <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg">
            Start Elby
          </button>
        </div>
        <button
          onClick={onStartBuilding}
          className="relative bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200"
        >
          Start Elby
        </button>
      </div>

      {/* Secondary CTA */}
      <div className="relative">
        <div className="absolute inset-0 blur-sm opacity-50 pointer-events-none">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm">
            <span className="text-primary font-semibold">
              Introducing AI Matching
            </span>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
        </div>
        <button
          onClick={onLearnMore}
          className="relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all duration-200"
        >
          <span className="text-primary font-semibold">
            Introducing AI Matching
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </button>
      </div>
    </div>
  );
}