"use client";

import { useState } from "react";

import { countries, getEmojiFlag, TCountryCode } from "countries-list";

import { H4, H5 } from "shadcn/typography";
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
  CountryFilter: React.FC;
  countryPredicate: (point: BasePoint) => boolean;
}

export default function useCountryFilter(): CountryFilterResult {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const CountryFilter = () => {
    return (
      <div>
        <H5 className="mb-2 ml-2">Region</H5>
        <MultiSelect
          options={allCountries}
          value={selectedCountries}
          defaultValue={selectedCountries}
          onValueChange={setSelectedCountries}
          placeholder="Select Countries"
          variant="default"
          maxCount={4}
          className="w-full"
        />
      </div>
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
