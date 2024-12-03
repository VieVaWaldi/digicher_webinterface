import { Project } from "lib/types";
import { useEffect } from "react";
import { useState } from "react";

export function useProjectById(id: number) {
  const [project, setProject] = useState<Project>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {

      if (id < 0) { // For fetching id = null, eg when clicking on the map.
        setProject(undefined);
        setError(null);
        return;
      }

      try {
        setError(null);
        const response = await fetch(`/api/project_by_id?project_id=${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }

    fetchProject();
  }, [id]);

  return { project: project, error };
}
