import { X } from "lucide-react";
import { ReactNode } from "react";
import { H2 } from "shadcn/typography";

export default function SelectedInfo({
  show,
  setSelectedInfo,
  children,
}: {
  show: boolean | string;
  setSelectedInfo: (o: boolean) => void;
  children: ReactNode;
}) {
  let name = "";
  if (show == "i") name = "Institution";
  if (show == "p") name = "Project";
  if (show == "r") name = "ResearchOutput";
  return (
    show && (
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div
          className="relative max-h-[80vh] w-11/12 max-w-2xl overflow-y-auto rounded-xl bg-white/90 p-6 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row justify-between">
            <H2 className="text-xl font-semibold text-gray-800">{name}</H2>
            <button
              className="-mt-3 mb-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedInfo(false)}
            >
              <X className="text-gray-500" />
            </button>
          </div>
          <div className="mb-4 h-px w-full bg-gray-300" />
          {children}
        </div>
      </div>
    )
  );
}
