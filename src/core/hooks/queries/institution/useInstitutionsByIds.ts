import { useFetch } from "core/hooks/useFetch";
import { Institution } from "datamodel/institution/types";

export function useInstitutionsByIds(ids: string[]) {
  let param_ids: string = "";
  ids.map((id) => (param_ids += `${id},`));
  if (param_ids.slice(-1) === ",") {
    param_ids = param_ids.slice(0, -1);
  }
  return useFetch<Institution[]>("/api/institution/institutions_by_ids", {
    enabled: param_ids.length != 0,
    params: { institution_ids: param_ids },
  });
}
