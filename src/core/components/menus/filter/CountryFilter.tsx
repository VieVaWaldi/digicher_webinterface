import { countries, getEmojiFlag, TCountryCode } from "countries-list";
import { MultiSelect } from "shadcn/multi-select";

const FlagIcon = ({
  countryCode,
}: {
  countryCode: TCountryCode;
  className?: string;
}) => {
  return <span>{getEmojiFlag(countryCode)}</span>;
};

const countryList = Object.entries(countries).map(([code, country]) => ({
  value: code,
  label: country.name,
  icon: (props: { className?: string }) => (
    <FlagIcon countryCode={code as TCountryCode} {...props} />
  ),
}));

interface CountryFilterProps {
  setSelectedCountries: (value: string[]) => void;
}

export default function CountryFilter({
  setSelectedCountries,
}: CountryFilterProps) {
  return (
    <MultiSelect
      options={countryList}
      onValueChange={setSelectedCountries}
      placeholder="Select Countries"
      variant="default"
      maxCount={6}
    />
  );
}
