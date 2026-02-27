import { GeoGroup } from "@/app/scenarios/scenario_data";
import { MapViewCollaborationNetworkType } from "db/schemas/core-map-view";

/** Normalized shape for both arc types (L1 arc projects + L2 arc) */
export type ProjectPanelData = {
  project_id: string;
  total_cost?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  framework_programmes?: string[] | null;
};

export type SelectedItem =
  | { type: "grouped-institution"; geolocation: number[]; institutionIds: string[] }
  | {
      type: "collab-network";
      institutionId: string;
      network: MapViewCollaborationNetworkType[] | null;
    }
  | { type: "project"; projects: ProjectPanelData[] };

export function getSelectionLabel(item: SelectedItem, selectedGeoGroup?: GeoGroup | null): string {
  switch (item.type) {
    case "grouped-institution": {
      const n = selectedGeoGroup?.count ?? item.institutionIds.length;
      return `${n} institution${n !== 1 ? "s" : ""}`;
    }
    case "collab-network":
      return "Network";
    case "project":
      return item.projects.length === 1
        ? "Project"
        : `${item.projects.length} projects`;
  }
}
