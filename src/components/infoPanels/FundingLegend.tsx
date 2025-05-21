import React from "react";

interface FundingLegendProps {
  maxFunding: number;
  getColorForValue: (value: number) => [number, number, number];
  className?: string;
}

const FundingLegend: React.FC<FundingLegendProps> = ({
  maxFunding,
  getColorForValue,
  className = "",
}) => {
  const gradientSteps = 20;
  const gradientArray = Array.from(
    { length: gradientSteps },
    (_, i) => i / (gradientSteps - 1),
  );

  const getRGBString = (rgbArray: [number, number, number]): string => {
    return `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
  };

  const formatCompactEuro = (value: number): string => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B€`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M€`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K€`;
    } else {
      return `${value}€`;
    }
  };

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="rounded-lg bg-white/60 px-1 py-1 backdrop-blur-md">
        <div className="mb-1 text-xs font-semibold">Legend</div>

        {/* Top value */}
        <div className="mb-1 text-xs">{formatCompactEuro(maxFunding)}</div>

        {/* Gradient Bar - Center it with mx-auto */}
        <div className="relative mx-auto h-40 w-3/4 overflow-hidden rounded border border-gray-300">
          <div className="absolute inset-0 flex flex-col-reverse text-center">
            {gradientArray.map((step, index) => {
              const value = maxFunding * step;
              const color = getRGBString(getColorForValue(value));
              return (
                <div
                  key={index}
                  className="w-full flex-1"
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom value */}
        <div className="mt-1 text-xs">{formatCompactEuro(0)}</div>
      </div>
    </div>
  );
};

export default FundingLegend;
