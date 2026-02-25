"use client";

import { SideMenu } from "@/components/mui/SideMenu";
import { SelectedItem } from "@/components/infopanel/types";
import { GroupedInstitutionPanel } from "@/components/infopanel/panels/GroupedInstitutionPanel";
import { CollaborationNetworkPanel } from "@/components/infopanel/panels/CollaborationNetworkPanel";
import { ProjectPanel } from "@/components/infopanel/panels/ProjectPanel";

interface InfoPanelContainerProps {
  selectedItem: SelectedItem | null;
  open: boolean;
  onClose: () => void;
}

function getPanelTitle(item: SelectedItem | null): string {
  if (!item) return "Details";
  switch (item.type) {
    case "grouped-institution":
      return item.data.count === 1 ? "Institution" : `${item.data.count} Institutions`;
    case "collab-network":
      return "Collaboration Network";
    case "project":
      return item.projects.length === 1 ? "Project" : "Projects";
  }
}

export function InfoPanelContainer({
  selectedItem,
  open,
  onClose,
}: InfoPanelContainerProps) {
  return (
    <SideMenu
      side="right"
      title={getPanelTitle(selectedItem)}
      open={open}
      onClose={onClose}
    >
      {selectedItem?.type === "grouped-institution" && (
        <GroupedInstitutionPanel data={selectedItem.data} />
      )}
      {selectedItem?.type === "collab-network" && (
        <CollaborationNetworkPanel
          institutionId={selectedItem.institutionId}
          network={selectedItem.network}
        />
      )}
      {selectedItem?.type === "project" && (
        <ProjectPanel projects={selectedItem.projects} />
      )}
    </SideMenu>
  );
}
