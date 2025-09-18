import { ChevronLeft, Filter } from "lucide-react";
import { ReactNode, useCallback, useState } from "react";
import { Button } from "shadcn/button";
import { cn } from "shadcn/utils/shadcn-utils";
import { BTN_SCALE, STRK_WDTH } from "./BaseUIComponents";

interface LeftSideFiltersProps {
  children: ReactNode;
}

export default function LeftSideFilters({ children }: LeftSideFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div
      className={`border-grey-300 absolute left-0 top-0 z-20 h-full bg-white/70 backdrop-blur-lg transition-all duration-200 ${
        isOpen ? "w-[85%] border-r md:w-[25%]" : "w-0"
      }`}
    >
      {/* Toggle Button */}
      <div className="absolute -right-10 top-1/2 z-20 -translate-y-1/2 md:-right-16">
        <Button
          variant="secondary"
          className="h-10 w-10 rounded-e-full bg-white text-orange-500 shadow-lg md:h-16 md:w-16"
          onClick={toggleOpen}
        >
          {isOpen ? (
            <ChevronLeft strokeWidth={STRK_WDTH} className={BTN_SCALE} />
          ) : (
            <Filter
              strokeWidth={STRK_WDTH}
              className={cn(BTN_SCALE, "mr-1 md:mr-2")}
            />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="h-full overflow-auto">
        {isOpen && (
          <div className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            </div>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
