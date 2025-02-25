"use client";

import React, { ReactNode, useState } from "react";

import { ViewState } from "react-map-gl";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "shadcn/button";
import { Spinner } from "shadcn/spinner";
import { cn } from "shadcn/utils/shadcn-utils";
import { H2, Lead, P } from "shadcn/typography";
import { Layer, PickingInfo } from "@deck.gl/core";
import { INITIAL_VIEW_STATE_EU } from "deckgl/viewports";
import BaseDeckGLMap from "components/scenarios/BaseDeckGLMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "shadcn/tabs";

interface ScenarioTemplateProps {
  id: string;
  title: string;
  description?: string;
  statsCard?: ReactNode;
  filterMenus: ReactNode[];
  infoPanel?: ReactNode;
  layers: Layer[];
  hoverTooltip?: ReactNode;
  viewState?: ViewState;
  isLoading?: boolean;
  error?: string | null;
}

export default function ScenarioTemplate({
  id,
  title,
  description = "The common snapping turtlse (Chelydra serpentina) is a species of large freshwater turtle in the family Chelydridae. Its natural range extends from southeastern Canada, southwest to the edge of the Rocky Mountains.",
  statsCard,
  filterMenus,
  infoPanel,
  layers,
  hoverTooltip,
  viewState = INITIAL_VIEW_STATE_EU,
  isLoading = false,
  error = null,
}: ScenarioTemplateProps) {
  const [isInfoOpen, setInfoOpen] = useState<boolean>(false);
  const [isLeftPanelOpen, setLeftPanelOpen] = useState<boolean>(false);

  const onMapClick = (info: PickingInfo) => {
    if (!info.object) {
      setInfoOpen(false);
    } else {
      setInfoOpen(true);
    }

    if (!info.object && isLeftPanelOpen) {
      setLeftPanelOpen(false);
    }
  };

  const panelBaseStyles =
    "absolute h-full transition-all duration-300 ease-out";
  const panelWidthStyles = "w-[35vh]";
  const panelContainerStyles = "rounded-2xl border border-gray-200 bg-white";
  const panelHiddenStyles = "pointer-events-none opacity-0";
  const panelVisibleStyles = "opacity-95";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mt-4 flex flex-col p-2">
        <div className="mx-auto max-w-4xl text-center">
          <H2>{title}</H2>
          <P className="text-muted-foreground">{description}</P>
        </div>

        {(statsCard || isLoading || error) && (
          <div className="mx-auto p-6">
            {error ? (
              <Lead>{error}</Lead>
            ) : isLoading ? (
              <Spinner />
            ) : (
              <Lead>{statsCard}</Lead>
            )}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative h-[90vh] overflow-hidden">
        {/* Left Panel Toggle */}
        <div
          className={`absolute z-10 ${isLeftPanelOpen ? "pointer-events-none opacity-0" : ""}`}
        >
          <div className="absolute left-4 top-4 z-10">
            <Button
              variant="secondary"
              className={cn(
                "h-12 w-12 rounded-lg bg-white text-orange-500 shadow-md",
                isLeftPanelOpen && "pointer-events-none opacity-0",
              )}
              onClick={() => setLeftPanelOpen(true)}
            >
              <SlidersHorizontal className="!h-6 !w-6" strokeWidth={2.2} />
            </Button>
          </div>
        </div>

        {/* Left Panel */}
        <div
          className={cn(
            panelBaseStyles,
            panelWidthStyles,
            isLeftPanelOpen ? panelVisibleStyles : panelHiddenStyles,
            "z-20 -translate-x-full",
            isLeftPanelOpen && "!translate-x-0",
          )}
        >
          <div className={cn(panelContainerStyles, "h-full overflow-auto")}>
            <div className="flex flex-col">
              <Tabs defaultValue="filters">
                <div className="flex items-center justify-between border-b p-4">
                  <Button
                    variant="ghost"
                    className="h-12 w-12"
                    onClick={() => setLeftPanelOpen(false)}
                  >
                    <X className="h-12 w-12" />{" "}
                  </Button>
                  <TabsList>
                    <TabsTrigger value="filters">Filters</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="filters">
                  <div className="flex flex-col">
                    {filterMenus.map((filter, index) => (
                      <div key={`filter-${index}`} className="p-5">
                        {filter}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="data">
                  <h2 className="text-center">wip ...</h2>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Deck GL Map */}
        <div className="h-full">
          <div className="relative h-full overflow-hidden rounded-2xl border border-gray-200">
            <BaseDeckGLMap
              id={id}
              layers={layers}
              viewState={viewState}
              onMapClick={onMapClick}
            />
            {hoverTooltip}
          </div>
        </div>

        {/* Info Panel */}
        <div
          className={cn(
            panelBaseStyles,
            panelWidthStyles,
            isInfoOpen ? panelVisibleStyles : panelHiddenStyles,
            "right-0 top-0 z-10",
            "translate-x-full",
            isInfoOpen && "!translate-x-0",
          )}
        >
          <div className={cn(panelContainerStyles, "h-full overflow-auto")}>
            <div className="items-right flex justify-end border-b p-4">
              <Button
                variant="ghost"
                className="h-12 w-12"
                onClick={() => setInfoOpen(false)}
              >
                <X />
              </Button>
            </div>
            {infoPanel}
          </div>
        </div>
      </div>
    </div>
  );
}
