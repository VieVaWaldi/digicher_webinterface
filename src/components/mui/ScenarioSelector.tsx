"use client";

import { Box, BoxProps } from "@mui/material";
import { IconTextPill } from "./IconTextPill";
import PlaceIcon from "@mui/icons-material/Place";
import PaidIcon from "@mui/icons-material/Paid";
import GroupsIcon from "@mui/icons-material/Groups";
import { useRouter, usePathname } from "next/navigation";
import { useFilters } from "@/hooks/persistence/useFilters";

export type Scenario = "base" | "funding" | "collaboration";

export interface ScenarioOption {
  id: Scenario;
  label: string;
  icon: React.ReactNode;
}

const defaultScenarios: ScenarioOption[] = [
  {
    id: "base",
    label: "Base",
    icon: <PlaceIcon fontSize="small" />,
  },
  {
    id: "funding",
    label: "Funding",
    icon: <PaidIcon fontSize="small" />,
  },
  {
    id: "collaboration",
    label: "Collaboration",
    icon: <GroupsIcon fontSize="small" />,
  },
];
export interface ScenarioSelectorProps extends Omit<BoxProps, "onChange"> {
  selected?: Scenario;
  onChange?: (scenario: Scenario) => void;
  scenarios?: ScenarioOption[];
  canRoute?: boolean;
}

export const ScenarioSelector = ({
  selected,
  onChange,
  scenarios = defaultScenarios,
  canRoute= false,
  sx,
  ...props
}: ScenarioSelectorProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toQueryString } = useFilters();

  const getSelected = (scenarioId: Scenario) => {
    if (canRoute) {
      return pathname === `/scenarios/${scenarioId}`;
    }
    return selected === scenarioId;
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexWrap: "wrap",
        justifyContent: "center",
        ...sx,
      }}
      {...props}
    >
      {scenarios.map((scenario) => (
        <IconTextPill
          key={scenario.id}
          icon={scenario.icon}
          label={scenario.label}
          selected={getSelected(scenario.id)}
          onClick={() => {
            onChange?.(scenario.id);
            if (canRoute) {
              const queryString = toQueryString();
              const url = queryString
                ? `/scenarios/${scenario.id}?${queryString}`
                : `/scenarios/${scenario.id}`;
              router.push(url);
            }
          }}
        />
      ))}
    </Box>
  );
};

export default ScenarioSelector;
