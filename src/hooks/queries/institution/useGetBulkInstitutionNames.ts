import { useQuery } from "@tanstack/react-query";

export function useGetBulkInstitutionNames(ids: string[]) {
  return useQuery({
    queryKey: ["institutions", "bulk-names", [...ids].sort().join(",")],
    queryFn: async () => {
      const params = new URLSearchParams(ids.map((id) => ["ids", id]));
      const res = await fetch(`/api/institution/bulk?${params}`);
      if (!res.ok) throw new Error("Failed to fetch institution names");
      return res.json() as Promise<
        Record<string, { legal_name: string | null }>
      >;
    },
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}
