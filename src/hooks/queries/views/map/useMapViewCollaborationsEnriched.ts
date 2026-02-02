import { useMemo } from "react";
import { useMapViewCollaborations } from "./useMapViewCollaborations";
import { useMapViewProject } from "./useMapViewProject";
import { useMapViewInstitution } from "./useMapViewInstitution";

export function useCollaborationsEnriched() {
  const {
    data: collaborations,
    isPending: isPendingCollabs,
    error: errorCollabs,
  } = useMapViewCollaborations();
  const {
    data: projects,
    isPending: isPendingProjects,
    error: errorProjects,
  } = useMapViewProject();
  const {
    data: institutions,
    isPending: isPendingInstitutions,
    error: errorInstitutions,
  } = useMapViewInstitution(); // take both, can we usse both in the filter?

  const enrichedCollaborations = useMemo(() => {
    if (!collaborations || !projects || !institutions) return [];

    const projectMap = new Map(projects.map((p) => [p.project_id, p]));
    // const institutionMap = new Map(institutions.map((p) => [p.project_id, p]));

    return collaborations.flatMap((collab) => {
      const project = projectMap.get(collab.project_id);
      return project ? [{ ...collab, ...project }] : [];
    });
  }, [collaborations, projects]);

  return {
    data: enrichedCollaborations,
    isPending: isPendingCollabs || isPendingProjects,
    error: errorCollabs || errorProjects,
  };
}
