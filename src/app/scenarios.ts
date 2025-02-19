import { MapPin, Building2, Coins, UsersRound, LucideIcon } from "lucide-react";

interface Scenario {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const scenarios: Scenario[] = [
  {
    title: "Institutions",
    href: "/scenarios/institutions",
    icon: Building2,
    description: "Explore cultural heritage institutions across Europe",
  },
  {
    title: "Projects",
    href: "/scenarios/projects",
    icon: MapPin,
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
    icon: UsersRound,
    description: "Visualize collaboration networks between institutions",
  },
];

export function getScenario(path: string): Scenario | undefined {
  return scenarios.find((scenario) => scenario.href === path);
}
