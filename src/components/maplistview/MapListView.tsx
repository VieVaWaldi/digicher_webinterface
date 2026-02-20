"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  Pagination,
  IconButton,
} from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import { MapListItem, SortOrder } from "./types";
import { ListRow } from "./ListRow";
import { SortPopover } from "./SortPopover";
import { useGetBulkInstitutionNames } from "@/hooks/queries/institution/useGetBulkInstitutionNames";

interface MapListViewProps {
  items: MapListItem[];
  sortOrder: SortOrder;
  onSortChange: (s: SortOrder) => void;
  page: number;
  onPageChange: (p: number) => void;
  onFlyTo?: (geo: number[]) => void;
  onRowClick?: (item: MapListItem) => void;
  pageSize?: number;
}

export function MapListView({
  items,
  sortOrder,
  onSortChange,
  page,
  onPageChange,
  onFlyTo,
  onRowClick,
  pageSize = 20,
}: MapListViewProps) {
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    onPageChange(0);
  }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageItems = items.slice(page * pageSize, (page + 1) * pageSize);
  const pageIds = pageItems.map((item) => item.id);

  const { data: names, isLoading: isLoadingNames } =
    useGetBulkInstitutionNames(pageIds);

  const pageCount = Math.ceil(items.length / pageSize);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {items.length.toLocaleString()} institution
          {items.length !== 1 ? "s" : ""}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => setSortAnchorEl(e.currentTarget)}
          title="Sort"
        >
          <SortIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List disablePadding>
          {pageItems.map((item) => (
            <ListRow
              key={item.id}
              item={item}
              names={names}
              isLoadingNames={isLoadingNames}
              onFlyTo={onFlyTo}
              onRowClick={onRowClick}
            />
          ))}
        </List>
      </Box>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 1,
            borderTop: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Pagination
            count={pageCount}
            page={page + 1}
            onChange={(_, p) => onPageChange(p - 1)}
            size="small"
          />
        </Box>
      )}

      <SortPopover
        anchorEl={sortAnchorEl}
        onClose={() => setSortAnchorEl(null)}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
    </Box>
  );
}
