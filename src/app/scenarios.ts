import { Lightbulb, Building2, Coins, Handshake, LucideIcon, HandCoins } from "lucide-react";

interface Scenario {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const scenarios: Scenario[] = [
  {
    title: "EC Country Funding",
    href: "/scenarios/country_funding",
    icon: HandCoins,
    description: "Visualized the EC contribution per country over time for CH projects",
  },
  {
    title: "Institutions",
    href: "/scenarios/institutions",
    icon: Building2,
    description: "Explore cultural heritage institutions across Europe",
  },
  {
    title: "Projects",
    href: "/scenarios/projects",
    icon: Lightbulb,
    description:
      "Discover project locations and their geographical distribution",
  },
  {
    title: "Funding",
    href: "/scenarios/funding",
    icon: Coins,
    description: "Analyze funding distribution and financial patterns",
  },
  {
    title: "Collaboration",
    href: "/scenarios/collaboration",
    icon: Handshake,
    description: "Visualize collaboration networks between institutions",
  },
];

export function getScenario(path: string): Scenario | undefined {
  return scenarios.find((scenario) => scenario.href === path);
}
