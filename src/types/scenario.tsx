"use client";

import MapIcon from "@mui/icons-material/Map";
import GroupsIcon from "@mui/icons-material/Groups";
import PaidIcon from "@mui/icons-material/Paid";
import React from "react";

export type Scenario = "explore" | "collaboration" | "funding";

export interface ScenarioOption {
  id: Scenario;
  label: string;
  icon: React.ReactNode;
  tooltip?: string;
}

export const defaultScenarios: ScenarioOption[] = [
  {
    id: "explore",
    label: "Overview",
    icon: <MapIcon fontSize="small" />,
    tooltip: "Visualize funding patterns across institutions and regions",
  },
  {
    id: "collaboration",
    label: "Collaboration",
    icon: <GroupsIcon fontSize="small" />,
    tooltip:
      "Understand collaboration networks between institutions and project partnerships",
  },
  {
    id: "funding",
    label: "Funding",
    icon: <PaidIcon fontSize="small" />,
    tooltip: "Visualize funding patterns across institutions and regions",
  },
];
