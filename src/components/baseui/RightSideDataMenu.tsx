import { ChevronRight, Database } from "lucide-react";
import { ReactNode, useCallback, useState } from "react";
import { Button } from "shadcn/button";
import { cn } from "shadcn/utils/shadcn-utils";
import { BTN_SCALE, STRK_WDTH } from "./BaseUIComponents";

interface RightSideDataMenuProps {
  children?: ReactNode;
}

export default function RightSideDataMenu({
  children,
}: RightSideDataMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const getWidthClass = () => {
    return "w-[85%] md:w-[30%]";
  };
  return (
    <div
      className={`border-grey-300 absolute right-0 top-0 z-20 h-full bg-white/70 backdrop-blur-lg transition-all duration-200 ${
        isOpen ? `${getWidthClass()} border-l` : "w-0"
      }`}
    >
      {/* Toggle Button */}
      <div className="absolute -left-10 top-1/2 z-20 -translate-y-1/2 md:-left-16">
        <Button
          variant="secondary"
          className="h-10 w-10 rounded-s-full bg-white text-orange-500 shadow-lg md:h-16 md:w-16"
          onClick={toggleOpen}
        >
          {isOpen ? (
            <ChevronRight strokeWidth={STRK_WDTH} className={BTN_SCALE} />
          ) : (
            <Database
              strokeWidth={STRK_WDTH}
              className={cn(BTN_SCALE, "ml-1 md:ml-2")}
            />
          )}
        </Button>
      </div>
      {/* Content */}
      <div className="h-full overflow-auto">
        {isOpen && <div className="p-4">{children}</div>}
      </div>{" "}
    </div>
  );
}
