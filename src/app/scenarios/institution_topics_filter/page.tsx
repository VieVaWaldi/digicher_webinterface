"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import Map from "react-map-gl";
import { ScatterplotLayer } from "deck.gl";
import { INITIAL_VIEW_STATE_EU } from "core/components/deckgl/viewports";
import Header from "core/components/navigation/Header";
import { useInstitutionTopics } from "core/hooks/queries/useInstitutionTopics";
import FilterMenu, { CATEGORY_COLORS } from "core/components/shadcn/FilterMenu";
import InstitutionCard from "core/components/shadcn/cards/InstitutionCard";
import { useInstitutionById } from "core/hooks/queries/useInstitutionById";

interface InstitutionTopics {
  institution_id: number;
  institution_name: string;
  address_geolocation: number[];
  topic: string[];
}

export default function InstitutionTopicsFilterMap() {
  const { data: institutionTopics, error: institutionTopicsError } =
    useInstitutionTopics();
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [eurosciVocLookup, setEurosciVocLookup] = useState<
    Record<string, string>
  >({});
  const [uniqueMainCodes, setUniqueMainCodes] = useState<
    { id: string; label: string }[]
  >([]);
  const [selectedSecondaryCodes, setSelectedSecondaryCodes] = useState<
    string[]
  >([]);
  const [uniqueSecondaryCodes, setUniqueSecondaryCodes] = useState<
    { id: string; label: string }[]
  >([]);
  const [popupInfo, setPopupInfo] = useState<{
    institutionId: number;
    x: number;
    y: number;
  } | null>(null);
  const { data: institution, error: institutionError } = useInstitutionById(
    popupInfo?.institutionId ?? -1
  );

  useEffect(() => {
    fetch("/rmme/euroscivoc_lookup.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEurosciVocLookup(data);
      })
      .catch((error) => {
        console.error("Error loading lookup:", error);
      });
  }, []);

  // Helper function to extract primary code from a topic path
  const getPrimaryCode = (path: string): string => {
    const codes = path.split("/").filter(Boolean);
    return codes[0] || "";
  };

  // Helper function to extract all secondary codes from a topic path
  const getSecondaryCodes = (path: string): string[] => {
    const codes = path.split("/").filter(Boolean);
    return codes.slice(1); // Return all codes after the primary code
  };

  // Helper function to get the main category color for an institution
  const getInstitutionColor = (
    institution: InstitutionTopics
  ): [number, number, number] => {
    const relevantPaths =
      selectedCodes.length > 0
        ? institution.topic.filter((path) =>
            selectedCodes.includes(getPrimaryCode(path))
          )
        : institution.topic;

    if (relevantPaths.length > 0) {
      const primaryCode = getPrimaryCode(relevantPaths[0]);
      const label = eurosciVocLookup[primaryCode]?.toLowerCase();
      if (label && CATEGORY_COLORS[label]) {
        return CATEGORY_COLORS[label];
      }
    }
    return [128, 128, 128];
  };

  useEffect(() => {
    if (!institutionTopics || !eurosciVocLookup) return;

    const mainCodes = new Set<string>();
    const secondaryCodes = new Set<string>();

    institutionTopics.forEach((institution) => {
      institution.topic.forEach((topicPath) => {
        const primaryCode = getPrimaryCode(topicPath);
        const secondaryCodesArray = getSecondaryCodes(topicPath);

        if (primaryCode) mainCodes.add(primaryCode);
        secondaryCodesArray.forEach((code) => {
          if (code) secondaryCodes.add(code);
        });
      });
    });

    const sortedMainCodes = Array.from(mainCodes)
      .map((code) => ({
        id: code,
        label: eurosciVocLookup[code] || code,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const sortedSecondaryCodes = Array.from(secondaryCodes)
      .map((code) => ({
        id: code,
        label: eurosciVocLookup[code] || code,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    setUniqueMainCodes(sortedMainCodes);
    setUniqueSecondaryCodes(sortedSecondaryCodes);
  }, [institutionTopics, eurosciVocLookup]);

  const filteredInstitutions = institutionTopics?.filter((institution) => {
    const matchesPrimary =
      selectedCodes.length === 0 ||
      institution.topic.some((topicPath) => {
        const primaryCode = getPrimaryCode(topicPath);
        return selectedCodes.includes(primaryCode);
      });

    const matchesSecondary =
      selectedSecondaryCodes.length === 0 ||
      institution.topic.some((topicPath) => {
        const secondaryCodes = getSecondaryCodes(topicPath);
        return secondaryCodes.some((code) =>
          selectedSecondaryCodes.includes(code)
        );
      });

    return matchesPrimary && matchesSecondary;
  });

  const layer = new ScatterplotLayer({
    id: "institutions-topics",
    data: filteredInstitutions || [],
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 3,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getPosition: (d) => [d.address_geolocation[1], d.address_geolocation[0]],
    getFillColor: (d) => getInstitutionColor(d),
    getRadius: 100,
    onClick: (info) => {
      if (info.object) {
        console.log(info.object);
        setPopupInfo({
          institutionId: info.object.institution_id,
          x: info.x,
          y: info.y,
        });
      } else {
        setPopupInfo(null);
      }
    },
  });

  return (
    <div className="flex flex-col h-screen">
      <Header showBackButton={true} />
      <div className="p-4 bg-white">
        <h1 className="text-2xl font-bold mb-2">
          Scenario | Institutions Topics Filter
        </h1>
        <p className="mb-4">
          Filter institutions by topics. Sorry but you have to use{" "}
          <b>CTRL + F</b> to search for the topic, eg digital humanities. BUG:
          The chosen color when no colors or a 2nd topic are selected is just
          the first topic the institution has. Also the topics are given to
          these institutions by all the projects they have partaked in and those
          projects EuroSciVoc topic.
        </p>
      </div>
      <main className="flex flex-1 overflow-hidden">
        <FilterMenu
          codes={uniqueMainCodes}
          secondaryCodes={uniqueSecondaryCodes}
          onFilterChange={setSelectedCodes}
          onSecondaryFilterChange={setSelectedSecondaryCodes}
          visibleInstitutionsCount={filteredInstitutions?.length || 0}
          totalInstitutionsCount={institutionTopics?.length || 0}
        />
        <div className="flex-1 relative">
          <DeckGL
            initialViewState={INITIAL_VIEW_STATE_EU}
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
              mapStyle="mapbox://styles/mapbox/light-v11"
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              projection={{ name: "mercator" }}
            />

            {popupInfo && institution && (
              <div
                className="absolute z-10"
                style={{
                  left: popupInfo.x,
                  top: popupInfo.y,
                  transform: "translate(-50%, -100%)",
                  marginTop: "-10px",
                }}
              >
                <InstitutionCard institution={institution} />
              </div>
            )}
          </DeckGL>
        </div>
      </main>
    </div>
  );
}
