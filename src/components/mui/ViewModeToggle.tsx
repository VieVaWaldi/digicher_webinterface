"use client";

import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";

export type ViewMode = "list" | "map";

export interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export const ViewModeToggle = ({ value, onChange }: ViewModeToggleProps) => {
  const handleChange = (_: React.MouseEvent<HTMLElement>, next: ViewMode | null) => {
    if (next !== null) onChange(next);
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{
        flexShrink: 0,
        borderRadius: "50px",
        overflow: "hidden",
        "& .MuiToggleButton-root": {
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 0,
          px: 1.5,
          py: 1.5,
          "&:first-of-type": {
            borderRadius: "50px 0 0 50px",
          },
          "&:last-of-type": {
            borderRadius: "0 50px 50px 0",
          },
        },
      }}
    >
      <Tooltip title="Visualize research geospatially on an interactive map.">
        <ToggleButton value="map" aria-label="Map view">
          <MapOutlinedIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Search and filter institutions, projects, or publications in a table.">
        <ToggleButton value="list" aria-label="List view">
          <FormatListBulletedIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};