// import { useQuery, UseQueryOptions } from "@tanstack/react-query";
// import { GetInstitutionCollaboratorsType } from "db/schema";
// import { createApiFetcher } from "hooks/queries/createQuery";

// export const useCollaboratorsById = (
//   id: string,
//   options?: Partial<UseQueryOptions<GetInstitutionCollaboratorsType>>,
// ) => {
//   const endpoint = `/api/collaboration/${id}`;
//   const queryKey = ["collaboration", id];
//   const fetcher = createApiFetcher<GetInstitutionCollaboratorsType>(endpoint);

//   return useQuery<GetInstitutionCollaboratorsType>({
//     queryKey,
//     queryFn: fetcher,
//     ...options,
//   });
// };
