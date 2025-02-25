import { Label } from "shadcn/label";
import { SmeFilter } from "app/scenarios/institutions/page";
import { RadioGroup, RadioGroupItem } from "shadcn/radio-group";

interface RadioGroupFilterProps {
  defaultValue: string;
  labels: readonly string[];
  setOnValueChange: (value: SmeFilter) => void;
}

export function RadioGroupFilter({
  defaultValue,
  labels,
  setOnValueChange,
}: RadioGroupFilterProps) {
  return (
    <RadioGroup
      defaultValue={defaultValue}
      onValueChange={(value: SmeFilter) => setOnValueChange(value)}
    >
      {labels.map((label) => (
        <div key={label} className="flex items-center space-x-2">
          <RadioGroupItem value={label} id={label} />
          <Label htmlFor={label}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}
