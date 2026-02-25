"use client";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FlyToInterpolator } from "@deck.gl/core";
import DeckGLMap from "@/components/deckgl/DeckGLMap";
import Navbar from "@/components/layout/Navbar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import Feedback, { FeedbackButton } from "../layout/Feedback";
import { IconTextButton } from "@/components/mui/IconTextButton";
import { LayerSwitcher, LayerConfig } from "@/components/mui/LayerSwitcher";
import { SideMenu } from "@/components/mui/SideMenu";
import {
  Box,
  Button,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuIcon from "@mui/icons-material/Menu";
import { ViewState } from "react-map-gl/mapbox";
import { Map, Public } from "@mui/icons-material";
import { ScenarioSelector } from "@/components/mui";
import { SIDE_MENU_WIDTH } from "@/components/mui/SideMenu";
import { InfoPanelContainer, SelectedItem, getSelectionLabel } from "@/components/infopanel";

interface BaseUIProps {
  layerConfigs: LayerConfig[];
  activeLayerIndex: number;
  onLayerChange: (index: number) => void;
  title: ReactNode;
  search: ReactNode;
  filters: ReactNode;
  /** Default view state for a given scenario */
  defaultViewState: ViewState;
  /** Initial view state from URL (takes precedence over defaultViewState) */
  initialViewState?: Partial<ViewState> | null;
  /** Callback when view state changes (for URL persistence) */
  onViewStateChange?: (viewState: ViewState) => void;
  /** Callback to reset all filters to default values */
  onResetAll?: () => void;
  onEmptyMapClick?: () => void;
  loading?: boolean;
  error: Error | null;
  scenarioName: string;
  scenarioTitle?: string;
  /** Content to render inside the right-side list panel */
  listContent?: ReactNode;
  /** Called once on mount with a stable flyTo function */
  onFlyToReady?: (flyTo: (geolocation: number[]) => void) => void;
  /** Currently selected map item for the info panel */
  selectedItem?: SelectedItem | null;
  /** Whether the info panel is open */
  infoPanelOpen?: boolean;
  /** Callback when info panel is closed */
  onInfoPanelClose?: () => void;
  /** Callback when info panel quick-access button is clicked */
  onInfoPanelOpen?: () => void;
}

export default function MapController({
  layerConfigs,
  activeLayerIndex,
  onLayerChange,
  title,
  search,
  filters,
  defaultViewState,
  initialViewState,
  onViewStateChange,
  onResetAll,
  onEmptyMapClick,
  loading = false,
  error = null,
  scenarioName,
  scenarioTitle,
  listContent,
  onFlyToReady,
  selectedItem,
  infoPanelOpen = false,
  onInfoPanelClose,
  onInfoPanelOpen,
}: BaseUIProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showSearchbar, setShowSearchbar] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const [isGlobe, setIsGlobe] = useState(false);

  // Mutual exclusion: close list when info panel opens
  useEffect(() => {
    if (infoPanelOpen) setListOpen(false);
  }, [infoPanelOpen]);

  /** Create fresh layer instances for the active config (deck.gl layers are single-use) */
  const activeLayers = useMemo(
    () => layerConfigs[activeLayerIndex]?.createLayers() ?? [],
    [layerConfigs, activeLayerIndex],
  );

  /** View State Logic **/

  /** Merge initialViewState (from URL) with defaultViewState -> actual starting position */
  const effectiveViewState: ViewState = initialViewState
    ? { ...defaultViewState, ...initialViewState }
    : defaultViewState;

  /** Reference to track effectiveViewState (no state to avoid rerenders) */
  const viewStateRef = useRef<ViewState>(effectiveViewState);

  /** Enables programmatic actions for viewState animation */
  type CommandedViewState = ViewState & {
    transitionDuration?: number;
    transitionInterpolator?: FlyToInterpolator;
  };
  const [commandedViewState, setCommandedViewState] = useState<
    CommandedViewState | undefined
  >(() => (initialViewState ? effectiveViewState : undefined));

  const handleViewStateChange = (newViewState: ViewState) => {
    /** Exclude bearing and pitch to let defaultViewState set it specifically for the scenarios */
    const { bearing, pitch, ...rest } = newViewState;
    viewStateRef.current = rest as ViewState;
    if (commandedViewState) setCommandedViewState(undefined);
    onViewStateChange?.(rest as ViewState);
  };

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
          pitch: 45,
          bearing: -20,
          zoom: 15.5,
          transitionDuration: 1500,
          transitionInterpolator: new FlyToInterpolator(),
        });
      },
      (error) => {
        // ToDo: Error message and make geolocation button greyed out
      },
    );
  };

  useEffect(() => {
    onFlyToReady?.((geo: number[]) => {
      setCommandedViewState({
        ...viewStateRef.current,
        latitude: geo[1],
        longitude: geo[0],
        pitch: 45,
        bearing: -20,
        zoom: 15.5,
        transitionDuration: 1200,
        transitionInterpolator: new FlyToInterpolator(),
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      {/* Desktop Navbar - hidden on mobile */}
      {!isMobile && (
        <Navbar centerTitle={title}>
          <Box sx={{ flexGrow: 1 }} />
          <ScenarioSelector canRoute={true} />
          <Box
            sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}
          >
            <FeedbackButton
              showBanner={showBanner}
              setShowBanner={setShowBanner}
              setShowFeedback={setShowFeedback}
            />
          </Box>
        </Navbar>
      )}

      <Box sx={{ flex: 1, position: "relative" }}>
        {/* Map */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          <DeckGLMap
            id="funding-map"
            layers={activeLayers}
            defaultViewState={defaultViewState}
            commandedViewState={commandedViewState}
            onViewStateChange={handleViewStateChange}
            isGlobe={isGlobe}
            // onMapClick={(info: PickingInfo) => console.log("no")}
            onEmptyMapClick={onEmptyMapClick}
            loading={loading}
            error={error}
          />
        </Box>
        {/* UI Controls - overlay on top of scenarios */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            "& > *": { pointerEvents: "auto" }, // Trick to enable UI interaction
          }}
        >
          {/* Top Center: Title (mobile only — desktop uses Navbar centerTitle) */}
          {isMobile && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  borderRadius: "0 0 12px 12px",
                  px: 3,
                  py: 1,
                  minWidth: 200,
                  minHeight: 40,
                }}
              >
                {title}
              </Paper>
            </Box>
          )}

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
              {/* Search Bar - hidden on mobile */}
              {!isMobile && (
                <Paper sx={{ borderRadius: 4 }} elevation={3}>
                  {search}
                </Paper>
              )}
              {/* Menu Button - mobile only */}
              {isMobile && (
                <Paper
                  elevation={3}
                  sx={{ borderRadius: 4, width: "fit-content" }}
                >
                  <IconTextButton
                    icon={<MenuIcon />}
                    label="Menu"
                    tooltip="Open Menu"
                    onClick={() => setNavbarOpen(true)}
                  />
                </Paper>
              )}
              <Paper
                elevation={3}
                sx={{ borderRadius: 4, width: "fit-content" }}
              >
                <IconTextButton
                  icon={<FilterListIcon />}
                  label="Filter"
                  tooltip="Open Filter Panel"
                  onClick={() => {
                    setFiltersOpen(true);
                    setShowSearchbar(false);
                  }}
                />
              </Paper>
            </Box>
          )}

          {/* Top Right: List Button + Info Panel Quick-Access */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
            }}
          >
            <Stack direction="column" spacing={1}>
              <Paper elevation={3} sx={{ borderRadius: 4 }}>
                <IconTextButton
                  icon={<FormatListBulletedIcon />}
                  label="Institutions"
                  tooltip="Open Institutions Panel"
                  onClick={() => setListOpen(true)}
                />
              </Paper>
              {selectedItem && !infoPanelOpen && (
                <Paper elevation={3} sx={{ borderRadius: 4 }}>
                  <IconTextButton
                    icon={<InfoOutlinedIcon />}
                    label={getSelectionLabel(selectedItem)}
                    tooltip="Reopen Info Panel"
                    onClick={() => onInfoPanelOpen?.()}
                  />
                </Paper>
              )}
            </Stack>
          </Box>

          {/* Bottom Left: Layer Switcher */}
          {layerConfigs.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 22,
                left: filtersOpen ? SIDE_MENU_WIDTH + 22 : 22,
                transition: "left 0.3s ease",
              }}
            >
              <LayerSwitcher
                layerConfigs={layerConfigs}
                activeIndex={activeLayerIndex}
                onChange={onLayerChange}
              />
            </Box>
          )}

          {/* Bottom Right: Map Controls */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: infoPanelOpen || listOpen ? SIDE_MENU_WIDTH + 16 : 16,
              transition: "right 0.3s ease",
            }}
          >
            <Stack direction="column" spacing={1}>
              <Paper elevation={9} sx={{ borderRadius: "20%" }}>
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
                elevation={9}
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
              <Paper elevation={9} sx={{ borderRadius: "20%" }}>
                <IconTextButton
                  placement={"left"}
                  icon={<MyLocationIcon />}
                  tooltip="Zoom to your location"
                  onClick={handleGeolocate}
                />
              </Paper>

              <Paper elevation={9} sx={{ borderRadius: "8px" }}>
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
              onClick={onResetAll}
            >
              Reset All
            </Button>
          }
          children={filters}
        >
          {/* Filter content will go here */}
        </SideMenu>

        {/* Right Side Menu: List */}
        <SideMenu
          side="right"
          title="Institutions"
          open={listOpen}
          onClose={() => setListOpen(false)}
        >
          {listContent}
        </SideMenu>

        {/* Right Side Menu: Info Panel */}
        <InfoPanelContainer
          selectedItem={selectedItem ?? null}
          open={infoPanelOpen}
          onClose={() => onInfoPanelClose?.()}
        />

        {/* Mobile Navbar Menu */}
        <SideMenu
          side="left"
          title="Menu"
          open={navbarOpen}
          onClose={() => setNavbarOpen(false)}
        >
          <MobileNavbar>
            <ScenarioSelector canRoute={true} />
            <FeedbackButton
              showBanner={showBanner}
              setShowBanner={setShowBanner}
              setShowFeedback={setShowFeedback}
            />
          </MobileNavbar>
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
