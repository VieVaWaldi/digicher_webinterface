"use client";
import React from "react";
import { Popover, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { SortOrder } from "./types";

interface SortPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: "Cost: High \u2192 Low", value: "cost-desc" },
  { label: "Cost: Low \u2192 High", value: "cost-asc" },
];

export function SortPopover({
  anchorEl,
  onClose,
  sortOrder,
  onSortChange,
}: SortPopoverProps) {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {SORT_OPTIONS.map((option) => (
        <MenuItem
          key={option.value}
          selected={sortOrder === option.value}
          onClick={() => {
            onSortChange(option.value);
            onClose();
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            {sortOrder === option.value && <CheckIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={option.label} />
        </MenuItem>
      ))}
    </Popover>
  );
}
