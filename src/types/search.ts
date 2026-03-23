export type SearchEntity = "institutions" | "projects" | "works";

export interface SearchEntityConfig {
  value: SearchEntity;
  label: string;
  lengthLabel: string;
}

export const SEARCH_ENTITY_CONFIGS: SearchEntityConfig[] = [
  { value: "projects", label: "Projects", lengthLabel: "3.7M" },
  { value: "works", label: "Works", lengthLabel: "10M" },
  { value: "institutions", label: "Institutions", lengthLabel: "400K" },
];
