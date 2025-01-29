"use client";
import React, { ReactNode, useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import Map, { ViewState } from "react-map-gl";
import { Layer } from "@deck.gl/core";
import { Loader2 } from "lucide-react";
import { H2, Lead, P } from "core/components/shadcn/typography";
import { Card } from "core/components/shadcn/card";

interface ScenarioTemplateProps {
  title: string;
  description?: string;
  statsCard?: ReactNode;
  filters?: ReactNode;
  mapView?: ReactNode;
  detailsCard?: ReactNode;
  initialViewState: ViewState; // ViewState
  layers: Layer[];
  isLoading?: boolean;
  error?: string | null;
  mapStyle?: string;
}

export default function ScenarioTemplate({
  title,
  description = "The common snapping turtlse (Chelydra serpentina) is a species of large freshwater turtle in the family Chelydridae. Its natural range extends from southeastern Canada, southwest to the edge of the Rocky Mountains, as far east as Nova Scotia and Florida. The present-day Chelydra serpentina population in the Middle Rio Grande suggests that the common snapping turtle has been present in this drainage since at least the seventeenth century and is likely native.",
  statsCard,
  filters,
  mapView,
  detailsCard,
  initialViewState,
  layers,
  isLoading = false,
  error = null,
  mapStyle = "mapbox://styles/mapbox/light-v11",
}: ScenarioTemplateProps) {
  const [isInfoOpen, setInfoOpen] = useState<boolean>(false);
  useEffect(() => {
    // window.dispatchEvent(new Event("resize"));
  }, [isInfoOpen]);
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="mb-4 mt-4 flex flex-col gap-8 p-4">
        <div className="mx-auto max-w-4xl text-center">
          <H2>{title}</H2>
          <P className="text-muted-foreground">{description}</P>
        </div>

        {(statsCard || isLoading || error) && (
          <Card className="mx-auto max-w-2xl p-6">
            {error ? (
              <Lead>{error}</Lead>
            ) : isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <Lead>{statsCard}</Lead>
            )}
          </Card>
        )}

        {filters && <Card className="mx-auto max-w-2xl p-6">{filters}</Card>}
      </div>

      {/* DeckGL & InfoArea */}
      <div className="flex h-screen flex-col md:flex-row">
        <div
          className={`duration-600 overflow-hidden transition-all ease-in ${isInfoOpen ? "w-full md:w-64" : "h-0 w-0 md:h-64"}`}
        >
          {detailsCard}
        </div>
        <div className="relative flex-1 overflow-hidden rounded-lg">
          <DeckGL
            initialViewState={initialViewState}
            layers={layers}
            controller={true}
            // style={style}
            onClick={(info) => {
              if (!info.object) {
                setInfoOpen(false);
              } else {
                setInfoOpen(true);
              }
            }}
          >
            <Map
              mapStyle={mapStyle}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              projection={{ name: "mercator" }}
            />
            {mapView}
          </DeckGL>
        </div>
      </div>
    </div>
  );
}
