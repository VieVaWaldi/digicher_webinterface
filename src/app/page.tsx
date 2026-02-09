"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  Link as MuiLink,
  Typography,
} from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";
import { ReactNode, Suspense, useEffect, useState } from "react";
import {
  IconTextButton,
  Navbar,
  Scenario,
  ScenarioSelector,
  SearchBar,
} from "@/components/mui";
import { useRouter } from "next/navigation";
import { useDataPreFetcher } from "@/hooks/fetching/DataPreFetcher";
// import { useThemeMode } from "@/app/providers";

type ViewMode = "list" | "map";

const LandingPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedScenario, setSelectedScenario] = useState<Scenario>("base");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  // const { resolvedMode } = useThemeMode();

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

  const handleScenarioChange = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    const queryString = buildQueryString();
    router.push(`/scenarios/${scenario}${queryString}`);
  };

  const HeroSection: ReactNode = (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <Container
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
          <Typography
            variant="h4"
            sx={{
              fontWeight: 500,
              textAlign: "center",
              color: "text.primary",
              marginBottom: 3,
            }}
          >
            Search and analyze cultural heritage research
          </Typography>

          <SearchBar
            placeholder="e.g. 3D reconstruction, medieval manuscripts ..."
            onSearch={handleSearch}
            onSearchStart={handleStartSearch}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconTextButton
            icon={<MapOutlinedIcon />}
            label="Map"
            tooltip="Sets search to an interactive Map View"
            selected={viewMode === "map"}
            onClick={() => setViewMode("map")}
          />
          <IconTextButton
            icon={<FormatListBulletedIcon />}
            label="List"
            tooltip="Sets search to default List View (liike google scholar, but better)"
            selected={viewMode === "list"}
            onClick={() => setViewMode("list")}
          />
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
            <Box sx={{ position: "absolute", top: 10 }}>
              <Suspense>
                <ScenarioSelector
                  selected={selectedScenario}
                  onChange={handleScenarioChange}
                />
              </Suspense>
            </Box>
          )}
        </Box>
      </Container>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          pb: 3,
          color: "text.secondary",
        }}
      >
        <KeyboardArrowDownIcon />
        <Typography variant="body2">Learn more</Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: { xs: 4, md: 8 },
          flexWrap: "wrap",
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
          {
            src: "/images/logos/time-machine-logo.png",
            alt: "Time Machine",
          },
          { src: "/images/logos/eu-logo.jpg", alt: "EU Funded" },
        ].map((logo) => (
          <Box
            key={logo.alt}
            component="img"
            src={logo.src}
            alt={logo.alt}
            sx={{
              height: { xs: 40, md: 50 },
              width: "auto",
              // filter: resolvedMode === "dark" ? "" : "",
              opacity: 0.8,
              transition: "opacity 0.2s ease-in-out, filter 0.2s ease-in-out",
              "&:hover": {
                opacity: 0.3,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );

  const infoSections = [
    {
      title: "What is Heritage Monitor?",
      content:
        "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites.",
    },
    {
      title: "What data do we use and where is it from?",
      content:
        "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites.",
    },
    {
      title: "Difference between List and Map?",
      content:
        "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites.",
    },
    {
      title: "What can I do with the Map?",
      content:
        "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites.",
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
