"use client";

import { SideMenu } from "@/components/mui/SideMenu";
import { SelectedItem } from "@/components/infopanel/types";
import { GeoGroup } from "@/app/scenarios/scenario_data";
import { GroupedInstitutionPanel } from "@/components/infopanel/panels/GroupedInstitutionPanel";
import { CollaborationNetworkPanel } from "@/components/infopanel/panels/CollaborationNetworkPanel";
import { ProjectPanel } from "@/components/infopanel/panels/ProjectPanel";
import { FilterValues } from "@/hooks/persistence/useFilters";

interface InfoPanelContainerProps {
  selectedItem: SelectedItem | null;
  selectedGeoGroup?: GeoGroup | null;
  open: boolean;
  onClose: () => void;
  mapFilters?: FilterValues;
}

function getPanelTitle(item: SelectedItem | null, selectedGeoGroup?: GeoGroup | null): string {
  if (!item) return "Details";
  switch (item.type) {
    case "grouped-institution": {
      const n = selectedGeoGroup?.count ?? item.institutionIds.length;
      return n === 1 ? "Institution" : `${n} Institutions`;
    }
    case "collab-network":
      return "Collaboration Network";
    case "project":
      return item.projects.length === 1 ? "Project" : "Projects";
  }
}

export function InfoPanelContainer({
  selectedItem,
  selectedGeoGroup,
  open,
  onClose,
  mapFilters,
}: InfoPanelContainerProps) {
  return (
    <SideMenu
      side="right"
      title={getPanelTitle(selectedItem, selectedGeoGroup)}
      open={open}
      onClose={onClose}
    >
      {selectedItem?.type === "grouped-institution" && selectedGeoGroup && (
        <GroupedInstitutionPanel data={selectedGeoGroup} mapFilters={mapFilters} />
      )}
      {selectedItem?.type === "collab-network" && (
        <CollaborationNetworkPanel
          institutionId={selectedItem.institutionId}
          network={selectedItem.network}
          mapFilters={mapFilters}
        />
      )}
      {selectedItem?.type === "project" && (
        <ProjectPanel projects={selectedItem.projects} />
      )}
    </SideMenu>
  );
}
