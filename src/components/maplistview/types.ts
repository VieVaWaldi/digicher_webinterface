export type SortOrder = "cost-desc" | "cost-asc";

export interface MapListItem {
  id: string; // institution_id
  geolocation: number[]; // [lon, lat]
  totalCost: number; // sum of filtered project costs OR collab count
  costLabel: string; // "Received €1.2M in funding" OR "12 collaborations"
}
