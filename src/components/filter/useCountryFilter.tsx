"use client";

import { ReactNode, useMemo, useState } from "react";
import { countries, getEmojiFlag, TCountryCode } from "countries-list";
import { MultiSelectDropdown, MultiSelectOption } from "components/mui/MultiSelectDropdown";

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

const allCountries: MultiSelectOption[] = Object.entries(countries).map(
  ([code, country]) => ({
    value: matchCodesToDB(code),
    label: country.name,
    icon: (props: { className?: string }) => (
      <FlagIcon countryCode={code as TCountryCode} {...props} />
    ),
  })
);

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
    <MultiSelectDropdown
      options={allCountries}
      value={selectedCountries}
      onChange={setSelectedCountries}
      placeholder="Select countries"
      maxChips={3}
    />
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
