"use client";
import { ReactNode, useRef, useState } from "react";
import { FlyToInterpolator, Layer } from "@deck.gl/core";
import BaseDeckGLMap from "components/baseui/BaseDeckGLMap";
import Navbar from "@/components/Navbar";
import Feedback, { FeedbackButton } from "./Feedback";
import { IconTextButton } from "@/components/mui/IconTextButton";
import { MapStyleSwitcher } from "@/components/mui/MapStyleSwitcher";
import { SideMenu } from "@/components/mui/SideMenu";
import { Box, Button, Paper, Stack } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ViewState } from "react-map-gl/mapbox";
import { Map, Public } from "@mui/icons-material";
import { ScenarioSelector } from "@/components/mui";

interface BaseUIProps {
  layers: Layer[];
  search: ReactNode;
  filters: ReactNode;
  defaultViewState: ViewState;
  /** Initial view state from URL (takes precedence over defaultViewState) */
  initialViewState?: Partial<ViewState> | null;
  /** Callback when view state changes (for URL persistence) */
  onViewStateChange?: (viewState: ViewState) => void;
  onEmptyMapClick?: () => void;
  loading?: boolean;
  error: Error | null;
  scenarioName: string;
  scenarioTitle?: string;
}

export default function BaseUI({
  layers,
  search,
  filters,
  defaultViewState,
  initialViewState,
  onViewStateChange,
  onEmptyMapClick,
  loading = false,
  error = null,
  scenarioName,
  scenarioTitle,
}: BaseUIProps) {
  const [showSearchbar, setShowSearchbar] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const [isGlobe, setIsGlobe] = useState(false);

  type CommandedViewState = ViewState & {
    transitionDuration?: number;
    transitionInterpolator?: FlyToInterpolator;
  };

  // Merge initialViewState (from URL) with defaultViewState
  const effectiveDefaultViewState: ViewState = initialViewState
    ? { ...defaultViewState, ...initialViewState }
    : defaultViewState;

  const viewStateRef = useRef<ViewState>(effectiveDefaultViewState);
  const [commandedViewState, setCommandedViewState] = useState<
    CommandedViewState | undefined
  >(() => (initialViewState ? effectiveDefaultViewState : undefined));

  const handleReset = () => {
    setCommandedViewState({
      ...defaultViewState,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator(),
    });
  };

  const handleZoom = (delta: number) => {
    const current = viewStateRef.current;
    setCommandedViewState({
      ...current,
      zoom: Math.min(Math.max((current.zoom ?? 0) + delta, 0), 20),
      transitionDuration: 300,
      transitionInterpolator: new FlyToInterpolator(),
    });
  };

  const handleGeolocate = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCommandedViewState({
          ...viewStateRef.current,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          zoom: 10,
          transitionDuration: 2000,
          transitionInterpolator: new FlyToInterpolator(),
        });
      },
      (error) => {
        // ToDo: Error message and make geolocation button greyed out
      },
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Navbar>
        <Box sx={{ flexGrow: 1 }} />
        <ScenarioSelector canRoute={true} />
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
          <FeedbackButton
            showBanner={showBanner}
            setShowBanner={setShowBanner}
            setShowFeedback={setShowFeedback}
          />
        </Box>
      </Navbar>

      <Box sx={{ flex: 1, position: "relative" }}>
        {/* Map */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          <BaseDeckGLMap
            id="funding-map"
            layers={layers}
            defaultViewState={defaultViewState}
            commandedViewState={commandedViewState}
            onViewStateChange={(newViewState) => {
              viewStateRef.current = newViewState;
              if (commandedViewState) setCommandedViewState(undefined);
              onViewStateChange?.(newViewState);
            }}
            isGlobe={isGlobe}
            // onMapClick={(info: PickingInfo) => console.log("no")}
            onEmptyMapClick={onEmptyMapClick}
            loading={loading}
            error={error}
          />
        </Box>
        {/* UI Controls - overlay on top of map */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            "& > *": { pointerEvents: "auto" }, // Trick to enable UI interaction
          }}
        >
          {/* Top Left: Search Bar and Filter Button */}
          {showSearchbar && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Paper sx={{ borderRadius: 4 }} elevation={3}>
                {search}
              </Paper>
              <Paper
                elevation={3}
                sx={{ borderRadius: 4, width: "fit-content" }}
              >
                <IconTextButton
                  icon={<FilterListIcon />}
                  label="Filters"
                  tooltip="Open Filter Panel"
                  onClick={() => {
                    setFiltersOpen(true);
                    setShowSearchbar(false);
                  }}
                />
              </Paper>
            </Box>
          )}

          {/* Top Right: List Button */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
            }}
          >
            <Paper elevation={3} sx={{ borderRadius: 4 }}>
              <IconTextButton
                icon={<FormatListBulletedIcon />}
                label="List"
                tooltip="Open Data List Panel"
                onClick={() => setListOpen(true)}
              />
            </Paper>
          </Box>

          {/* Bottom Left: Map Style Switcher */}
          <Box
            sx={{
              position: "absolute",
              bottom: 22,
              left: 22,
            }}
          >
            <MapStyleSwitcher />
          </Box>

          {/* Bottom Right: Map Controls */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
            }}
          >
            <Stack direction="column" spacing={1}>
              <Paper elevation={3} sx={{ borderRadius: "20%" }}>
                <IconTextButton
                  placement={"left"}
                  onClick={handleReset}
                  icon={<RefreshIcon />}
                  tooltip="Reset view"
                />
              </Paper>
              <Paper
                onClick={() => {
                  setIsGlobe(!isGlobe);
                }}
                elevation={3}
                sx={{ borderRadius: "20%" }}
              >
                {isGlobe ? (
                  <IconTextButton
                    placement={"left"}
                    icon={<Map />}
                    tooltip="Switch to 2D"
                  />
                ) : (
                  <IconTextButton
                    placement={"left"}
                    icon={<Public />}
                    tooltip="Switch to 3D"
                  />
                )}
              </Paper>
              <Paper elevation={3} sx={{ borderRadius: "20%" }}>
                <IconTextButton
                  placement={"left"}
                  icon={<MyLocationIcon />}
                  tooltip="Zoom to your location"
                  onClick={handleGeolocate}
                />
              </Paper>

              <Paper elevation={3} sx={{ borderRadius: "8px" }}>
                <Stack direction="column" spacing={0}>
                  <IconTextButton
                    placement={"left"}
                    icon={<AddIcon />}
                    tooltip="Zoom in"
                    onClick={() => handleZoom(1)}
                  />
                  <IconTextButton
                    placement={"left"}
                    icon={<RemoveIcon />}
                    tooltip="Zoom out"
                    onClick={() => handleZoom(-1)}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Box>

        {/* Left Side Menu: Filters */}
        <SideMenu
          side="left"
          title="Filters"
          open={filtersOpen}
          onClose={() => {
            setFiltersOpen(false);
            setShowSearchbar(true);
          }}
          headerActions={
            <Button
              variant="outlined"
              size="small"
              sx={{ borderRadius: 4, textTransform: "none" }}
            >
              Reset All
            </Button>
          }
          children={filters}
        >
          {/* Filter content will go here */}
        </SideMenu>

        {/* Left Side Menu: List */}
        <SideMenu
          side="right"
          title="List"
          open={listOpen}
          onClose={() => setListOpen(false)}
          headerActions={undefined}
          children={<Stack>{undefined}</Stack>}
        >
          {/* List content will go here */}
        </SideMenu>

        {/* Feedback Modal */}
        <Feedback
          scenarioName={scenarioName}
          scenarioTitle={scenarioTitle}
          showFeedback={showFeedback}
          setShowFeedback={setShowFeedback}
          showBanner={showBanner}
        />
      </Box>
    </Box>
  );
}
