"use client";

import { ArcLayer, ColumnLayer } from "@deck.gl/layers";
import BaseUI from "components/baseui/BaseUI";
import RightSideMenu from "components/baseui/RightSideMenu";
import { useSettings } from "context/SettingsContext";
import { PickingInfo } from "deck.gl";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import { useCollaborationView } from "hooks/queries/collaboration/useCollaborationView";
import { useCollaboratorsById } from "hooks/queries/collaboration/useCollaboratorsById";
import { useInstitutionById } from "hooks/queries/institution/useInstitutionById";
import { ReactNode, useCallback, useMemo, useState } from "react";

export default function CollaborationScenario() {
  const { isGlobe } = useSettings();
  const COLOR_GAMMA = 0.7;
  const MAX_HEIGHT = isGlobe ? 4_000_000 : 1_000_000;
  const BAR_RADIUS = isGlobe ? 3_000 : 2_200;

  /** Selected Institution */
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);
  const [selectedInstitutionLocation, setSelectedInstitutionLocation] =
    useState<number[] | null>(null);

  /** Main Data */
  const { data: collaborationView, isPending, error } = useCollaborationView();

  /** Selected Institution Details */
  const { data: selectedInstitution, isPending: isPendingInstitution } =
    useInstitutionById(selectedInstitutionId || "", {
      enabled: !!selectedInstitutionId,
    });

  /** Collaborators Data */
  const { data: collaborators, isPending: isPendingCollaborators } =
    useCollaboratorsById(selectedInstitutionId || "", {
      enabled: !!selectedInstitutionId,
    });

  /** Hover State */
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    weight: number;
    object: any;
  } | null>(null);

  /** Calculations */
  const MAX_COLLAB_WEIGHT = useMemo(() => {
    if (!collaborationView) return 0;
    return Math.max(...collaborationView.map((d) => d.collaboration_weight));
  }, [collaborationView]);

  /** Arc Data for Collaborations */
  const partnersArcData = useMemo(() => {
    if (
      !selectedInstitutionLocation ||
      !collaborators ||
      !Array.isArray(collaborators)
    ) {
      return [];
    }

    return collaborators.map((partner) => ({
      sourcePosition: selectedInstitutionLocation,
      targetPosition: [partner.geolocation[0], partner.geolocation[1]],
      partner: partner,
    }));
  }, [selectedInstitutionLocation, collaborators]);

  /** Event Handlers */
  const handleMapOnClick = useCallback((info: any) => {
    const { object } = info;
    if (object && object.institution_id) {
      setSelectedInstitutionId(object.institution_id);
      setSelectedInstitutionLocation([
        object.geolocation[0],
        object.geolocation[1],
      ]);
    }
  }, []);

  const handleEmptyMapClick = useCallback(() => {
    setSelectedInstitutionId(null);
    setSelectedInstitutionLocation(null);
  }, []);

  const handleHover = useCallback((info: PickingInfo) => {
    if (info.object) {
      setHoverInfo({
        x: info.x,
        y: info.y,
        weight: info.object.collaboration_weight,
        object: info.object,
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

  /** Layers */
  const columnLayer = useMemo(() => {
    return new ColumnLayer({
      ...baseLayerProps,
      id: "collaboration-columns",
      data: collaborationView || [],
      diskResolution: 32,
      radius: BAR_RADIUS,
      getPosition: (d) => [d.geolocation[0], d.geolocation[1]],
      getElevation: (d) => {
        return (d.collaboration_weight / MAX_COLLAB_WEIGHT) * MAX_HEIGHT;
      },
      getFillColor: (d) => {
        const normalizedFunding = d.collaboration_weight / MAX_COLLAB_WEIGHT;
        const adjustedValue = Math.pow(normalizedFunding, COLOR_GAMMA);
        return [
          50 + (255 - 50) * adjustedValue,
          50 - 50 * adjustedValue,
          50 - 50 * adjustedValue,
          200,
        ];
      },
      pickable: true,
      autoHighlight: true,
      extruded: true,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51],
      },
      onClick: handleMapOnClick,
      onHover: handleHover,
      updateTriggers: {
        getPosition: collaborationView,
        getElevation: [collaborationView, MAX_COLLAB_WEIGHT],
        getFillColor: [collaborationView, MAX_COLLAB_WEIGHT],
      },
    });
  }, [
    collaborationView,
    MAX_COLLAB_WEIGHT,
    BAR_RADIUS,
    MAX_HEIGHT,
    handleMapOnClick,
    handleHover,
  ]);

  const arcLayer = useMemo(() => {
    return new ArcLayer({
      id: "collaboration-arcs",
      data: partnersArcData,
      pickable: true,
      getSourcePosition: (d) => d.sourcePosition,
      getTargetPosition: (d) => d.targetPosition,
      getSourceColor: [255, 165, 0, 180],
      getTargetColor: [0, 255, 255, 180],
      getWidth: 2,
      widthScale: 2,
      widthMinPixels: 2,
      updateTriggers: {
        getSourcePosition: partnersArcData,
        getTargetPosition: partnersArcData,
      },
    });
  }, [partnersArcData]);

  /** Right Side Menu */
  const rightPanelTabs: { id: string; label: string; content: ReactNode }[] =
    [];

  // if (selectedInstitution) {
  //   rightPanelTabs.push({
  //     id: "institution-details",
  //     label: "Details",
  //     content: (
  //       <div>
  //         <InstitutionInfoPanel institution={selectedInstitution} />
  //         {collaborators && collaborators.length > 0 ? (
  //           <>
  //             <H3 className="p-2 text-center">
  //               {collaborators.length} Collaboration Partners
  //             </H3>
  //             {collaborators.slice(0, 10).map((partner) => (
  //               <div key={partner.institution_id} className="border-b p-2">
  //                 <p className="text-sm font-medium">{partner.country}</p>
  //                 <p className="text-xs text-gray-600">
  //                   Institution ID: {partner.institution_id}
  //                 </p>
  //               </div>
  //             ))}
  //             {collaborators.length > 10 && (
  //               <p className="p-2 text-sm text-gray-500">
  //                 ... and {collaborators.length - 10} more partners
  //               </p>
  //             )}
  //           </>
  //         ) : (
  //           <H3 className="p-2 text-center">No collaboration partners found</H3>
  //         )}
  //       </div>
  //     ),
  //   });
  // }

  const { panel, togglePanel } = RightSideMenu({ rightPanelTabs });

  /** Title Content */
  const titleContent = (
    <div className="space-y-2">
      <p>
        Displaying{" "}
        <span className="font-semibold text-orange-400">
          {collaborationView?.length.toLocaleString() || 0}
        </span>{" "}
        Institutions
        {partnersArcData.length > 0 && (
          <>
            {" "}
            with{" "}
            <span className="font-semibold text-orange-400">
              {partnersArcData.length}
            </span>{" "}
            connections
          </>
        )}
      </p>
    </div>
  );

  /** Info Box Content */
  const infoBoxContent = (
    <div className="space-y-2">
      <p className="text-sm">
        This scenario shows institutions as bars, with height indicating the
        total number of unique project partners.
      </p>
      <p className="text-sm">
        Click on an institution to view its collaboration network.
      </p>
    </div>
  );

  /** Hover Tooltip */
  const hoverTooltip = hoverInfo && (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        left: hoverInfo.x,
        top: hoverInfo.y,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "#fff",
        padding: "8px",
        borderRadius: "4px",
        transform: "translate(-50%, -100%)",
        marginTop: "-15px",
        zIndex: 1000,
      }}
    >
      <div>Total Collaborators: {hoverInfo.weight}</div>
    </div>
  );

  return (
    <>
      <BaseUI
        layers={[columnLayer, arcLayer]}
        viewState={INITIAL_VIEW_STATE_TILTED_EU}
        titleContent={titleContent}
        infoBoxContent={infoBoxContent}
        rightSideMenu={panel}
        toggleRightSideMenu={() => togglePanel("institution-details")}
        onEmptyMapClick={handleEmptyMapClick}
        loading={isPending}
        error={error}
      />
      {hoverTooltip}
    </>
  );
}
