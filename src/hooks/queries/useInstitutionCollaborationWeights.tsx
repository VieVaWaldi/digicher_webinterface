import { InstitutionCollaborationWeights } from "lib/types";
import { useEffect } from "react";
import { useState } from "react";

export function useInstitutionCollaborationWeights() {
  const [institutionCollaborationWeights, setInstitutionCollaborationWeights] =
    useState<InstitutionCollaborationWeights[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitutionCollaborationWeights() {
      try {
        setError(null);
        const response = await fetch(`/api/institution_collaboration_weights`);

        if (!response.ok) {
          throw new Error("Failed to fetch institutions");
        }

        const data = await response.json();
        setInstitutionCollaborationWeights(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }

    fetchInstitutionCollaborationWeights();
  }, []);

  return {
    institutionCollaborationWeights: institutionCollaborationWeights,
    error,
  };
}
