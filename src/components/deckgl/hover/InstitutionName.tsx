import { Skeleton } from "@mui/material";
import { useInstitutionById } from "@/hooks/queries/institution/useInstitutionById";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

interface InstitutionNameProps {
  id: string;
}

export function InstitutionName({ id }: InstitutionNameProps) {
  const { data, isPending } = useInstitutionById(id, { staleTime: Infinity });

  if (isPending) {
    return <Skeleton variant="text" width={120} sx={{ bgcolor: "grey.700" }} />;
  }

  return (
    <>
      <AccountBalanceIcon sx={{ color: "primary.main", fontSize: 20 }} />{" "}
      {data?.short_name ?? data?.legal_name ?? id}
    </>
  );
}