"use client";

import {
  Autocomplete,
  Checkbox,
  TextField,
  Chip,
  Box,
  AutocompleteProps,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { ReactNode } from "react";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: (props: { className?: string }) => ReactNode;
}

export interface MultiSelectDropdownProps
  extends Omit<
    AutocompleteProps<MultiSelectOption, true, false, false>,
    | "multiple"
    | "options"
    | "renderInput"
    | "renderOption"
    | "getOptionLabel"
    | "value"
    | "onChange"
  > {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxChips?: number;
}

export const MultiSelectDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select options",
  maxChips = 3,
  ...props
}: MultiSelectDropdownProps) => {
  // Convert string values to option objects
  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <Autocomplete
      multiple
      options={options}
      disableCloseOnSelect
      value={selectedOptions}
      onChange={(_, newValue) => {
        onChange(newValue.map((v) => v.value));
      }}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      renderOption={(optionProps, option, { selected }) => {
        const { key, ...rest } = optionProps;
        return (
          <li key={key} {...rest}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.icon && (
              <Box component="span" sx={{ mr: 1 }}>
                {option.icon({})}
              </Box>
            )}
            {option.label}
          </li>
        );
      }}
      renderTags={(tagValue, getTagProps) => {
        const displayedTags = tagValue.slice(0, maxChips);
        const remainingCount = tagValue.length - maxChips;

        return (
          <>
            {displayedTags.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {option.icon && option.icon({})}
                      <span>{option.label}</span>
                    </Box>
                  }
                  size="small"
                  {...tagProps}
                />
              );
            })}
            {remainingCount > 0 && (
              <Chip
                label={`+${remainingCount} more`}
                size="small"
                sx={{ ml: 0.5 }}
              />
            )}
          </>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={selectedOptions.length === 0 ? placeholder : ""}
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
      )}
      sx={{
        "& .MuiAutocomplete-tag": {
          maxWidth: "120px",
        },
      }}
      {...props}
    />
  );
};

export default MultiSelectDropdown;