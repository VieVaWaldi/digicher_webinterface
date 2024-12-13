import { InstitutionTopics } from "lib/types";
import { useEffect } from "react";
import { useState } from "react";

export function useInstitutionTopics() {
  const [institutionTopics, setInstitutionTopics] = useState<
    InstitutionTopics[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitutionTopics() {
      try {
        setError(null);
        const response = await fetch(`/api/institution_topics`);

        if (!response.ok) {
          throw new Error("Failed to fetch institutions");
        }

        const data = await response.json();
        setInstitutionTopics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }

    fetchInstitutionTopics();
  }, []);

  return { institutionTopics: institutionTopics, error };
}
