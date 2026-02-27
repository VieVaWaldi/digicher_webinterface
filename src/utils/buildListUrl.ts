import { FilterValues } from "@/hooks/persistence/useFilters";

export function buildListProjectUrl({
  institutionId,
  collaboratorId,
  projectId,
  mapFilters,
}: {
  institutionId?: string;
  collaboratorId?: string;
  projectId?: string;
  mapFilters: FilterValues;
}): string {
  const p = new URLSearchParams();
  p.set("entity", "projects");
  if (institutionId) p.set("institution", institutionId);
  if (collaboratorId) p.set("collaboratorId", collaboratorId);
  if (projectId) p.set("projectId", projectId);
  if (mapFilters.unifiedSearch.query) p.set("q", mapFilters.unifiedSearch.query);
  if (mapFilters.yearRange) {
    p.set("minYear", mapFilters.yearRange[0].toString());
    p.set("maxYear", mapFilters.yearRange[1].toString());
  }
  if (mapFilters.frameworkProgrammes.length)
    p.set("fps", mapFilters.frameworkProgrammes.join(","));
  if (mapFilters.topicTopics.length)
    p.set("topicIds", mapFilters.topicTopics.map(String).join(","));
  if (mapFilters.topicSubfields.length)
    p.set("subfieldIds", mapFilters.topicSubfields.join(","));
  if (mapFilters.topicFields.length)
    p.set("fieldIds", mapFilters.topicFields.join(","));
  return `/list?${p.toString()}`;
}
