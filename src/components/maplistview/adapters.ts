import { MapViewInstitutionType } from "db/schemas/core-map-view";
import { MapViewCollaborationByTopicType } from "db/schemas/core-map-view";
import { MapListItem } from "./types";
import { getParticipationCost } from "@/utils/institutionUtils";

function formatCost(cost: number): string {
  if (cost >= 1_000_000_000) return `€${(cost / 1_000_000_000).toFixed(1)}B`;
  if (cost >= 1_000_000) return `€${(cost / 1_000_000).toFixed(1)}M`;
  if (cost >= 1_000) return `€${(cost / 1_000).toFixed(0)}K`;
  return `€${Math.round(cost).toLocaleString()}`;
}

export function toListItems(filteredData: MapViewInstitutionType[]): MapListItem[] {
  return filteredData.flatMap((inst) => {
    if (!inst.geolocation?.length) return [];
    const totalCost = getParticipationCost(inst);
    return [
      {
        id: inst.institution_id,
        geolocation: inst.geolocation as number[],
        totalCost,
        costLabel: `Received ${formatCost(totalCost)} in funding`,
      },
    ];
  });
}

export function toTopicNetworkListItems(
  data: MapViewCollaborationByTopicType[],
): MapListItem[] {
  const institutionMap = new Map<
    string,
    { geolocation: number[]; partners: Set<string> }
  >();

  for (const row of data) {
    if (!institutionMap.has(row.a_institution_id)) {
      institutionMap.set(row.a_institution_id, {
        geolocation: row.a_geolocation as number[],
        partners: new Set(),
      });
    }
    institutionMap.get(row.a_institution_id)!.partners.add(row.b_institution_id);

    if (!institutionMap.has(row.b_institution_id)) {
      institutionMap.set(row.b_institution_id, {
        geolocation: row.b_geolocation as number[],
        partners: new Set(),
      });
    }
    institutionMap.get(row.b_institution_id)!.partners.add(row.a_institution_id);
  }

  return Array.from(institutionMap.entries()).map(
    ([id, { geolocation, partners }]) => {
      const n = partners.size;
      return {
        id,
        geolocation,
        totalCost: n,
        costLabel: `${n} collaboration${n !== 1 ? "s" : ""}`,
      };
    },
  );
}
