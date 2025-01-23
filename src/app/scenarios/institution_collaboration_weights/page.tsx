"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import "@deck.gl/widgets/stylesheet.css";

import React, { useState } from "react";
import DeckGL from "@deck.gl/react";
import Map from "react-map-gl";
import { ColumnLayer, ArcLayer } from "@deck.gl/layers";
import { FullscreenWidget } from "@deck.gl/widgets";

import Header from "core/components/navigation/Header";
import { INITIAL_VIEW_STATE_TILTED_EU } from "core/components/deckgl/viewports";
import { useInstitutionCollaborationWeights } from "core/hooks/queries/useInstitutionCollaborationWeights";
import { useInstitutionCollaboratorsById } from "core/hooks/queries/useInstitutionCollaboratorsById";
import { InstitutionCollaborationWeights } from "datamodel/institution/types";

export default function InstitutionCollaborationWeightsMap() {
  const [selectedInstitutionId, setSelectedInstitutionId] =
    useState<number>(-1);
  const [selectedInstitutionLocation, setSelectedInstitutionLocation] =
    useState<number[] | null>(null);

  const {
    data: institutionCollaborationWeights,
    error: institutionCollaborationWeightsError,
  } = useInstitutionCollaborationWeights();

  const { data: institutionCollaborators, error: collaboratorsError } =
    useInstitutionCollaboratorsById(selectedInstitutionId);

  // Get the maximum collaboration weight for scaling
  const maxCollabWeight = React.useMemo(() => {
    if (!institutionCollaborationWeights) return 0;
    return Math.max(
      ...institutionCollaborationWeights.map((d) => d.collaboration_weight)
    );
  }, [institutionCollaborationWeights]);

  const columnLayer = new ColumnLayer<InstitutionCollaborationWeights>({
    id: "institutions-collaboration-weight",
    data: institutionCollaborationWeights || [],
    diskResolution: 12,
    radius: 1500,

    getPosition: (d) => [d.address_geolocation[1], d.address_geolocation[0]],

    getElevation: (d) => {
      const MAX_HEIGHT = 200000;
      return (d.collaboration_weight / maxCollabWeight) * MAX_HEIGHT;
    },

    getFillColor: (d) => {
      const normalizedWeight = d.collaboration_weight / maxCollabWeight;
      return [
        255, // Red stays at 255
        255 * (1 - normalizedWeight), // Green decreases with funding
        255 * (1 - normalizedWeight), // Blue decreases with funding
        200, // Alpha
      ];
    },

    pickable: true,
    autoHighlight: true,
    extruded: true,
    material: {
      ambient: 0.64,
      diffuse: 0.8,
      shininess: 32,
      specularColor: [51, 51, 51],
    },

    onClick: (info) => {
      const { object } = info;
      if (object) {
        setSelectedInstitutionId(object.institution_id);
        setSelectedInstitutionLocation([
          object.address_geolocation[1],
          object.address_geolocation[0],
        ]);
      } else {
        setSelectedInstitutionId(-1);
        setSelectedInstitutionLocation(null);
      }
    },
  });

  // Prepare arc layer data
  const arcData = React.useMemo(() => {
    if (
      !selectedInstitutionLocation ||
      !institutionCollaborators ||
      !Array.isArray(institutionCollaborators)
    ) {
      return [];
    }

    return institutionCollaborators.map((collaborator) => ({
      sourcePosition: selectedInstitutionLocation,
      targetPosition: [
        collaborator.collaborator_location[1],
        collaborator.collaborator_location[0],
      ],
      collaborator: collaborator,
    }));
  }, [selectedInstitutionLocation, institutionCollaborators]);

  // Create arc layer for collaborations
  const arcLayer = new ArcLayer({
    id: "collaboration-arcs",
    data: arcData,
    pickable: true,
    getSourcePosition: (d) => d.sourcePosition,
    getTargetPosition: (d) => d.targetPosition,
    getSourceColor: [255, 165, 0, 180],
    getTargetColor: [0, 255, 255, 180],
    getWidth: 2,
    widthScale: 2,
    widthMinPixels: 2,
  });

  if (institutionCollaborationWeightsError) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header showBackButton={true} />
      <div className="p-4 bg-white">
        <h1 className="text-2xl font-bold mb-2">
          Institution Collaboration Network
        </h1>
        <p className="mb-4">
          Displaying collaboration intensity across{" "}
          {institutionCollaborationWeights?.length || 0} institutions. Click on
          any institution to see its collaboration network.
          {collaboratorsError && (
            <span className="text-red-500 ml-2">
              Error loading collaborators
            </span>
          )}
        </p>
      </div>
      <main className="flex-1 relative">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE_TILTED_EU}
          layers={[columnLayer, arcLayer]}
          controller={true}
          getTooltip={({ object }) => {
            if (!object) return null;

            if ("collaborator" in object) {
              return {
                html: `
                  <div>
                    <b>${object.collaborator.collaborator_name}</b><br/>
                    Collaborating Institution
                  </div>
                `,
              };
            }

            return {
              html: `
                <div>
                  <b>${object.institution_name}</b><br/>
                  Number of Collaborators: ${object.collaboration_weight}
                </div>
              `,
            };
          }}
          widgets={[
            new FullscreenWidget({
              id: "fullscreen",
              placement: "bottom-right",
            }),
          ]}
        >
          <Map
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            projection={{ name: "mercator" }}
          />
        </DeckGL>
      </main>
    </div>
  );
}
