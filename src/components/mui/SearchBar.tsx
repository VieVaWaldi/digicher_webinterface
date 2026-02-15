"use client";

import {
  Box,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  TextFieldProps,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ScienceIcon from "@mui/icons-material/Science";
import { ReactNode } from "react";

export interface EntityOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export const ENTITY_OPTIONS: EntityOption[] = [
  // {
  //   value: "works",
  //   label: "Works",
  //   icon: <DescriptionIcon fontSize="small" />,
  // },
  {
    value: "projects",
    label: "Projects",
    icon: <ScienceIcon fontSize="small" />,
  },
  {
    value: "institutions",
    label: "Institutions",
    icon: <AccountBalanceIcon fontSize="small" />,
  },
];

export interface SearchBarProps extends Omit<
  TextFieldProps,
  "variant" | "InputProps"
> {
  value?: string;
  onSearch?: (value: string) => void;
  onSearchStart?: (key: string) => void;
  onClear?: () => void;
  entityOptions?: EntityOption[];
  selectedEntity?: string;
  onEntityChange?: (value: string) => void;
}

export const SearchBar = ({
  value,
  placeholder = "Search...",
  onSearch,
  onSearchStart,
  onClear,
  entityOptions,
  selectedEntity,
  onEntityChange,
  sx,
  ...props
}: SearchBarProps) => {
  const selectedOption = entityOptions?.find(
    (opt) => opt.value === selectedEntity,
  );

  const handleEntityChange = (event: SelectChangeEvent<string>) => {
    onEntityChange?.(event.target.value);
  };

  return (
    <TextField
      fullWidth
      value={value}
      placeholder={placeholder}
      variant="outlined"
      onChange={(e) => onSearch?.(e.target.value)}
      onKeyDown={(e) => {
        onSearchStart?.(e.key);
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "50px",
          backgroundColor: "transparent",
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
        "& .MuiOutlinedInput-input": {
          py: 1.5,
          px: 1,
        },
        ...sx,
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                onClick={value ? onClear : undefined}
                size="small"
                disableRipple={!value}
                sx={{
                  ml: 0.5,
                  cursor: value ? "pointer" : "default",
                  "&:hover": {
                    backgroundColor: value ? undefined : "transparent",
                  },
                }}
              >
                {value ? (
                  <ClearIcon />
                ) : (
                  <SearchIcon sx={{ color: "text.secondary" }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: entityOptions && entityOptions.length > 0 && (
            <InputAdornment position="end">
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Select
                value={selectedEntity || ""}
                onChange={handleEntityChange}
                variant="standard"
                disableUnderline
                IconComponent={KeyboardArrowDownIcon}
                renderValue={() => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {selectedOption?.icon && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "text.secondary",
                        }}
                      >
                        {selectedOption.icon}
                      </Box>
                    )}
                    {selectedOption?.label}
                  </Box>
                )}
                sx={{
                  minWidth: 100,
                  mr: 1,
                  "& .MuiSelect-select": {
                    py: 0.5,
                    pr: 3,
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "text.secondary",
                  },
                }}
              >
                {entityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {option.icon && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: "text.secondary",
                          }}
                        >
                          {option.icon}
                        </Box>
                      )}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
};

export default SearchBar;
