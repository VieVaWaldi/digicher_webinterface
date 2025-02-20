"use client";

import React, { ReactNode, useState } from "react";

import { Spinner } from "shadcn/spinner";
import { H2, Lead, P } from "shadcn/typography";
import { Layer, PickingInfo } from "@deck.gl/core";
import BaseDeckGLMap from "core/components/scenarios/BaseDeckGLMap";

interface ScenarioTemplateProps {
  id: string;
  title: string;
  description?: string;
  statsCard?: ReactNode;
  filterMenus: ReactNode[];
  infoPanel?: ReactNode;
  layers: Layer[];
  isLoading?: boolean;
  error?: string | null;
  mapStyle?: string;
}

export default function ScenarioTemplate({
  id,
  title,
  description = "The common snapping turtlse (Chelydra serpentina) is a species of large freshwater turtle in the family Chelydridae. Its natural range extends from southeastern Canada, southwest to the edge of the Rocky Mountains.",
  statsCard,
  filterMenus,
  infoPanel,
  layers,
  isLoading = false,
  error = null,
}: ScenarioTemplateProps) {
  const [isInfoOpen, setInfoOpen] = useState<boolean>(false);

  const onMapClick = (info: PickingInfo) => {
    if (!info.object) {
      setInfoOpen(false);
    } else {
      setInfoOpen(true);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 mt-4 flex flex-col gap-8 p-4">
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

      {/* Filter */}
      <div className="flex max-h-full flex-wrap justify-center rounded-lg border border-gray-200">
        {filterMenus.map((filter, index) => (
          <div key={`filter-${index}`} className="w-full p-2 sm:w-auto md:p-5">
            {filter}
          </div>
        ))}
      </div>

      {/* DeckGL & Infopanel */}
      <div className="relative h-[90vh] overflow-hidden">
        {/* Map container */}
        <div className="h-full w-full">
          <div className="relative h-full overflow-hidden rounded-lg border border-gray-200">
            <BaseDeckGLMap id={id} layers={layers} onMapClick={onMapClick} />
          </div>
        </div>

        {/* Info panel overlay */}
        <div
          className={`absolute transition-all duration-300 ease-in-out ${
            isInfoOpen ? "opacity-100" : "pointer-events-none opacity-0"
          } bottom-0 h-[20vh] w-full translate-y-full ${isInfoOpen ? "!translate-y-0" : ""} md:right-0 md:top-0 md:h-full md:w-96 md:translate-x-full md:translate-y-0 ${isInfoOpen ? "md:!translate-x-0" : ""} `}
        >
          <div className="flex h-full overflow-auto rounded-xl bg-white">
            <div className="min-h-full w-full">{infoPanel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
