import { useState } from "react";

interface FilterMenuProps {
  codes: { id: string; label: string }[];
  secondaryCodes: { id: string; label: string }[];
  onFilterChange: (selectedCodes: string[]) => void;
  onSecondaryFilterChange: (selectedCodes: string[]) => void;
  visibleInstitutionsCount: number;
  totalInstitutionsCount: number;
}

export const CATEGORY_COLORS: Record<string, [number, number, number]> = {
  "agricultural sciences": [76, 175, 80], // Green
  "engineering and technology": [255, 152, 0], // Orange
  "humanities": [156, 39, 176], // Purple
  "medical and health sciences": [244, 67, 54], // Red
  "natural sciences": [33, 150, 243], // Blue
  "social sciences": [255, 193, 7], // Amber
};

export default function FilterMenu({
  codes,
  secondaryCodes,
  onFilterChange,
  onSecondaryFilterChange,
  visibleInstitutionsCount,
  totalInstitutionsCount,
}: FilterMenuProps) {
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [selectedSecondaryCodes, setSelectedSecondaryCodes] = useState<
    Set<string>
  >(new Set());

  const handleToggle = (code: string, isPrimary: boolean) => {
    if (isPrimary) {
      const newSelected = new Set(selectedCodes);
      if (newSelected.has(code)) {
        newSelected.delete(code);
      } else {
        newSelected.add(code);
      }
      setSelectedCodes(newSelected);
      onFilterChange(Array.from(newSelected));
    } else {
      const newSelected = new Set(selectedSecondaryCodes);
      if (newSelected.has(code)) {
        newSelected.delete(code);
      } else {
        newSelected.add(code);
      }
      setSelectedSecondaryCodes(newSelected);
      onSecondaryFilterChange(Array.from(newSelected));
    }
  };

  return (
    <div className="w-64 bg-white p-4 overflow-y-auto border-r h-full">
      {/* Institution Count Section */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <h2 className="text-sm font-medium text-gray-600">
          Visible Institutions
        </h2>
        <p className="text-2xl font-bold">{visibleInstitutionsCount}</p>
        <p className="text-sm text-gray-500">
          of {totalInstitutionsCount} total
        </p>
      </div>

      {/* Primary Topics Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter by Primary Topic</h2>
        <div className="space-y-2">
          {codes.map(({ id, label }) => {
            const rgb = CATEGORY_COLORS[label.toLowerCase()] || [128, 128, 128];
            return (
              <label
                key={id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCodes.has(id)}
                  onChange={() => handleToggle(id, true)}
                  className="rounded border-gray-300"
                />
                <span
                  className="text-sm"
                  style={{
                    color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                    fontWeight: "medium",
                  }}
                >
                  {label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Secondary Topics Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Filter by Secondary Topic
        </h2>
        <div className="space-y-2">
          {secondaryCodes.map(({ id, label }) => (
            <label
              key={id}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedSecondaryCodes.has(id)}
                onChange={() => handleToggle(id, false)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// import { useState } from "react";

// interface FilterMenuProps {
//   codes: { id: string; label: string }[];
//   onFilterChange: (selectedCodes: string[]) => void;
// }

// export default function FilterMenu({ codes, onFilterChange }: FilterMenuProps) {
//   const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

//   const handleToggle = (code: string) => {
//     const newSelected = new Set(selectedCodes);
//     if (newSelected.has(code)) {
//       newSelected.delete(code);
//     } else {
//       newSelected.add(code);
//     }
//     setSelectedCodes(newSelected);
//     onFilterChange(Array.from(newSelected));
//   };

//   return (
//     <div className="w-64 bg-white p-4 overflow-y-auto border-r">
//       <h2 className="text-lg font-semibold mb-4">Filter by Topic</h2>
//       <div className="space-y-2">
//         {codes.map(({ id, label }) => (
//           <label
//             key={id}
//             className="flex items-center space-x-2 cursor-pointer"
//           >
//             <input
//               type="checkbox"
//               checked={selectedCodes.has(id)}
//               onChange={() => handleToggle(id)}
//               className="rounded border-gray-300"
//             />
//             <span className="text-sm">{label}</span>
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// }
