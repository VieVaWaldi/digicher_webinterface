"use client";

import { Box, BoxProps } from "@mui/material";
import { IconTextPill } from "./IconTextPill";
import PlaceIcon from "@mui/icons-material/Place";
import PaidIcon from "@mui/icons-material/Paid";
import GroupsIcon from "@mui/icons-material/Groups";
import { useRouter, usePathname } from "next/navigation";
import { useFilters } from "@/hooks/persistence/useFilters";

export type Scenario = "explore" | "funding" | "collaboration";

export interface ScenarioOption {
  id: Scenario;
  label: string;
  icon: React.ReactNode;
  tooltip?: string;
}

const defaultScenarios: ScenarioOption[] = [
  {
    id: "explore",
    label: "Overview",
    icon: <PlaceIcon fontSize="small" />,
    tooltip:
      "No special map focus. Play around with the map and get a feel for it. Filter by keywords, topics, time, or location to explore the data."
  },
  {
    id: "funding",
    label: "Funding",
    icon: <PaidIcon fontSize="small" />,
    tooltip:
      "Visualize funding patterns across institutions. See what they received from projects and grants. See where research money flows.",
  },
  {
    id: "collaboration",
    label: "Collaboration",
    icon: <GroupsIcon fontSize="small" />,
    tooltip:
      "Understand collaboration networks between institutions and project partnerships. Select a topic to see all collaborations, or click an institution to explore its network.",
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
          tooltip={scenario.tooltip}
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
