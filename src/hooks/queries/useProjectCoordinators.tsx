import { ProjectCoordinatorPoint } from "lib/types";
import { useEffect } from "react";
import { useState } from "react";

export function useProjectCoordinators(year: number) {
  const [projectCoordinators, setProjectCoordinators] = useState<ProjectCoordinatorPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjectCoordinators() {
      try {
        setError(null);
        const response = await fetch(`/api/project_coordinators?year=${year}`);

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        setProjectCoordinators(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }

    fetchProjectCoordinators();
  }, [year]);

  return { projectCoordinators: projectCoordinators, error };
}
