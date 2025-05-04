import React, { useState, useMemo } from "react";
import { Globe, X } from "lucide-react";
import { Button } from "shadcn/button";
import { H4 } from "shadcn/typography";
import { Label } from "shadcn/label";
import { RadioGroup, RadioGroupItem } from "shadcn/radio-group";

interface CountryRankingData {
  countryCode: string;
  amount: number;
  formattedAmount: string;
  rank: number;
}

interface CountryPanelProps {
  countryFundingMap: Record<string, number>;
  year: number;
  formatEuro: (value: number) => string;
}

const CountryRankingPanel: React.FC<CountryPanelProps> = ({
  countryFundingMap,
  year,
  formatEuro,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [maxItems, setMaxItems] = useState<string>("10");

  // Calculate country rankings
  const rankings = useMemo(() => {
    const countries = Object.entries(countryFundingMap)
      .map(([countryCode, amount]) => ({ countryCode, amount }))
      .filter((country) => country.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return countries.map((country, index) => ({
      countryCode: country.countryCode,
      amount: country.amount,
      formattedAmount: formatEuro(country.amount),
      rank: index + 1,
    }));
  }, [countryFundingMap, formatEuro]);

  // Filter rankings based on maxItems
  const filteredRankings = useMemo(() => {
    const limit = maxItems === "All" ? Infinity : parseInt(maxItems);
    return rankings.slice(0, limit);
  }, [rankings, maxItems]);

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        className="absolute right-14 top-2 z-10 h-10 w-10 rounded-xl bg-white text-orange-500"
        onClick={() => setIsOpen(true)}
      >
        <Globe strokeWidth={2.2} style={{ transform: "scale(1.4)" }} />
      </Button>
    );
  }

  return (
    <div className="absolute right-14 top-2 z-20 w-80 rounded-xl border border-gray-200 bg-white/90 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <H4 className="text-gray-700">Country Rankings</H4>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full p-0"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      <div className="border-b border-gray-200 p-3">
        <RadioGroup
          defaultValue="10"
          value={maxItems}
          onValueChange={setMaxItems}
          className="flex items-center justify-center gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="10" id="max-10-countries" />
            <Label htmlFor="max-10-countries" className="text-sm">
              Top 10
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="25" id="max-25-countries" />
            <Label htmlFor="max-25-countries" className="text-sm">
              Top 25
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="All" id="max-all-countries" />
            <Label htmlFor="max-all-countries" className="text-sm">
              All
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="max-h-96 overflow-y-auto p-3">
        {filteredRankings.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-600">
                <th className="pb-2 text-left font-medium">Rank</th>
                <th className="pb-2 text-left font-medium">Country</th>
                <th className="pb-2 text-right font-medium">Funding</th>
              </tr>
            </thead>
            <tbody>
              {filteredRankings.map((country) => (
                <tr
                  key={country.countryCode}
                  className="border-b border-gray-100 text-sm"
                >
                  <td className="py-2 text-gray-600">{country.rank}</td>
                  <td className="py-2 font-medium text-gray-800">
                    {country.countryCode}
                  </td>
                  <td className="py-2 text-right text-orange-500">
                    {country.formattedAmount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-6 text-center text-gray-500">
            No data available for {year}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-3 text-xs text-gray-500">
        <span>Country funding for {year}</span>
      </div>
    </div>
  );
};

export default CountryRankingPanel;
