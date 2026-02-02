"use client";

import { Box, Slider, TextField, Typography, Stack } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

export interface DualSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  fromLabel?: string;
  toLabel?: string;
}

export const DualSlider = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  fromLabel = "From",
  toLabel = "To",
}: DualSliderProps) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [fromInput, setFromInput] = useState<string>(String(value[0]));
  const [toInput, setToInput] = useState<string>(String(value[1]));

  // Sync local state with external value changes
  useEffect(() => {
    setLocalValue(value);
    setFromInput(String(value[0]));
    setToInput(String(value[1]));
  }, [value]);

  const handleSliderChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      const val = newValue as [number, number];
      setLocalValue(val);
      setFromInput(String(val[0]));
      setToInput(String(val[1]));
      onChange(val);
    },
    [onChange]
  );

  const handleFromInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFromInput(val);

      // Detect spinner arrow clicks: value changes by exactly step
      const num = parseInt(val, 10);
      if (!isNaN(num) && Math.abs(num - localValue[0]) === step) {
        const clampedNum = Math.max(min, Math.min(num, localValue[1]));
        if (clampedNum === num) {
          const newValue: [number, number] = [num, localValue[1]];
          setLocalValue(newValue);
          onChange(newValue);
        }
      }
    },
    [localValue, step, min, onChange]
  );

  const handleToInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setToInput(val);

      // Detect spinner arrow clicks: value changes by exactly step
      const num = parseInt(val, 10);
      if (!isNaN(num) && Math.abs(num - localValue[1]) === step) {
        const clampedNum = Math.max(localValue[0], Math.min(num, max));
        if (clampedNum === num) {
          const newValue: [number, number] = [localValue[0], num];
          setLocalValue(newValue);
          onChange(newValue);
        }
      }
    },
    [localValue, step, max, onChange]
  );

  const handleFromInputBlur = useCallback(() => {
    let num = parseInt(fromInput, 10);
    if (isNaN(num)) {
      num = min;
    }
    num = Math.max(min, Math.min(num, localValue[1]));
    const newValue: [number, number] = [num, localValue[1]];
    setLocalValue(newValue);
    setFromInput(String(num));
    onChange(newValue);
  }, [fromInput, min, localValue, onChange]);

  const handleToInputBlur = useCallback(() => {
    let num = parseInt(toInput, 10);
    if (isNaN(num)) {
      num = max;
    }
    num = Math.max(localValue[0], Math.min(num, max));
    const newValue: [number, number] = [localValue[0], num];
    setLocalValue(newValue);
    setToInput(String(num));
    onChange(newValue);
  }, [toInput, max, localValue, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, type: "from" | "to") => {
      if (e.key === "Enter") {
        if (type === "from") {
          handleFromInputBlur();
        } else {
          handleToInputBlur();
        }
      }
    },
    [handleFromInputBlur, handleToInputBlur]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Slider
        value={localValue}
        onChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        disableSwap
        sx={{
          mb: 2,
          "& .MuiSlider-thumb": {
            width: 16,
            height: 16,
            backgroundColor: "background.paper",
            border: "2px solid currentColor",
            "&:hover, &.Mui-focusVisible": {
              boxShadow: "0 0 0 8px rgba(44, 95, 102, 0.16)",
            },
          },
          "& .MuiSlider-track": {
            height: 4,
          },
          "& .MuiSlider-rail": {
            height: 4,
            opacity: 0.3,
          },
        }}
      />
      <Stack direction="row" spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {fromLabel}
          </Typography>
          <TextField
            value={fromInput}
            onChange={handleFromInputChange}
            onBlur={handleFromInputBlur}
            onKeyDown={(e) => handleKeyDown(e, "from")}
            size="small"
            fullWidth
            type="number"
            slotProps={{
              htmlInput: {
                min,
                max: localValue[1],
                step,
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {toLabel}
          </Typography>
          <TextField
            value={toInput}
            onChange={handleToInputChange}
            onBlur={handleToInputBlur}
            onKeyDown={(e) => handleKeyDown(e, "to")}
            size="small"
            fullWidth
            type="number"
            slotProps={{
              htmlInput: {
                min: localValue[0],
                max,
                step,
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default DualSlider;