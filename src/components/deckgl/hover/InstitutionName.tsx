import { Skeleton } from "@mui/material";
import { useInstitutionById } from "@/hooks/queries/institution/useInstitutionById";

interface InstitutionNameProps {
  id: string;
}

export function InstitutionName({ id }: InstitutionNameProps) {
  const { data, isPending } = useInstitutionById(id, { staleTime: Infinity });

  if (isPending) {
    return <Skeleton variant="text" width={120} sx={{ bgcolor: "grey.700" }} />;
  }

  return <>‣ {data?.short_name ?? data?.legal_name ?? id}</>;
}