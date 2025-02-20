"use client";

import { useState } from "react";

import { countries, getEmojiFlag, TCountryCode } from "countries-list";

import { MultiSelect } from "shadcn/multi-select";
import { BasePoint } from "datamodel/scenario_points/types";

const FlagIcon = ({
  countryCode,
}: {
  countryCode: TCountryCode;
  className?: string;
}) => {
  return <span>{getEmojiFlag(countryCode)}</span>;
};

const allCountries = Object.entries(countries).map(([code, country]) => ({
  value: code,
  label: country.name,
  icon: (props: { className?: string }) => (
    <FlagIcon countryCode={code as TCountryCode} {...props} />
  ),
}));

interface CountryFilterResult {
  CountryFilter: React.FC;
  countryPredicate: (point: BasePoint) => boolean;
}

export default function useCountryFilter(): CountryFilterResult {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const CountryFilter = () => {
    return (
      <MultiSelect
        options={allCountries}
        value={selectedCountries}
        defaultValue={selectedCountries}
        onValueChange={setSelectedCountries}
        placeholder="Select Countries"
        variant="default"
        maxCount={6}
      />
    );
  };

  const countryPredicate = (point: BasePoint): boolean => {
    if (selectedCountries.length === 0) {
      return true;
    }

    // If country_code is null, return false when countries are selected
    if (!point.country_code) {
      return false;
    }

    return selectedCountries.includes(point.country_code);
  };

  return { CountryFilter, countryPredicate };
}
