import {
  Lightbulb,
  Building2,
  Coins,
  Handshake,
  LucideIcon,
  TrendingUp,
} from "lucide-react";

interface Scenario {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const scenarios: Scenario[] = [
  {
    title: "EC Funding Trends",
    href: "/scenarios/country_funding",
    icon: TrendingUp,
    description:
      "Visualises the EC contribution per country and Europe-wide for domains/fields/topics over time for CH projects",
  },
  {
    title: "Funding",
    href: "/scenarios/funding",
    icon: Coins,
    description:
      "Presents funding distribution and financial patterns across projects and institutions",
  },
  {
    title: "Institutions",
    href: "/scenarios/institutions",
    icon: Building2,
    description: "Shows CH institutions and their activities across Europe",
  },
  {
    title: "Projects",
    href: "/scenarios/projects",
    icon: Lightbulb,
    description:
      "Displays project locations and their geographical distribution throughout the continent",
  },
  {
    title: "Collaboration",
    href: "/scenarios/collaboration",
    icon: Handshake,
    description:
      "Illustrates collaboration networks and partnerships between institutions",
  },
];

export function getScenario(path: string): Scenario | undefined {
  return scenarios.find((scenario) => scenario.href === path);
}
