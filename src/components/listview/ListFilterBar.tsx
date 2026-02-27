"use client";

import { Box, Chip, MenuItem, Select, TextField, Typography } from "@mui/material";
import { countries, getEmojiFlag, TCountryCode } from "countries-list";
import { MultiSelectDropdown, MultiSelectOption } from "@/components/mui/MultiSelectDropdown";
import { ListFilters } from "@/hooks/persistence/useListFilters";
import { useInstitutionById } from "@/hooks/queries/institution/useInstitutionById";

const frameworkProgrammeOptions: MultiSelectOption[] = [
  { value: "PRE_FWP", label: "Pre-Framework (before 1984)" },
  { value: "FP1", label: "FP1 (1984-1987)" },
  { value: "FP2", label: "FP2 (1987-1991)" },
  { value: "FP3", label: "FP3 (1990-1994)" },
  { value: "FP4", label: "FP4 (1994-1998)" },
  { value: "FP5", label: "FP5 (1998-2002)" },
  { value: "FP6", label: "FP6 (2002-2006)" },
  { value: "FP7", label: "FP7 (2007-2013)" },
  { value: "H2020", label: "Horizon 2020 (2014-2020)" },
  { value: "HORIZON", label: "Horizon Europe (2021-2027)" },
  { value: "ECSC", label: "ECSC (Coal & Steel Community)" },
  { value: "JRC", label: "JRC (Joint Research Centre)" },
  { value: "CIP", label: "CIP (Competitiveness & Innovation)" },
];

function matchCodesToDB(code: string): string {
  if (code === "GB") return "UK";
  return code;
}

const allCountries: MultiSelectOption[] = Object.entries(countries).map(
  ([code, country]) => ({
    value: matchCodesToDB(code),
    label: country.name,
    icon: () => <span>{getEmojiFlag(code as TCountryCode)}</span>,
  }),
);

const institutionTypeOptions: MultiSelectOption[] = [
  { value: "HES", label: "Higher Education" },
  { value: "REC", label: "Research Centre" },
  { value: "PRC", label: "Private Company" },
  { value: "PUB", label: "Public Body" },
  { value: "OTH", label: "Other" },
];

const workTypeOptions = [
  { value: "", label: "All types" },
  { value: "article", label: "Article" },
  { value: "conference paper", label: "Conference Paper" },
  { value: "book", label: "Book" },
  { value: "book part", label: "Book Part" },
  { value: "report", label: "Report" },
  { value: "dataset", label: "Dataset" },
  { value: "other", label: "Other" },
];

interface InstitutionChipProps {
  institutionId: string;
  onDismiss: () => void;
}

function InstitutionChip({ institutionId, onDismiss }: InstitutionChipProps) {
  const { data } = useInstitutionById(institutionId);
  const label = data?.legal_name ?? institutionId;
  return (
    <Chip
      label={`Projects from: ${label}`}
      onDelete={onDismiss}
      size="small"
      color="primary"
      variant="outlined"
    />
  );
}

function CollaboratorChip({ collaboratorId, onDismiss }: { collaboratorId: string; onDismiss: () => void }) {
  const { data } = useInstitutionById(collaboratorId);
  return (
    <Chip
      label={`Shared with: ${data?.legal_name ?? collaboratorId}`}
      onDelete={onDismiss}
      size="small"
      color="secondary"
      variant="outlined"
    />
  );
}

interface ListFilterBarProps {
  filters: ListFilters;
  onMinYear: (v: number | undefined) => void;
  onMaxYear: (v: number | undefined) => void;
  onFps: (v: string[]) => void;
  onClearInstitution: () => void;
  onClearCollaboratorId: () => void;
  onClearProjectId: () => void;
  topicFilterCount: number;
  onOpenTopicPicker: () => void;
  onClearTopicFilters: () => void;
  onWorkType: (v: string | undefined) => void;
  onCountries: (v: string[]) => void;
  onInstTypes: (v: string[]) => void;
  onSme: (v: boolean | undefined) => void;
}

export function ListFilterBar({
  filters,
  onMinYear,
  onMaxYear,
  onFps,
  onClearInstitution,
  onClearCollaboratorId,
  onClearProjectId,
  topicFilterCount,
  onOpenTopicPicker,
  onClearTopicFilters,
  onWorkType,
  onCountries,
  onInstTypes,
  onSme,
}: ListFilterBarProps) {
  const { entity, minYear, maxYear, fps, institution, collaboratorId, projectId, workType, countries: selectedCountries, instTypes, sme } = filters;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", py: 1 }}>
      {entity === "projects" && (
        <>
          {institution && (
            <InstitutionChip institutionId={institution} onDismiss={onClearInstitution} />
          )}
          {collaboratorId && (
            <CollaboratorChip collaboratorId={collaboratorId} onDismiss={onClearCollaboratorId} />
          )}
          {projectId && (
            <Chip
              label="Single project"
              onDelete={onClearProjectId}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          <Chip
            label={topicFilterCount > 0 ? `Topics (${topicFilterCount})` : "Topics"}
            onClick={onOpenTopicPicker}
            onDelete={topicFilterCount > 0 ? onClearTopicFilters : undefined}
            size="small"
            color={topicFilterCount > 0 ? "secondary" : "default"}
            variant="outlined"
            sx={{ cursor: "pointer" }}
          />

          <TextField
            label="From year"
            type="number"
            size="small"
            value={minYear ?? ""}
            onChange={(e) => onMinYear(e.target.value ? parseInt(e.target.value) : undefined)}
            sx={{ width: 110 }}
            slotProps={{ htmlInput: { min: 1980, max: 2030 } }}
          />
          <TextField
            label="To year"
            type="number"
            size="small"
            value={maxYear ?? ""}
            onChange={(e) => onMaxYear(e.target.value ? parseInt(e.target.value) : undefined)}
            sx={{ width: 110 }}
            slotProps={{ htmlInput: { min: 1980, max: 2030 } }}
          />
          <Box sx={{ minWidth: 260 }}>
            <MultiSelectDropdown
              options={frameworkProgrammeOptions}
              value={fps}
              onChange={onFps}
              placeholder="Framework Programmes"
              maxChips={2}
              size="small"
            />
          </Box>
        </>
      )}

      {entity === "works" && (
        <>
          <Chip
            label={topicFilterCount > 0 ? `Topics (${topicFilterCount})` : "Topics"}
            onClick={onOpenTopicPicker}
            onDelete={topicFilterCount > 0 ? onClearTopicFilters : undefined}
            size="small"
            color={topicFilterCount > 0 ? "secondary" : "default"}
            variant="outlined"
            sx={{ cursor: "pointer" }}
          />
          <TextField
            label="From year"
            type="number"
            size="small"
            value={minYear ?? ""}
            onChange={(e) => onMinYear(e.target.value ? parseInt(e.target.value) : undefined)}
            sx={{ width: 110 }}
            slotProps={{ htmlInput: { min: 1980, max: 2030 } }}
          />
          <TextField
            label="To year"
            type="number"
            size="small"
            value={maxYear ?? ""}
            onChange={(e) => onMaxYear(e.target.value ? parseInt(e.target.value) : undefined)}
            sx={{ width: 110 }}
            slotProps={{ htmlInput: { min: 1980, max: 2030 } }}
          />
          <Select
            size="small"
            value={workType ?? ""}
            onChange={(e) => onWorkType(e.target.value || undefined)}
            displayEmpty
            sx={{ minWidth: 160 }}
          >
            {workTypeOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </>
      )}

      {entity === "institutions" && (
        <>
          <Box sx={{ minWidth: 240 }}>
            <MultiSelectDropdown
              options={allCountries}
              value={selectedCountries}
              onChange={onCountries}
              placeholder="Countries"
              maxChips={2}
              size="small"
            />
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <MultiSelectDropdown
              options={institutionTypeOptions}
              value={instTypes}
              onChange={onInstTypes}
              placeholder="Institution Types"
              maxChips={2}
              size="small"
            />
          </Box>
          <Chip
            label="SME"
            size="small"
            variant={sme ? "filled" : "outlined"}
            color={sme ? "primary" : "default"}
            onClick={() => onSme(sme ? undefined : true)}
            sx={{ cursor: "pointer" }}
          />
        </>
      )}
    </Box>
  );
}
