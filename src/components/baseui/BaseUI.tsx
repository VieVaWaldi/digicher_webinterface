import { Layer, PickingInfo } from "@deck.gl/core";
import { scenarios } from "app/scenarios";
import BaseDeckGLMap from "components/baseui/BaseDeckGLMap";
import SettingsMenu from "components/menus/SettingsMenu";
import {
  Download,
  Filter,
  Home,
  InfoIcon,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { ViewState } from "react-map-gl";
import { Button } from "shadcn/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "shadcn/sheet";
import { Spinner } from "shadcn/spinner";

import { H2, H5 } from "shadcn/typography";

const CSS_BUTTON = "h-10 w-10 rounded-xl bg-white text-orange-500";
const STRK_WDTH = 2.2;
const BTN_SCALE = 1.5;

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
  loading = false,
  error = null,
}: BaseUIProps) {
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const router = useRouter();

  const Title = () => {
    return (
      <div className="absolute left-1/2 z-10 -translate-x-1/2 rounded-b-xl bg-white px-3 py-2 text-center">
        <div className="flex h-6 items-center justify-center">
          {loading ? <Spinner className="h-8 w-8" /> : <H5>{titleContent}</H5>}
        </div>
      </div>
    );
  };

  /** Action Buttons */
  const TopLeftMenu = () => {
    return (
      <div className="absolute left-2 top-2 z-10 flex flex-col space-y-2">
        <NavigationButton />
        <NavigationSlideMenu />
        <InfoButton />
        <FilterButton />
        <DownloadButton />
        <SettingsButton />
      </div>
    );
  };

  const NavigationButton = () => {
    return (
      <Button
        variant="secondary"
        className={CSS_BUTTON}
        onClick={() => setShowNavigation(!showNavigation)}
      >
        {showNavigation ? (
          <X
            strokeWidth={STRK_WDTH}
            style={{ transform: `scale(${BTN_SCALE})` }}
          />
        ) : (
          <Menu
            strokeWidth={STRK_WDTH}
            style={{ transform: `scale(${BTN_SCALE})` }}
          />
        )}
      </Button>
    );
  };

  const NavigationSlideMenu = () => {
    if (!showNavigation) return null;

    return (
      <div className="flex flex-row space-x-2 duration-300 animate-in slide-in-from-left">
        {/* Home button as first item */}
        <Button
          variant="secondary"
          className="flex h-10 items-center space-x-2 rounded-xl bg-white px-3 text-orange-500"
          onClick={() => {
            router.push("/");
            setShowNavigation(false);
          }}
        >
          <Home
            strokeWidth={STRK_WDTH}
            style={{ transform: `scale(${BTN_SCALE})` }}
          />
          {/* <span className="text-xs font-medium">Home</span> */}
        </Button>

        {/* Scenario buttons */}
        {scenarios.map((scenario) => {
          const IconComponent = scenario.icon;
          return (
            <Button
              key={scenario.id}
              variant="secondary"
              className="flex h-10 items-center space-x-2 rounded-xl bg-white px-3 text-orange-500"
              onClick={() => {
                router.push(scenario.href);
                setShowNavigation(false);
              }}
            >
              <IconComponent
                strokeWidth={STRK_WDTH}
                style={{ transform: `scale(${BTN_SCALE})` }}
              />
              {/* <span className="text-xs font-medium">{scenario.title}</span> */}
            </Button>
          );
        })}
      </div>
    );
  };

  const FilterButton = () => {
    return (
      <Button
        variant="secondary"
        className={CSS_BUTTON}
        onClick={() => toggleRightSideMenu("filters")}
      >
        <Filter
          strokeWidth={STRK_WDTH}
          style={{ transform: `scale(${BTN_SCALE})` }}
        />
      </Button>
    );
  };

  const SettingsButton = () => {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" className={CSS_BUTTON}>
            <Settings
              strokeWidth={STRK_WDTH}
              style={{ transform: `scale(${BTN_SCALE})` }}
            />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Settings</SheetTitle>
          <SettingsMenu />
        </SheetContent>
      </Sheet>
    );
  };

  const InfoButton = () => {
    return (
      <Button
        variant="secondary"
        className={CSS_BUTTON}
        onClick={() => setShowInfoBox(true)}
      >
        <InfoIcon
          strokeWidth={STRK_WDTH}
          style={{ transform: `scale(${BTN_SCALE})` }}
        />
      </Button>
    );
  };

  const DownloadButton = () => {
    return (
      onDownloadAction && (
        <Button
          variant="secondary"
          className={CSS_BUTTON}
          onClick={onDownloadAction}
        >
          <Download
            strokeWidth={STRK_WDTH}
            style={{ transform: `scale(${BTN_SCALE})` }}
          />
        </Button>
      )
    );
  };

  /** Container Components */
  const InfoBox = () => {
    if (!showInfoBox) return null;

    return (
      <div
        className="absolute inset-0 z-20 flex items-center justify-center"
        onClick={() => setShowInfoBox(false)}
      >
        <div className="relative max-h-[80vh] w-11/12 max-w-2xl overflow-y-auto rounded-xl bg-white/60 p-6 backdrop-blur-md">
          <div className="flex flex-row justify-between">
            <H2 className="text-xl font-semibold text-gray-800">
              About This Visualisation
            </H2>
            <button
              className="-mt-3 mb-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowInfoBox(false)}
            >
              <X className="text-gray-500" />
            </button>
          </div>
          <div className="mb-4 h-px w-full bg-gray-300" />
          {infoBoxContent}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-gray-100">
      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white">
        <Title />
        <TopLeftMenu />
        <InfoBox />
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
      </div>
    </div>
  );
}
