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

  return (
    <div className="h-full w-full bg-gray-100">
      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white">
        <Title loading={loading} titleContent={titleContent} />

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
