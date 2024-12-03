"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import React, { useState } from "react";
import Map from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import { ScatterplotLayer } from "deck.gl";
import { INITIAL_VIEW_STATE_EU_GLOBE } from "components/deckgl/viewports";

import Header from "components/Header";
import TimeSlider from "components/ui/TimeSlider";
import { useProjectCoordinators } from "hooks/queries/useProjectCoordinators";
import { useProjectById } from "hooks/queries/useProjectById";
import ProjectCard from "components/ui/cards/ProjectCard";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function ScenarioMap() {
  const [selectedYear, setSelectedYear] = useState(2014);
  const [popupInfo, setPopupInfo] = useState<{
    projectId: number;
    x: number;
    y: number;
  } | null>(null);
  const { projectCoordinators, error: coordinatorsError } =
    useProjectCoordinators(selectedYear);
  const { project, error: projectError } = useProjectById(
    popupInfo?.projectId ?? -1
  );

  const layer = new ScatterplotLayer({
    id: "projectCoordinators",
    data: projectCoordinators,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 8,
    radiusMaxPixels: 12,
    lineWidthMinPixels: 1,
    getFillColor: [255, 140, 0],
    getRadius: 6,
    antialiasing: true,
    getPosition: (d) => [d.coordinator_location[1], d.coordinator_location[0]],
    onClick: (info) => {
      if (info.object) {
        setPopupInfo({
          projectId: info.object.project_id,
          x: info.x,
          y: info.y,
        });
      } else {
        setPopupInfo(null);
      }
    },
    parameters: {
      depthTest: false,
      depthMask: true,
    },
  });

  return (
    <div className="flex flex-col h-screen">
      <Header showBackButton={true} />
      <div className="p-4 bg-white">
        <h1 className="text-2xl font-bold mb-2">
          Scenario | Projects Coordinator Globe
        </h1>
        <p className="mb-4">
          Displays the coordinators of each project given a year. Click on a
          project to get more information. BUG: projects are hovering where the
          ISS should be, hope i ll fix that soon.
        </p>
      </div>
      <main className="flex-1 relative">
        <DeckGL
          views={new GlobeView()}
          initialViewState={INITIAL_VIEW_STATE_EU_GLOBE}
          layers={[layer]}
          controller={true}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          onClick={(info) => {
            if (!info.picked) {
              setPopupInfo(null);
            }
          }}
        >
          <Map
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          />
        </DeckGL>

        {popupInfo && project && (
          <div
            className="absolute z-10"
            style={{
              left: popupInfo.x,
              top: popupInfo.y,
              transform: "translate(-50%, -100%)",
              marginTop: "-10px",
            }}
          >
            <ProjectCard project={project} />
          </div>
        )}

        <TimeSlider year={selectedYear} onChange={setSelectedYear} />
      </main>
    </div>
  );
}
