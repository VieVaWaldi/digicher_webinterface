"use client";

import { Box, BoxProps } from "@mui/material";

export interface MapStyleSwitcherProps extends Omit<BoxProps, "onClick"> {
  previewImage?: string;
  onClick?: () => void;
}

export const MapStyleSwitcher = ({
  previewImage = "/images/settings/mapbox-dark.png",
  onClick,
  sx,
  ...props
}: MapStyleSwitcherProps) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 80,
        height: 80,
        borderRadius: 2,
        border: "3px solid",
        borderColor: "background.paper",
        overflow: "hidden",
        cursor: "pointer",
        backgroundImage: `url(${previewImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:hover": {
          borderColor: "text.secondary",
          boxShadow: 1,
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default MapStyleSwitcher;
