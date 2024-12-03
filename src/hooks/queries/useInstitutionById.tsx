import { Institution } from "lib/types";
import { useEffect } from "react";
import { useState } from "react";

export function useInstitutionById(id: number) {
  const [institution, setInstitution] = useState<Institution>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitution() {
      if (id < 0) {
        // For fetching id = null, eg when clicking on the map.
        setInstitution(undefined);
        setError(null);
        return;
      }

      try {
        setError(null);
        const response = await fetch(
          `/api/institution_by_id?institution_id=${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Institutions");
        }

        const data = await response.json();
        setInstitution(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }

    fetchInstitution();
  }, [id]);

  return { institution: institution, error };
}
