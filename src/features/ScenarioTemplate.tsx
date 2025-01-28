import React, { ReactNode } from "react";
import DeckGL from "@deck.gl/react";
import Map, { ViewState } from "react-map-gl";
import { Layer } from "@deck.gl/core";
import { Loader2 } from "lucide-react";
import { H2, Lead, P } from "core/components/shadcn/typography";
import { Card } from "core/components/shadcn/card";

interface ScenarioTemplateProps {
  title: string;
  description: string;
  statsCard?: ReactNode;
  filters?: ReactNode;
  mapView?: ReactNode;
  detailsCard?: ReactNode;
  initialViewState: ViewState;
  layers: Layer[];
  isLoading?: boolean;
  error?: string | null;
  onMapClick?: (info: {
    object: unknown;
    x: number;
    y: number;
    picked: boolean;
  }) => void;
  mapStyle?: string;
}

export default function ScenarioTemplate({
  title,
  description,
  statsCard,
  filters,
  mapView,
  detailsCard,
  initialViewState,
  layers,
  isLoading = false,
  error = null,
  onMapClick,
  mapStyle = "mapbox://styles/mapbox/light-v11",
}: ScenarioTemplateProps) {
  const style = {
    // margin: "100px",
  };
  return (
    <div className="flex h-screen flex-col">
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

      <main className="relative flex-1 p-4">
        <h1>hi</h1>
        <div>
          <DeckGL
            initialViewState={initialViewState}
            layers={layers}
            controller={true}
            style={style}
            // onClick={onMapClick}
          >
            <Map
              mapStyle={mapStyle}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              projection={{ name: "mercator" }}
            />
            {mapView}
          </DeckGL>
        </div>
      </main>
    </div>
  );
}
