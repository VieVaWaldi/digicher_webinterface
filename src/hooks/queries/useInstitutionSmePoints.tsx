import { InstitutionSmePoint } from "lib/types";
import { useEffect } from "react";
import { useState } from "react";

export function useInstitutionSmePoints() {
  const [institutionSmePoints, setInstitutionSmePoints] = useState<
    InstitutionSmePoint[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitutionSmePoints() {
      try {
        setError(null);
        const response = await fetch(`/api/institution_sme_points`);

        if (!response.ok) {
          throw new Error("Failed to fetch institutions");
        }

        const data = await response.json();
        setInstitutionSmePoints(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }

    fetchInstitutionSmePoints();
  }, []);

  return { institutionSmePoints: institutionSmePoints, error };
}
