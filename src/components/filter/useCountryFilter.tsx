"use client";

import { ReactNode, useMemo, useState } from "react";

import { countries, getEmojiFlag, TCountryCode } from "countries-list";

import { MultiSelect } from "shadcn/multi-select";
import { H6 } from "shadcn/typography";

const FlagIcon = ({
  countryCode,
}: {
  countryCode: TCountryCode;
  className?: string;
}) => {
  return <span>{getEmojiFlag(countryCode)}</span>;
};

function matchCodesToDB(code: string): string {
  /**
   * Some country codes in the DB dont match the codes from countries-list.
   */
  if (code === "GB") return "UK";
  return code;
}

const allCountries = Object.entries(countries).map(([code, country]) => ({
  value: matchCodesToDB(code),
  label: country.name,
  icon: (props: { className?: string }) => (
    <FlagIcon countryCode={code as TCountryCode} {...props} />
  ),
}));

interface CountryFilterResult {
  CountryFilter: ReactNode;
  countryPredicate: (countryCode: string | null) => boolean;
  selectedCountries: string[];
}

export default function useCountryFilter(): CountryFilterResult {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const selectedCountrySet = useMemo(() => {
    return new Set(selectedCountries);
  }, [selectedCountries]);

  const CountryFilter = (
    <div>
      <H6 className="text-center">Region</H6>
      <MultiSelect
        options={allCountries}
        value={selectedCountries}
        defaultValue={selectedCountries}
        onValueChange={setSelectedCountries}
        placeholder="Select Countries"
        variant="default"
        maxCount={4}
        className="mt-2 w-full"
      />
    </div>
  );

  const countryPredicate = useMemo(
    () =>
      (countryCode: string | null): boolean => {
        if (selectedCountrySet.size === 0) {
          return true;
        }

        if (!countryCode) {
          return false;
        }

        return selectedCountrySet.has(countryCode);
      },
    [selectedCountrySet],
  );

  return { CountryFilter, countryPredicate, selectedCountries };
}
