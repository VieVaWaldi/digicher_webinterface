import { InstitutionCollaborators } from "lib/types";
import { useEffect } from "react";
import { useState } from "react";

export function useInstitutionCollaboratorsById(id: number) {
  const [institutionCollaborators, setInstitutionCollaborators] =
    useState<InstitutionCollaborators>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitutionCollaborators() {
      if (id < 0) {
        // For fetching id = null, eg when clicking on the map.
        setInstitutionCollaborators(undefined);
        setError(null);
        return;
      }

      try {
        setError(null);
        const response = await fetch(
          `/api/institution_collaborators_by_id?institution_id=${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Institutions");
        }

        const data = await response.json();
        setInstitutionCollaborators(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }

    fetchInstitutionCollaborators();
  }, [id]);

  return { institutionCollaborators: institutionCollaborators, error };
}
