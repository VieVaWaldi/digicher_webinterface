"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { Layer, PickingInfo } from "@deck.gl/core";
import { H2, Lead, P } from "shadcn/typography";
import { Card } from "shadcn/card";
import { Spinner } from "shadcn/spinner";

import UnifiedDeckMap from "core/components/deckgl/UnifiedDeckMap";

interface ScenarioTemplateProps {
  id: string;
  title: string;
  description?: string;
  statsCard?: ReactNode;
  filterMenus: ReactNode[];
  detailsCard?: ReactNode;
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
  detailsCard,
  layers,
  isLoading = false,
  error = null,
}: ScenarioTemplateProps) {
  const [isInfoOpen, setInfoOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // This replaces the map elements (dots etc) when the map size changes
      window.dispatchEvent(new Event("resize"));
    }, 100);

    return () => clearTimeout(timer);
  }, [isInfoOpen]);

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
          <Card className="mx-auto p-6">
            {error ? (
              <Lead>{error}</Lead>
            ) : isLoading ? (
              <Spinner />
            ) : (
              <Lead>{statsCard}</Lead>
            )}
          </Card>
        )}

        {/* Filter */}
        <div className="mx-auto flex flex-wrap justify-start gap-4">
          {filterMenus.map((filter, index) => (
            <Card key={`filter-${index}`} className="w-full p-6 sm:w-auto">
              {filter}
            </Card>
          ))}
        </div>
      </div>

      {/* DeckGL & InfoArea */}
      <div className="flex h-[90vh] flex-col md:flex-row">
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isInfoOpen ? "w-full md:w-64" : "h-0 w-0"} `}
        >
          {detailsCard}
        </div>
        <div className="relative flex-1 overflow-hidden rounded-lg border border-gray-200">
          <UnifiedDeckMap id={id} layers={layers} onMapClick={onMapClick} />
        </div>
      </div>
    </div>
  );
}
