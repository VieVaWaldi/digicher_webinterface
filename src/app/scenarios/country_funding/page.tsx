"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Globe2, Home, InfoIcon, X } from "lucide-react";
import { SolidPolygonLayer } from "@deck.gl/layers";
import { Button } from "shadcn/button";
import { useRouter } from "next/navigation";
import {
  ProcessedCountry,
  useCountryGeoData,
} from "core/hooks/queries/countrygeodata/useCountryGeoData";
import BaseDeckGLMap from "components/scenarios/BaseDeckGLMap";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import { useFundingInstitutionPoints } from "core/hooks/queries/scenario_points/useFundingInstitutionPoints";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "shadcn/sheet";
import SettingsMenu from "components/menus/SettingsMenu";
import {
  FundingInstitutionPoint,
  InstitutionProjectsFunding,
} from "datamodel/scenario_points/types";
import { Slider } from "shadcn/slider";
import { H2, H4, H5 } from "shadcn/typography";
import useTransformInstitutionsWithProjects from "core/hooks/transform/useTransformationInstitutionsWithProjects";
import { useProjectsByKeywords } from "core/hooks/queries/project/useProjectsByKeywords";
import useDomainFilterSimple from "components/menus/filter/DomainFilter";
import TopicRankingPanel, {
  TopicFundingByYear,
} from "components/menus/TopicPanel";

export default function CountryFunding() {
  const [year, setYear] = useState(2024);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    countryName: "",
    funding: 0,
  });

  const router = useRouter();
  const maxFundingAllRef = useRef<number>(1);
  const MAX_ELEVATION = 5000000;

  // --- Data ------------------------------------------------------------------------------- //

  const { data: countryGeoData } = useCountryGeoData();

  const {
    data: tmpData,
    loading: isLoading,
    error,
  } = useFundingInstitutionPoints();

  const fundingInstitutionPoints = useMemo(() => {
    return tmpData?.filter((i) => {
      const filteredProjects = i.projects_funding.filter(
        (p) =>
          p !== null &&
          p.start_date &&
          new Date(p.start_date).getFullYear() > 2014,
      );

      return filteredProjects.length > 0;
    });
  }, [tmpData]);
  const { data: transformedInstitutionPoints } =
    useTransformInstitutionsWithProjects(fundingInstitutionPoints);

  const dataInstitutionPoints =
    transformedInstitutionPoints ?? fundingInstitutionPoints;

  // --- Filter ----------------------------------------------------------------------------- //

  const { DomainFilter, filterPredicate: filterDomainPredicate } =
    useDomainFilterSimple({
      useSearchHook: useProjectsByKeywords,
      idField: "project_id",
      idPredicate: "project_id",
    });

  const filteredAllInstitutions = dataInstitutionPoints?.map((institution) => {
    const filteredProjects = institution.projects_funding.filter((project) =>
      filterDomainPredicate(project),
    );
    return {
      ...institution,
      projects_funding: filteredProjects,
    } as FundingInstitutionPoint;
  });

  // --- Reduce Funding ----------------------------------------------------------------------------- //

  // ALSO REDUCE THE TOPICS
  // MORE ISSUE TO NOTE: what topic level, not all projects with topics
  // THIS IS PARTIAL FUNDING FROM PROJECT TO TOPIC ... so good? what about summing funding per topic ...
  // okay, but the ec gave funding to the project with these topics, so only issue is counting same money for different topics in one project

  const reduceFundingInstitutionPoints = (
    points: FundingInstitutionPoint[] | undefined,
    useYear: boolean,
  ): Record<string, number> => {
    if (!points || !Array.isArray(points)) return {};

    return points.reduce<Record<string, number>>((acc, inst) => {
      const countryCode = inst?.country_code;
      if (!countryCode) return acc;

      acc[countryCode] =
        (acc[countryCode] || 0) +
        (inst.projects_funding || []).reduce(
          (sum: number, p: InstitutionProjectsFunding) => {
            // If we're not filtering by year, include all projects with contributions
            if (!useYear) {
              return sum + (p.ec_contribution || p.net_ec_contribution || 0);
            }

            // If we are filtering by year, only include projects with matching year
            if (!p.start_date) {
              return sum;
            }
            const projectStartYear = new Date(p.start_date).getFullYear();
            return (
              sum +
              (projectStartYear === year
                ? p.ec_contribution || p.net_ec_contribution || 0
                : 0)
            );
          },
          0,
        );

      return acc;
    }, {});
  };

  const countryFundingMap = reduceFundingInstitutionPoints(
    filteredAllInstitutions,
    true,
  );

  // Calculate maxFundingAll only once when data is first loaded
  useEffect(() => {
    if (fundingInstitutionPoints && fundingInstitutionPoints.length > 0) {
      // Only calculate this once when we get the initial, unfiltered data
      const initialCountryFundingMapWithoutYear =
        reduceFundingInstitutionPoints(fundingInstitutionPoints, false);

      if (Object.values(initialCountryFundingMapWithoutYear).length > 0) {
        maxFundingAllRef.current = Math.max(
          ...(Object.values(initialCountryFundingMapWithoutYear) as number[]),
        );
      }
    }
  });

  const getFundingForCountry = (countryCode: string) => {
    if (countryFundingMap[countryCode]) {
      return countryFundingMap[countryCode];
    }
    return 0;
  };

  const countriesWithFunding =
    countryGeoData?.filter(
      (country) => getFundingForCountry(country.countryCode) > 0,
    ) || [];

  // --- Reduce Topics ----------------------------------------------------------------------------- //

  const reduceTopicFundingByYear = (
    points: FundingInstitutionPoint[] | undefined,
  ): TopicFundingByYear => {
    if (!points || !Array.isArray(points)) return {};

    const result: TopicFundingByYear = {};

    points.forEach((institution) => {
      if (
        !institution.projects_funding ||
        !Array.isArray(institution.projects_funding)
      ) {
        return;
      }

      institution.projects_funding.forEach((project) => {
        if (!project.start_date) return;
        const projectStartDate = new Date(project.start_date);
        const projectYear = projectStartDate.getFullYear();
        if (projectYear < 2015) return;

        if (!result[projectYear]) {
          result[projectYear] = {
            level1: {},
            level2: {},
            level3p: {},
          };
        }

        const funding =
          project.ec_contribution || project.net_ec_contribution || 0;
        if (funding <= 0) return;

        if (project.topics && Array.isArray(project.topics)) {
          project.topics.forEach((topic) => {
            if (topic.level === 1) {
              const topicName = topic.name;
              result[projectYear].level1[topicName] =
                (result[projectYear].level1[topicName] || 0) + funding;
            } else if (topic.level === 2) {
              // Handle level 2 topics
              const topicName = topic.name;
              result[projectYear].level2[topicName] =
                (result[projectYear].level2[topicName] || 0) + funding;
            } else if (topic.level >= 3) {
              // Handle level 3 topics
              const topicName = topic.name;
              result[projectYear].level3p[topicName] =
                (result[projectYear].level3p[topicName] || 0) + funding;
            }
          });
        }
      });
    });

    return result;
  };

  // Calculate topic funding breakdown
  const topicFundingByYear = reduceTopicFundingByYear(filteredAllInstitutions);

  // --- HELPER ----------------------------------------------------------------------------- //

  // For current year filtered view, recalculate max on each render
  const maxFunding =
    Object.values(countryFundingMap).length > 0
      ? Math.max(...(Object.values(countryFundingMap) as number[]))
      : 1;

  const getColorForValue = (value: number): [number, number, number] => {
    const normalized = maxFunding ? value / maxFunding : 0;
    return [
      Math.floor(normalized * 255),
      Math.floor(100 + normalized * 50),
      Math.floor(255 - normalized * 255),
    ];
  };

  const formatEuro = (value: number): string => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTotalFundingForYear = (
    countryFundingMap: Record<string, number>,
  ): number => {
    return Object.values(countryFundingMap).length > 0
      ? Object.values(countryFundingMap).reduce((sum, value) => sum + value, 0)
      : 0;
  };
  // --- LAYER ----------------------------------------------------------------------------- //

  const layers =
    countriesWithFunding.length > 0
      ? [
          new SolidPolygonLayer({
            id: "countries-layer",
            data: countriesWithFunding,
            extruded: true,
            wireframe: true,
            getPolygon: (d: ProcessedCountry) => {
              return d.polygon;
            },
            getElevation: (d: ProcessedCountry) => {
              const value = getFundingForCountry(d.countryCode) || 0;
              // Use maxFundingAllRef.current instead of recalculating maxFundingAll
              return (value / maxFundingAllRef.current) * MAX_ELEVATION;
            },
            getFillColor: (d: ProcessedCountry) => {
              const value = getFundingForCountry(d.countryCode) || 0;
              return getColorForValue(value);
            },
            getLineColor: [80, 80, 80],
            pickable: true,
            onClick: (info) => {
              if (info.object) {
                const country = info.object as ProcessedCountry;
                const funding = getFundingForCountry(country.countryCode);
                setTooltip({
                  visible: true,
                  x: info.x,
                  y: info.y,
                  countryName: country.name,
                  funding: funding,
                });
              }
            },
          }),
        ]
      : [];

  // --- REACT ----------------------------------------------------------------------------- //

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading map data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        Error loading map: {error}
      </div>
    );
  }

  const CSS_BUTTON = "h-10 w-10 rounded-xl bg-white text-orange-500";
  const STRK_WDTH = 2.2;

  const HomeButton = () => {
    return (
      <Button
        variant="secondary"
        className={CSS_BUTTON}
        onClick={() => router.push("/")}
      >
        <Home strokeWidth={STRK_WDTH} style={{ transform: "scale(1.4)" }} />
      </Button>
    );
  };

  const GlobeButton = () => {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" className={CSS_BUTTON}>
            <Globe2
              strokeWidth={STRK_WDTH}
              style={{ transform: "scale(1.4)" }}
            />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Settings</SheetTitle>
          <SettingsMenu />
        </SheetContent>
      </Sheet>
    );
  };

  const InfoBox = () => {
    if (!showInfoBox) return null;

    return (
      <div
        className="absolute inset-0 z-20 flex items-center justify-center"
        onClick={() => setShowInfoBox(false)}
      >
        <div className="relative max-h-[80vh] w-11/12 max-w-2xl overflow-y-auto rounded-xl bg-white/60 p-6 backdrop-blur-md">
          <div className="flex flex-row justify-between">
            <H2 className="text-xl font-semibold text-gray-800">
              About This Visualization
            </H2>
            <button
              className="-mt-3 mb-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowInfoBox(false)}
            >
              <X className="text-gray-500" />
            </button>
          </div>
          <div className="mb-4 h-px w-full bg-gray-300" />

          <div className="space-y-4 text-gray-700">
            <section>
              <h3 className="font-semibold text-gray-800">Data Source</h3>
              <p>
                All displayed data is sourced from CORDIS (Community Research
                and Development Information Service). The main unit of analysis
                is research institutions with their associated funded projects.
              </p>
              <p>
                Each country is extruded based on the total funding received by
                all institutions in that country for projects in the selected
                year.
              </p>
              <p>
                To see the <b> individual projects and institutions </b> please
                refer to
                <a
                  href="/scenarios/funding"
                  className="ml-1 text-orange-600 hover:underline"
                >
                  the Funding Scenario
                </a>
                , which uses the same data.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800">
                Topic Classification
              </h3>
              <p>
                Each project in Cordis is classified using EuroSciVoc topics
                which has a 6 level hierarchy. The Top Right Trend Tab maps them
                in the following way:
              </p>
              <ul className="ml-6 list-disc">
                <li>Level 2: Field</li>
                <li>Level 3: Subfield</li>
                <li>Levels 4-6: Specific topics</li>
              </ul>
              <p>
                Learn more about EuroSciVoc:
                <a
                  href="https://op.europa.eu/en/web/eu-vocabularies/concept-scheme/-/resource?uri=http://data.europa.eu/8mn/euroscivoc/40c0f173-baa3-48a3-9fe6-d6e8fb366a00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-orange-600 hover:underline"
                >
                  European Science Vocabulary
                </a>
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800">
                Topic Funding Calculation
              </h3>
              <p>
                The funding amounts shown in the Topic Trends panel are based
                on:
              </p>
              <ul className="ml-6 list-disc">
                <li>
                  Total EC contribution to projects associated with each topic
                </li>
                <li>
                  When projects have multiple topics, the full funding amount is
                  attributed to each topic
                </li>
              </ul>
              <p className="text-sm italic">
                Note: This approach provides a broad view of EC funding
                priorities but may overrepresent funding for topics in
                multi-topic projects.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800">Field Filters</h3>
              <p>
                The field filter at the bottom applies keyword-based criteria:
              </p>
              <ul className="ml-6 list-disc">
                <li>
                  <strong>All:</strong> Base data, all projects matching
                  &quot;(cultural OR heritage)&quot;
                </li>
                <li>
                  <strong>Cultural Heritage:</strong> Projects with
                  &quot;(cultural AND heritage)&quot; in title or objective
                </li>
                <li>
                  <strong>Digital Heritage:</strong> Projects with
                  &quot;(digital AND heritage)&quot; in title or objective
                </li>
              </ul>
              <p className="text-sm italic">
                Note: These filters provide an approximation of field-specific
                projects based on keyword matching.
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const InfoButton = () => {
    return (
      <Button
        variant="secondary"
        className={CSS_BUTTON}
        onClick={() => setShowInfoBox(true)}
      >
        <InfoIcon strokeWidth={STRK_WDTH} style={{ transform: "scale(1.4)" }} />
      </Button>
    );
  };

  const TopLeftMenu = () => {
    return (
      <div
        className="absolute left-2 top-2 z-10 flex flex-col space-y-2"
        // onClick={() => setTooltip({ ...tooltip, visible: false })}
      >
        <HomeButton />
        <InfoButton />
        <GlobeButton />
      </div>
    );
  };

  const BottomLeftMenu = () => {
    return (
      <div
        className="absolute bottom-0 left-0 w-full rounded-b-xl bg-white/60 p-2 backdrop-blur-md"
        // onClick={(e) => {
        //   setTooltip({ ...tooltip, visible: false });
        // }}
      >
        <div className="flex flex-col items-center justify-center gap-2 gap-x-12 md:flex-row">
          <div className="flex items-center gap-4">
            <Slider
              defaultValue={[year]}
              min={2015}
              max={2025}
              step={1}
              className="min-w-32 flex-grow py-2"
              onValueCommit={(newValue) => setYear(newValue[0])}
            />
            <H4 className="whitespace-nowrap text-gray-600">{year}</H4>
          </div>
          <DomainFilter />
        </div>
      </div>
    );
  };

  const CountryTooltip = () => {
    if (!tooltip.visible) return null;

    return (
      <div
        className="absolute z-20 rounded-lg bg-black/15 p-4 backdrop-blur-sm"
        style={{
          left: tooltip.x,
          top: tooltip.y - 70, // Position above the click point
        }}
      >
        <div className="flex flex-col space-y-1">
          <H4 className="text-gray-100">{tooltip.countryName}</H4>
          <div className="text-gray-100">
            Funding: {formatEuro(tooltip.funding)}
          </div>
        </div>
      </div>
    );
  };

  const Title = () => {
    return (
      <div className="absolute left-1/2 z-10 -translate-x-1/2 rounded-b-xl bg-white px-3 py-2 text-center">
        <H5>
          <span className="text-gray-700">EC Funding in</span>{" "}
          <span className="font-semibold text-orange-400">{year}</span>{" "}
          <span className="text-gray-700">totaling</span>{" "}
          <span className="font-semibold text-orange-400">
            {formatEuro(getTotalFundingForYear(countryFundingMap))}
          </span>
        </H5>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-gray-100">
      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white">
        <Title />
        <TopLeftMenu />
        <InfoBox />
        <BaseDeckGLMap
          id="funding-map"
          layers={layers}
          viewState={INITIAL_VIEW_STATE_TILTED_EU}
          onMapClick={(event) => {
            if (!event.picked) {
              setTooltip({ ...tooltip, visible: false });
            }
          }}
        />
        <BottomLeftMenu />
        <CountryTooltip />
        <TopicRankingPanel
          topicFundingByYear={topicFundingByYear}
          year={year}
          formatEuro={formatEuro}
        />
      </div>
    </div>
  );
}
