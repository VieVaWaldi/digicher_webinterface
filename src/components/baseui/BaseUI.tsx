import { Layer, PickingInfo } from "@deck.gl/core";
import BaseDeckGLMap from "components/baseui/BaseDeckGLMap";
import { ReactNode, useState } from "react";
import { ViewState } from "react-map-gl";
import { InfoBox, MainMenu, Title } from "./BaseUIComponents";
import Feedback from "./Feedback";

interface BaseUIProps {
  layers: Layer[];
  viewState: ViewState;

  titleContent: ReactNode;
  infoBoxContent: ReactNode;

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
  onDownloadAction,
  onEmptyMapClick,
  scenarioName,
  scenarioTitle,
  loading = false,
  error = null,
}: BaseUIProps) {
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const handleToggleNavigation = () => {
    setShowNavigation(!showNavigation);
  };

  const handleNavigate = () => {
    setShowNavigation(false);
  };

  const handleShowInfoBox = () => {
    setShowInfoBox(!showInfoBox);
  };

  const handleHideInfoBox = () => {
    setShowInfoBox(false);
  };

  return (
    <div className="h-full w-full bg-gray-100">
      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white">
        <Title
          loading={loading}
          titleContent={titleContent}
          centerOffset="left-1/2 -translate-x-1/2"
        />

        <MainMenu
          showNavigation={showNavigation}
          onToggleNavigation={handleToggleNavigation}
          onNavigate={handleNavigate}
          onShowInfoBox={handleShowInfoBox}
          onDownloadAction={onDownloadAction}
          showBanner={showBanner}
          setShowBanner={setShowBanner}
          setShowFeedback={setShowFeedback}
        />

        <InfoBox
          showInfoBox={showInfoBox}
          onHideInfoBox={handleHideInfoBox}
          infoBoxContent={infoBoxContent}
        />

        <Feedback
          showFeedback={showFeedback}
          setShowFeedback={setShowFeedback}
          scenarioName={scenarioName}
          scenarioTitle={scenarioTitle}
          showBanner={showBanner}
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
      </div>
    </div>
  );
}
