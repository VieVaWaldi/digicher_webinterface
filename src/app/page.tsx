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
import { useState } from "react";
import { SearchBar } from "@/components/mui";
import { IconTextPill } from "@/components/mui";
import { useRouter } from "next/navigation";
import { useDataPreFetcher } from "@/hooks/fetching/DataPreFetcher";
import { SEARCH_ENTITY_CONFIGS, SearchEntity } from "@/types/search";
import { defaultScenarios } from "@/types/scenario";
import ScienceIcon from "@mui/icons-material/Science";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BurgerMenu from "@/components/layout/BurgerMenu";

const ENTITY_OPTIONS = SEARCH_ENTITY_CONFIGS.map((cfg) => ({
  value: cfg.value,
  label: cfg.label,
  icon:
    cfg.value === "projects" ? (
      <ScienceIcon fontSize="small" />
    ) : cfg.value === "works" ? (
      <DescriptionIcon fontSize="small" />
    ) : (
      <AccountBalanceIcon fontSize="small" />
    ),
}));

const infoSections = [
  {
    title: "What is Heritage Monitor?",
    content:
      "Heritage Monitor is an interactive data platform that transforms cultural heritage research findings into clear, searchable, and reusable outputs. It supports users in exploring organizations, projects, and publications in Europe and beyond to discover, address, and engage with patterns of cooperation, funding landscapes, and emerging research directions in the field of cultural heritage.",
  },
  {
    title: "What data do we use and where is it from?",
    content:
      "The platform aggregates large public datasets from leading European research organizations - including organizational archives, project funding data, and research results - to provide the most comprehensive picture possible of research activity in the field of cultural heritage. This combined data enables a clear presentation and thus also the comparison of trends, funding opportunities, and thematic areas in which cultural heritage research takes place.",
  },
  {
    title: "Difference between List and Map?",
    content:
      "The Heritage Monitor allows you to search at various levels. The list view provides structured, searchable data – ideal for sorting and filtering organizations, projects, or research results. The map view visualizes this information geographically, helping you to visually locate research activities and patterns within a spatial area. Together, these two main display options offer insights into detailed data and spatial context.",
  },
  {
    title: "What can I do with the Map?",
    content:
      "Using this map, you can visually explore cultural heritage research and stakeholders across Europe: See where organizations are located or identify regional centers of activity. Use the map to compare and visualize geographical patterns of funding and collaboration, thereby revealing spatial patterns, connections, or differences.",
  },
  {
    title: "What can I do with the List?",
    content:
      "The list view allows you to explore cultural heritage data in a structured and detailed way. It enables you to search, filter, and sort organizations, projects, and publications according to specific criteria. You can compare entries, identify key players, analyze funding patterns, and quickly access relevant information. The list view is ideal for focused research, targeted queries, and in-depth analyses that go beyond geographical visualization.",
  },
];

const logoLinks = [
  {
    src: "/images/logos/digicher-logo.png",
    alt: "DIGICHer",
    href: "https://www.digicher-project.eu/",
  },
  {
    src: "/images/logos/fsujena-logo.png",
    alt: "FSU Jena",
    href: "https://www.gw.uni-jena.de/en/8465/juniorprofessur-fuer-digital-humanities",
  },
  {
    src: "/images/logos/eu-logo.jpg",
    alt: "EU Funded",
    href: "https://cordis.europa.eu/project/id/101132481",
  },
  {
    src: "/images/logos/time-machine-logo.png",
    alt: "Time Machine",
    href: "https://www.timemachine.eu/",
  },
];

const LandingPage = () => {
  const [selectedEntity, setSelectedEntity] = useState<SearchEntity>("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useDataPreFetcher();

  const entityConfig = SEARCH_ENTITY_CONFIGS.find(
    (c) => c.value === selectedEntity,
  )!;

  const placeholder = `Search ${entityConfig.lengthLabel} ${entityConfig.label}…`;

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    params.set("entity", selectedEntity);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const handleSearchStart = (key: string) => {
    if (key !== "Enter") return;
    router.push(`/list${buildQueryString()}`);
  };

  const handleScenarioClick = (scenarioId: string) => {
    const q = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
    router.push(`/scenarios/${scenarioId}${q}`);
  };

  return (
    <>
      {/* Hero — full viewport */}
      <Box
        sx={{
          height: "100vh",
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <BurgerMenu flat />

        {/* Main content: centered vertically and horizontally */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            px: { xs: 3, md: 0 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 620,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Title Section */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  // fontSize: { xs: "1.9rem", md: "2.2rem" },
                  // fontWeight: 500,
                  color: "text.primary",
                  mb: 1.5,
                }}
              >
                Understand research activity
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                We help researchers and policymakers clearly visualize
                collaborations, funding, and emerging trends. Optimized for
                cultural heritage.
              </Typography>
            </Box>

            {/* Search Section */}
            <SearchBar
              autoFocus
              placeholder={placeholder}
              value={searchQuery}
              onSearch={setSearchQuery}
              onSearchStart={handleSearchStart}
              entityOptions={ENTITY_OPTIONS}
              selectedEntity={selectedEntity}
              onEntityChange={(v) => setSelectedEntity(v as SearchEntity)}
            />
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Search & filter in 3.7M projects, 10M publications and 400K organizations
              from{" "}
              <MuiLink
                href="https://explore.openaire.eu/search/find/projects"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "inherit", textDecorationColor: "inherit" }}
              >
                OpenAIRE
              </MuiLink>{" "}
              enriched with{" "}
              <MuiLink
                href="https://ror.org/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "inherit", textDecorationColor: "inherit" }}
              >
                ROR
              </MuiLink>{" "}
              and{" "}
              <MuiLink
                href="https://cordis.europa.eu/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "inherit", textDecorationColor: "inherit" }}
              >
                Cordis
              </MuiLink>
              .
            </Typography>

            {/* Map Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: { xs: 2, md: 4 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  component="img"
                  src="/icons/GlobeIcon.png"
                  alt="Globe"
                  sx={{
                    height: "1.6em",
                    width: "auto",
                    opacity: 0.85,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 500, color: "text.primary" }}
                >
                  Explore research geospatially
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {defaultScenarios.map((scenario) => (
                  <Box
                    key={scenario.id}
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <IconTextPill
                      icon={scenario.icon}
                      label={scenario.label}
                      tooltip={scenario.tooltip}
                      onClick={() => handleScenarioClick(scenario.id)}
                    />
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary" }}
                    >
                      {scenario.id === "explore"
                        ? "Explore projects and organizations geospatially"
                        : scenario.id === "collaboration"
                          ? "Visualize project based collaboration networks of one organization or many"
                          : "Model funding patterns across organizations and regions"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Banner: at the bottom of the screen */}
        {/* Desktop: static logo row */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            backgroundColor: "background.paper",
            border: 1,
            borderColor: "divider",
            py: 3,
            width: "100%",
            flexShrink: 0,
          }}
        >
          {logoLinks.map((logo) => (
            <MuiLink
              key={logo.alt}
              href={logo.href}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Box
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
            </MuiLink>
          ))}
        </Box>

        {/* Mobile: marquee logo row */}
        <Box
          sx={{
            display: { xs: "block", sm: "none" },
            overflow: "hidden",
            backgroundColor: "background.paper",
            borderTop: 1,
            borderBottom: 1,
            borderColor: "divider",
            py: 3,
            width: "100%",
            flexShrink: 0,
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
            {[...logoLinks, ...logoLinks].map((logo, i) => (
              <MuiLink
                key={`${logo.alt}-${i}`}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Box
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
              </MuiLink>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Information Section */}
      <Box
        sx={{
          backgroundColor: "background.default",
          pt: 12,
          pb: 4,
        }}
      >
        <Container maxWidth="md" sx={{ mb: 12 }}>
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

      {/* Footer Section */}
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
                  sx={{ fontWeight: 600, color: "primary.main" }}
                >
                  Digital Humanities at Friedrich Schiller University
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", lineHeight: 1.7 }}
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
                  sx={{ width: "fit-content", textTransform: "none" }}
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
                  sx={{ fontWeight: 600, color: "primary.main" }}
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
                "&:hover": { opacity: 1 },
              }}
            />
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                DigiCHer Project | Horizon Europe Grant #101132481
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                © {new Date().getFullYear()} Friedrich Schiller University Jena
                | Heritage Monitor
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;
