"use client";

import { useState } from "react";
import { Box, BoxProps, Paper, Typography } from "@mui/material";
import { Layer } from "@deck.gl/core";

export interface LayerConfig {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  createLayers: () => Layer[];
}

export interface LayerSwitcherProps extends Omit<BoxProps, "onChange"> {
  layerConfigs: LayerConfig[];
  activeIndex: number;
  onChange: (index: number) => void;
}

const THUMBNAIL_SIZE = 80;

export const LayerSwitcher = ({
  layerConfigs,
  activeIndex,
  onChange,
  sx,
  ...props
}: LayerSwitcherProps) => {
  const [hovered, setHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeConfig = layerConfigs[activeIndex];
  const otherConfigs = layerConfigs.filter((_, i) => i !== activeIndex);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setHoveredIndex(null);
      }}
      sx={{
        display: "flex",
        alignItems: "stretch",
        ...sx,
      }}
      {...props}
    >
      {/* Active layer thumbnail — always visible */}
      <Box
        sx={{ position: "relative", zIndex: 2 }}
        onMouseEnter={() => setHoveredIndex(activeIndex)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Description surface above active thumbnail */}
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            mb: 1,
            px: 1.5,
            py: 1,
            // minWidth: 160,
            // maxWidth: 320,
            width: 180,
            opacity: hoveredIndex !== null ? 1 : 0,
            transform: hoveredIndex !== null ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 0.2s, transform 0.2s",
            pointerEvents: "none",
            borderRadius: 2,
          }}
        >
          {hoveredIndex !== null && hoveredIndex !== activeIndex ? (
            <>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4 }}>
                Switch to: {layerConfigs[hoveredIndex]?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                {layerConfigs[hoveredIndex]?.description}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4 }}>
                {activeConfig?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                {activeConfig?.description}
              </Typography>
            </>
          )}
        </Paper>

        <Paper
          elevation={3}
          sx={{
            width: THUMBNAIL_SIZE,
            borderRadius: 2,
            overflow: "hidden",
            cursor: "default",
            border: "3px solid",
            borderColor: "primary.main",
          }}
        >
          <Box
            sx={{
              width: THUMBNAIL_SIZE,
              height: THUMBNAIL_SIZE,
              backgroundImage: `url(${activeConfig?.previewImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              py: 0.5,
              px: 0.5,
              fontWeight: 600,
              lineHeight: 1.2,
              bgcolor: "background.paper",
            }}
          >
            {activeConfig?.title}
          </Typography>
        </Paper>
      </Box>

      {/* Expandable panel with other layers */}
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          ml: 1,
          px: 1.5,
          borderRadius: 2,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-8px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
          pointerEvents: hovered ? "auto" : "none",
          maxWidth: hovered ? 600 : 0,
          maxHeight: hovered ? 600 : 0,
          overflow: "visible",
        }}
      >
        {otherConfigs.map((config) => {
          const originalIndex = layerConfigs.findIndex((c) => c.id === config.id);
          return (
            <Box
              key={config.id}
              sx={{
                width: THUMBNAIL_SIZE,
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                border: "3px solid",
                borderColor: "transparent",
                transition: "border-color 0.2s",
                "&:hover": {
                  borderColor: "text.secondary",
                },
              }}
              onClick={() => onChange(originalIndex)}
              onMouseEnter={() => setHoveredIndex(originalIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Box
                sx={{
                  width: THUMBNAIL_SIZE,
                  height: THUMBNAIL_SIZE-10,
                  backgroundImage: `url(${config.previewImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  py: 0.5,
                  px: 0.5,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  bgcolor: "background.paper",
                }}
              >
                {config.title}
              </Typography>
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
};

export default LayerSwitcher;
