"use client";
import React from "react";
import {
  ListItem,
  ListItemText,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { MapListItem } from "./types";

interface ListRowProps {
  item: MapListItem;
  names: Record<string, { legal_name: string | null }> | undefined;
  isLoadingNames: boolean;
  onFlyTo?: (geo: number[]) => void;
  onRowClick?: (item: MapListItem) => void;
}

export function ListRow({
  item,
  names,
  isLoadingNames,
  onFlyTo,
  onRowClick,
}: ListRowProps) {
  const name = names?.[item.id]?.legal_name ?? null;

  return (
    <ListItem
      divider
      sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
      onClick={() => onRowClick?.(item)}
      secondaryAction={
        <IconButton
          edge="end"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onFlyTo?.(item.geolocation);
          }}
          title="Fly to institution"
        >
          <MyLocationIcon fontSize="small" />
        </IconButton>
      }
    >
      <ListItemText
        primary={
          isLoadingNames ? (
            <Skeleton width="60%" />
          ) : (
            <Typography variant="body1" noWrap>
              {name ?? item.id}
            </Typography>
          )
        }
        secondary={
          <Typography variant="body2" color="text.secondary" noWrap>
            {item.costLabel}
          </Typography>
        }
      />
    </ListItem>
  );
}
