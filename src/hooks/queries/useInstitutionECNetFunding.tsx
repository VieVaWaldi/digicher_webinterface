import { InstitutionECNetFunding } from "lib/types";
import { useEffect } from "react";
import { useState } from "react";

export function useInstitutionECNetFundings() {
  const [institutionECNetFundings, setInstitutionECNetFundings] = useState<
    InstitutionECNetFunding[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitutionECNetFundings() {
      try {
        setError(null);
        const response = await fetch(`/api/institution_ecnet_funding`);

        if (!response.ok) {
          throw new Error("Failed to fetch institutions");
        }

        const data = await response.json();
        setInstitutionECNetFundings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }

    fetchInstitutionECNetFundings();
  }, []);

  return { institutionECNetFundings: institutionECNetFundings, error };
}
