"use client";

import { Box, Collapse, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ReactNode } from "react";
import { InstitutionDetailView } from "./InstitutionDetailView";

interface InstitutionListRowProps {
  institutionId: string;
  legalName: string | null;
  countryCode?: string | null;
  open: boolean;
  onToggle: () => void;
  projectsData?: { id: string }[];
  listViewUrl?: string;
  children?: ReactNode;
}

export function InstitutionListRow({
  institutionId,
  legalName,
  countryCode,
  open,
  onToggle,
  projectsData,
  listViewUrl,
  children,
}: InstitutionListRowProps) {
  return (
    <Box>
      <Box
        onClick={onToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 0.75,
          borderRadius: 1,
          cursor: "pointer",
          "&:hover": { backgroundColor: "action.hover" },
        }}
      >
        <ChevronRightIcon
          sx={{
            fontSize: 18,
            color: "text.secondary",
            flexShrink: 0,
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        />
        <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
          {legalName ?? institutionId}
        </Typography>
        {countryCode && (
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {countryCode}
          </Typography>
        )}
      </Box>
      <Collapse in={open} unmountOnExit>
        <Box
          sx={{
            ml: 2.5,
            pl: 1.5,
            borderLeft: "2px solid",
            borderColor: "primary.main",
            py: 1,
          }}
        >
          <InstitutionDetailView institutionId={institutionId} projectsData={projectsData} listViewUrl={listViewUrl} />
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}
