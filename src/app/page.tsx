"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  Link as MuiLink,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";
import { keyframes } from "@mui/system";
import { ReactNode, Suspense, useState } from "react";
import {
  Navbar,
  Scenario,
  ScenarioSelector,
  SearchBar,
  ViewMode,
  ViewModeToggle,
} from "@/components/mui";
import { useRouter } from "next/navigation";
import { useDataPreFetcher } from "@/hooks/fetching/DataPreFetcher";
import { useAnimatedPlaceholder } from "@/hooks/useAnimatedPlaceholder";
// import { useThemeMode } from "@/app/providers";

const LandingPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedScenario, setSelectedScenario] = useState<Scenario>("explore");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  // const { resolvedMode } = useThemeMode();

  const placeholderTarget =
    viewMode === "map"
      ? "Map: Visualise research geospatially..."
      : "List: Search by keywords (hit enter) ...";
  const animatedPlaceholder = useAnimatedPlaceholder(placeholderTarget);

  useDataPreFetcher();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const buildQueryString = () => {
    return searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
  };

  const handleStartSearch = (key: string) => {
    if (key !== "Enter") return;
    const queryString = buildQueryString();

    if (viewMode === "list") {
      router.push(`/list/${queryString}`);
    } else {
      router.push(`/scenarios/${selectedScenario}${queryString}`);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === "list" && searchQuery) {
      router.push(`/list/${buildQueryString()}`);
    } else {
      setViewMode(mode);
    }
  };

  const handleScenarioChange = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    const queryString = buildQueryString();
    router.push(`/scenarios/${scenario}${queryString}`);
  };

  const HeroSection: ReactNode = (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Navbar />

      <Box
        maxWidth="md"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          gap: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 700 }}>
          <Box sx={{ width: "100%", maxWidth: 600, ml: 2 }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: "2.4rem",
                fontWeight: 500,
                textAlign: "left",
                color: "text.primary",
                marginBottom: 2,
              }}
            >
              Understand cultural heritage research
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: "left",
                color: "text.secondary",
                marginBottom: 4,
              }}
            >
              We connect institutions, projects, and publications across Europe.
              Helping researchers and policymakers gain insights into
              collaborations, funding, and emerging trends.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "stretch", gap: 1 }}>
            <SearchBar
              placeholder={animatedPlaceholder}
              onSearch={handleSearch}
              onSearchStart={handleStartSearch}
            />
            <ViewModeToggle value={viewMode} onChange={handleViewModeChange} />
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {viewMode === "map" && (
            <Box sx={{ position: "absolute" }}>
              <Suspense>
                <ScenarioSelector
                  selected={selectedScenario}
                  onChange={handleScenarioChange}
                />
              </Suspense>
            </Box>
          )}
        </Box>
      </Box>

      {/*<Box*/}
      {/*  sx={{*/}
      {/*    display: "flex",*/}
      {/*    flexDirection: "row",*/}
      {/*    alignItems: "center",*/}
      {/*    justifyContent: "center",*/}
      {/*    pb: 3,*/}
      {/*    color: "text.secondary",*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <KeyboardArrowDownIcon />*/}
      {/*  <Typography variant="body2">Learn more</Typography>*/}
      {/*</Box>*/}

      {/* Desktop: static logo row */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          backgroundColor: "background.paper",
          border: 1,
          borderColor: "divider",
          py: 3,
          width: "100%",
        }}
      >
        {[
          { src: "/images/logos/digicher-logo.png", alt: "DIGICHer" },
          { src: "/images/logos/fsujena-logo.png", alt: "FSU Jena" },
          { src: "/images/logos/time-machine-logo.png", alt: "Time Machine" },
          { src: "/images/logos/eu-logo.jpg", alt: "EU Funded" },
        ].map((logo) => (
          <Box
            key={logo.alt}
            component="img"
            src={logo.src}
            alt={logo.alt}
            sx={{
              height: 50,
              width: "auto",
              opacity: 0.8,
              transition: "opacity 0.2s ease-in-out",
              "&:hover": { opacity: 0.3 },
            }}
          />
        ))}
      </Box>

      {/* Mobile: marquee logo row */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          overflow: "hidden",
          backgroundColor: "background.paper",
          borderTop: 1,
          borderBottom: 1,
          borderColor: "divider",
          py: 3,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "max-content",
            animation: `${keyframes`
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            `} 12s linear infinite`,
          }}
        >
          {[
            { src: "/images/logos/digicher-logo.png", alt: "DIGICHer" },
            { src: "/images/logos/fsujena-logo.png", alt: "FSU Jena" },
            { src: "/images/logos/time-machine-logo.png", alt: "Time Machine" },
            { src: "/images/logos/eu-logo.jpg", alt: "EU Funded" },
            { src: "/images/logos/digicher-logo.png", alt: "DIGICHer 2" },
            { src: "/images/logos/fsujena-logo.png", alt: "FSU Jena 2" },
            {
              src: "/images/logos/time-machine-logo.png",
              alt: "Time Machine 2",
            },
            { src: "/images/logos/eu-logo.jpg", alt: "EU Funded 2" },
          ].map((logo) => (
            <Box
              key={logo.alt}
              component="img"
              src={logo.src}
              alt={logo.alt}
              sx={{
                height: 40,
                width: "auto",
                opacity: 0.8,
                mx: 4,
                flexShrink: 0,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  const infoSections = [
    {
      title: "What is Heritage Monitor?",
      content:
        "Heritage Monitor is an interactive data platform that transforms cultural heritage research findings into clear, searchable, and reusable outputs. It supports users in exploring institutions, projects, and publications in Europe and beyond to discover, address, and engage with patterns of cooperation, funding landscapes, and emerging research directions in the field of cultural heritage.",
    },
    {
      title: "What data do we use and where is it from?",
      content:
        "The platform aggregates large public datasets from leading European research institutions - including institutional archives, project funding data, and research results - to provide the most comprehensive picture possible of research activity in the field of cultural heritage. This combined data enables a clear presentation and thus also the comparison of trends, funding opportunities, and thematic areas in which cultural heritage research takes place.",
    },
    {
      title: "Difference between List and Map?",
      content:
        "The Heritage Monitor allows you to search at various levels. The list view provides structured, searchable data – ideal for sorting and filtering institutions, projects, or research results. The map view visualizes this information geographically, helping you to visually locate research activities and patterns within a spatial area. Together, these two main display options offer insights into detailed data and spatial context.",
    },
    {
      title: "What can I do with the Map?",
      content:
        "Using this map, you can visually explore cultural heritage research and stakeholders across Europe: See where institutions are located or identify regional centers of activity. Use the map to compare and visualize geographical patterns of funding and collaboration, thereby revealing spatial patterns, connections, or differences.",
    },
    {
      title: "What can I do with the List?",
      content:
        "The list view allows you to explore cultural heritage data in a structured and detailed way. It enables you to search, filter, and sort institutions, projects, and publications according to specific criteria. You can compare entries, identify key players, analyze funding patterns, and quickly access relevant information. The list view is ideal for focused research, targeted queries, and in-depth analyses that go beyond geographical visualization.",
    },
  ];

  const InformationSection: ReactNode = (
    <Box
      sx={{
        backgroundColor: "background.default",
        pt: 12,
        pb: 4,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          mb: 12,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 8,
            display: "block",
            textAlign: "center",
          }}
        >
          WANT TO KNOW MORE?
        </Typography>

        <Grid container spacing={4}>
          {infoSections.map((section) => (
            <Grid key={section.title} size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
                >
                  {section.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {section.content}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mb: 4,
          textAlign: "center",
        }}
      >
        Funded by the European Union, built for Everyone.
      </Typography>
    </Box>
  );

  const FooterSection: ReactNode = (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
        px: 3,
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ mb: 6 }}>
          {/* Department Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                }}
              >
                Digital Humanities at Friedrich Schiller University
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.7,
                }}
              >
                The junior professorship focuses on high-level research and
                teaching in Digital Humanities and Digital Cultural Heritage,
                specializing in image- and object-based knowledge media. Our
                work encompasses information behavior, museum mediation, and
                digital competencies development.
              </Typography>
              <Button
                component={MuiLink}
                href="https://www.gw.uni-jena.de/en/8465/juniorprofessur-fuer-digital-humanities"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  width: "fit-content",
                  textTransform: "none",
                }}
              >
                Visit Department Website
              </Button>
            </Box>
          </Grid>

          {/* Contact Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                }}
              >
                Contact
              </Typography>
              <Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Led by J.Prof. Dr. Sander Münster
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Developed by Walter Ehrenberger
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  component={MuiLink}
                  href="https://github.com/vievawaldi"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  sx={{
                    color: "text.secondary",
                    borderColor: "divider",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                    },
                  }}
                >
                  @github
                </Button>
                <Button
                  component={MuiLink}
                  href="https://walterai.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<LanguageIcon />}
                  sx={{
                    color: "text.secondary",
                    borderColor: "divider",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                    },
                  }}
                >
                  Developer Website
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright and Funding */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            borderTop: 1,
            borderColor: "divider",
            pt: 6,
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src="/images/logos/eu-logo.jpg"
            alt="EU Funded - DigiCHer Logo"
            sx={{
              height: 64,
              width: "auto",
              objectFit: "contain",
              opacity: 0.8,
              transition: "opacity 0.2s ease-in-out",
              "&:hover": {
                opacity: 1,
              },
            }}
          />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              DigiCHer Project | Horizon Europe Grant #101132481
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              © {new Date().getFullYear()} Friedrich Schiller University Jena |
              Heritage Monitor
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );

  return (
    <>
      {HeroSection}
      {InformationSection}
      {FooterSection}
    </>
  );
};

export default LandingPage;
