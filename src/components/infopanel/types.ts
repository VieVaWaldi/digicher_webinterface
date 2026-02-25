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
  | { type: "grouped-institution"; data: GeoGroup }
  | {
      type: "collab-network";
      institutionId: string;
      network: MapViewCollaborationNetworkType[] | null;
    }
  | { type: "project"; projects: ProjectPanelData[] };

export function getSelectionLabel(item: SelectedItem): string {
  switch (item.type) {
    case "grouped-institution":
      return `${item.data.count} institution${item.data.count !== 1 ? "s" : ""}`;
    case "collab-network":
      return "Network";
    case "project":
      return item.projects.length === 1
        ? "Project"
        : `${item.projects.length} projects`;
  }
}
