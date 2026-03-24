"use client";

import { ClickAwayListener, CircularProgress, List, ListItemButton, ListItemText, Paper } from "@mui/material";
import { InstitutionSearchResult } from "@/hooks/queries/institution/useInstitutionSearchByName";

interface Props {
  results: InstitutionSearchResult[];
  loading: boolean;
  onSelect: (id: string, geolocation: number[]) => void;
  onClickAway: () => void;
}

export function InstitutionSuggestionsDropdown({ results, loading, onSelect, onClickAway }: Props) {
  if (!loading && results.length === 0) return null;

  const handleSelect = (result: InstitutionSearchResult) => {
    const geo = result.geolocation?.map(Number) ?? [];
    onSelect(result.id, geo);
  };

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <Paper
        elevation={4}
        sx={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 1300,
          maxHeight: 320,
          overflowY: "auto",
          mt: 0.5,
        }}
      >
        {loading ? (
          <List dense>
            <ListItemButton disabled>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <ListItemText primary="Searching..." />
            </ListItemButton>
          </List>
        ) : (
          <List dense disablePadding>
            {results.map((r) => {
              const secondary = [
                r.short_name && r.short_name !== r.name ? r.short_name : null,
                r.city,
                r.country_code,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <ListItemButton key={r.id} onClick={() => handleSelect(r)}>
                  <ListItemText
                    primary={r.name}
                    secondary={secondary || undefined}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Paper>
    </ClickAwayListener>
  );
}
