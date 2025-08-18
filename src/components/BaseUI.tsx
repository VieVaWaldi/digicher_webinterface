"use client";

import React, { useState, ReactNode } from "react";
import { Download, Globe2, Home, InfoIcon, X } from "lucide-react";
import { Button } from "shadcn/button";
import { useRouter } from "next/navigation";
import BaseDeckGLMap from "components/scenarios/BaseDeckGLMap";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "shadcn/sheet";
import SettingsMenu from "components/menus/SettingsMenu";
import { H2, H3, H4, H5 } from "shadcn/typography";
import { Layer } from "@deck.gl/core";
import { PickingInfo } from "@deck.gl/core";
import { ViewState } from "react-map-gl";

interface BaseUIProps {
  // Map props
  layers: Layer[];
  viewState: ViewState;
  onMapClick?: (info: PickingInfo) => void;

  // Title
  titleContent: ReactNode;

  // Info and Download
  infoBoxContent: ReactNode;
  onDownload: () => void;

  // Filter menu
  filterContent: ReactNode;

  // Data menu (right side panel)
  dataMenuContent?: ReactNode;
  isDataMenuOpen?: boolean;
  onCloseDataMenu?: () => void;

  // Additional content (scenario-specific panels, tooltips, etc.)
  additionalContent?: ReactNode;
}

const CSS_BUTTON = "h-10 w-10 rounded-xl bg-white text-orange-500";
const STRK_WDTH = 2.2;

export default function BaseUI({
  layers,
  viewState,
  onMapClick,
  titleContent,
  infoBoxContent,
  onDownload,
  filterContent,
  dataMenuContent,
  isDataMenuOpen = false,
  onCloseDataMenu,
  additionalContent,
}: BaseUIProps) {
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const router = useRouter();

  const HomeButton = () => {
    return (
      <Button
        variant="secondary"
        className={CSS_BUTTON}
        onClick={() => router.push("/")}
      >
        <Home strokeWidth={STRK_WDTH} style={{ transform: "scale(1.4)" }} />
      </Button>
    );
  };

  const GlobeButton = () => {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" className={CSS_BUTTON}>
            <Globe2
              strokeWidth={STRK_WDTH}
              style={{ transform: "scale(1.4)" }}
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

  const InfoButton = () => {
    return (
      <Button
        variant="secondary"
        className={CSS_BUTTON}
        onClick={() => setShowInfoBox(true)}
      >
        <InfoIcon strokeWidth={STRK_WDTH} style={{ transform: "scale(1.4)" }} />
      </Button>
    );
  };

  const DownloadButton = () => {
    return (
      <Button variant="secondary" className={CSS_BUTTON} onClick={onDownload}>
        <Download strokeWidth={STRK_WDTH} style={{ transform: "scale(1.4)" }} />
      </Button>
    );
  };

  const TopLeftMenu = () => {
    return (
      <div className="absolute left-2 top-2 z-10 flex flex-col space-y-2">
        <HomeButton />
        <InfoButton />
        <DownloadButton />
        <GlobeButton />
      </div>
    );
  };

  const FilterMenu = () => {
    return (
      <div
        className={`absolute bottom-0 right-0 flex h-full flex-col justify-end transition-transform duration-300 ease-in-out ${
          isFilterMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Toggle Button - always visible at the left edge */}
        <div className="absolute -left-[114px] top-12 z-10">
          <Button
            variant="secondary"
            className="h-10 rounded-l-xl rounded-r-none bg-white/60 p-4 backdrop-blur-md"
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          >
            <H5>{isFilterMenuOpen ? "Close Filters" : "Open Filters"}</H5>
          </Button>
        </div>

        {/* Filter Content */}
        <div className="h-full w-80 rounded-l-xl bg-white/60 p-4 backdrop-blur-md">
          <div className="flex flex-col space-y-4">{filterContent}</div>
        </div>
      </div>
    );
  };

  const DataMenu = () => {
    if (!isDataMenuOpen || !dataMenuContent) return null;

    return (
      <div className="absolute right-0 top-0 z-10 h-full w-80 bg-white/60 backdrop-blur-md">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800">Details</h3>
            <button
              onClick={onCloseDataMenu}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{dataMenuContent}</div>
        </div>
      </div>
    );
  };

  const Title = () => {
    return (
      <div className="absolute left-1/2 z-10 -translate-x-1/2 rounded-b-xl bg-white px-3 py-2 text-center">
        <H5>{titleContent}</H5>
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
          onMapClick={onMapClick || (() => {})}
        />
        <FilterMenu />
        <DataMenu />
        {additionalContent}
      </div>
    </div>
  );
}
