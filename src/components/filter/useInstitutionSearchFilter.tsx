import { useInstitutionSearchByName } from "hooks/queries/institution/useInstitutionSearchByName";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Box, TextField, Typography, CircularProgress } from "@mui/material";

interface InstitutionSearchFilterResult {
  InstitutionSearchFilter: ReactNode;
  institutionSearchPredicate: (institutionId: string) => boolean;
}

export default function useInstitutionSearchFilter(): InstitutionSearchFilterResult {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeQuery, setActiveQuery] = useState<string>("");

  const { data: searchResults = [], isPending } = useInstitutionSearchByName(
    activeQuery,
    {
      enabled: !!activeQuery,
    },
  );

  const institutionIdSet = useMemo(() => {
    if (!activeQuery || searchResults.length === 0) return null;
    return new Set(searchResults.map((result) => result.id));
  }, [activeQuery, searchResults]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setActiveQuery(searchQuery);
      }
    },
    [searchQuery],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const predicate = useMemo(
    () => (institutionId: string) => {
      if (!activeQuery) return true;
      if (!institutionIdSet) return false;
      return institutionIdSet.has(institutionId);
    },
    [activeQuery, institutionIdSet],
  );

  const filter = useMemo(
    () => (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Search by name (press Enter)..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              "& fieldset": {
                borderColor: "divider",
              },
              "&:hover fieldset": {
                borderColor: "text.secondary",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: 1,
              },
            },
          }}
        />
        {activeQuery && (
          <Typography variant="body2" color="text.secondary">
            {searchResults.length > 0 ? (
              `Found ${searchResults.length} institution(s)`
            ) : isPending ? (
              <CircularProgress size={16} />
            ) : (
              "No institutions found"
            )}
          </Typography>
        )}
      </Box>
    ),
    [
      searchQuery,
      activeQuery,
      searchResults,
      handleInputChange,
      handleKeyPress,
      isPending,
    ],
  );

  return {
    InstitutionSearchFilter: filter,
    institutionSearchPredicate: predicate,
  };
}
