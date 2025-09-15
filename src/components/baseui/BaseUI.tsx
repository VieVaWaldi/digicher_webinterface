import { Layer, PickingInfo } from "@deck.gl/core";
import BaseDeckGLMap from "components/baseui/BaseDeckGLMap";
import { ReactNode, useState } from "react";
import { ViewState } from "react-map-gl";
import { InfoBox, Title, TopLeftMenu } from "./BaseUIComponents";
import Feedback from "./Feedback";

interface BaseUIProps {
  layers: Layer[];
  viewState: ViewState;

  titleContent: ReactNode;
  infoBoxContent: ReactNode;

  rightSideMenu: ReactNode;
  toggleRightSideMenu: (tabdId: string) => void;
  isRightMenuOpen?: boolean;
  activeRightMenuTab?: string;

  onDownloadAction?: () => void;
  onMapClick?: (info: PickingInfo) => void;
  onEmptyMapClick?: () => void;

  scenarioName: string;
  scenarioTitle?: string;

  loading?: boolean;
  error: Error | null;
}

export default function BaseUI({
  layers,
  viewState,
  titleContent,
  infoBoxContent,
  rightSideMenu,
  toggleRightSideMenu,
  isRightMenuOpen,
  activeRightMenuTab,
  onDownloadAction,
  onEmptyMapClick,
  scenarioName,
  scenarioTitle,
  loading = false,
  error = null,
}: BaseUIProps) {
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);

  const handleToggleNavigation = () => {
    setShowNavigation(!showNavigation);
  };

  const handleNavigate = () => {
    setShowNavigation(false);
  };

  const handleShowInfoBox = () => {
    setShowInfoBox(true);
  };

  const handleHideInfoBox = () => {
    setShowInfoBox(false);
  };

  const getTitlePosition = (isOpen: boolean, activeTabId: string) => {
    if (!isOpen) return "left-1/2 -translate-x-1/2";

    if (activeTabId === "filters") {
      return "left-[35%] -translate-x-1/2";
    }
    return "left-1/4 -translate-x-1/2";
  };

  return (
    <div className="h-full w-full bg-gray-100">
      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white">
        <Title
          loading={loading}
          titleContent={titleContent}
          centerOffset={getTitlePosition(
            isRightMenuOpen || false,
            activeRightMenuTab || "",
          )}
        />

        <TopLeftMenu
          showNavigation={showNavigation}
          onToggleNavigation={handleToggleNavigation}
          onNavigate={handleNavigate}
          onToggleRightSideMenu={toggleRightSideMenu}
          onShowInfoBox={handleShowInfoBox}
          onDownloadAction={onDownloadAction}
        />

        <InfoBox
          showInfoBox={showInfoBox}
          onHideInfoBox={handleHideInfoBox}
          infoBoxContent={infoBoxContent}
        />

        <BaseDeckGLMap
          id="funding-map"
          layers={layers}
          viewState={viewState}
          onMapClick={(info: PickingInfo) => console.log("no")}
          onEmptyMapClick={onEmptyMapClick}
          loading={loading}
          error={error}
        />

        {rightSideMenu}
        <Feedback scenarioName={scenarioName} scenarioTitle={scenarioTitle} />
      </div>
    </div>
  );
}
