"use client";

import BaseUI from "components/baseui/BaseUI";
import { ScatterplotLayer } from "deck.gl";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import { useMemo } from "react";

export default function TopicIntelligenceScenario() {
  const layer = useMemo(() => {
    return new ScatterplotLayer({
      ...baseLayerProps,
      id: "scatter-collabs",
      data: [],
      getFillColor: [255, 140, 0],
      getPosition: () => [0, 0],
    });
  }, []);

  return (
    <>
      <BaseUI
        layers={[layer]}
        viewState={INITIAL_VIEW_STATE_TILTED_EU}
        titleContent={<p>WIP: Topic Intelligence</p>}
        infoBoxContent={null}
        scenarioName="topic-intelligence"
        scenarioTitle="Topic Intelligence"
        error={null}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <p className="text-gray-600">Sorry this is not finished yet</p>
        </div>
      </div>
    </>
  );
}
