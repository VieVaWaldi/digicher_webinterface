import {
  Brain,
  Building2,
  Coins,
  GitBranch,
  Globe2,
  Lightbulb,
  LucideIcon,
  ScrollText,
} from "lucide-react";

interface Scenario {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  color: string;
  brief: string;
  description: string;
  features: string[];
  screenshot: string;
}

interface DataType {
  icon: LucideIcon;
  title: string;
  count: number;
  description: string;
}

export const scenarios: Scenario[] = [
  {
    id: "project",
    title: "Cultural Heritage Projects",
    href: "/scenarios/projects",
    icon: Lightbulb,
    color: "from-yellow-500 to-orange-500",
    brief: "Discover and analys projects",
    description: "...",
    features: ["...", "...", "..."],
    screenshot: "/screenshots/funding.png",
  },
  {
    id: "funding",
    title: "Funding Tracker",
    href: "/scenarios/funding-tracker",
    icon: Coins,
    color: "from-green-500 to-emerald-500",
    brief: "Analyze EU funding distribution patterns",
    description:
      "Visualize funding flows across institutions and projects with switchable granularity, revealing geographic patterns and institutional success rates.",
    features: [
      "Multi-level funding views",
      "Geographic distribution analysis",
      "Temporal funding trends",
    ],
    screenshot: "/screenshots/funding.png",
  },
  {
    id: "collaboration",
    title: "Collaboration Networks (wip)",
    href: "/scenarios/collaboration",
    icon: GitBranch,
    color: "from-purple-500 to-pink-500",
    brief: "Visualize institutional partnerships and gaps",
    description:
      "Explore collaboration patterns through co-funded projects and joint publications, revealing partnership clusters and strategic opportunities across Europe.",
    features: [
      "Network cluster detection",
      "Partnership strength visualization",
      "Collaboration gap identification",
    ],
    screenshot: "/screenshots/collaboration.png",
  },
  {
    id: "expert",
    title: "Expert Discovery (coming soon)",
    href: "/scenarios/expert-discovery",
    icon: Building2,
    color: "from-blue-500 to-cyan-500",
    brief: "Identify leading institutions by measurable impact",
    description:
      "Discover and rank institutions based on their demonstrated expertise in specific cultural heritage topics through publication impact, project leadership, and funding success.",
    features: [
      "Topic-specific impact scoring",
      "Geographic expertise mapping",
      "Evidence-based expert selection",
    ],
    screenshot: "/screenshots/expert-discovery.png",
  },
  {
    id: "minority",
    title: "Minority Research (coming soon)",
    href: "/scenarios/minority",
    icon: Globe2,
    color: "from-indigo-500 to-purple-500",
    brief: "Monitor minority heritage representation",
    description:
      "Track research activity related to minority cultural heritage communities, identifying representation patterns and research gaps across European institutions.",
    features: [
      "Community-specific tracking",
      "Representation heat maps",
      "Diversity gap analysis",
    ],
    screenshot: "/screenshots/minority.png",
  },
  {
    id: "topic",
    title: "Topic Intelligence (coming soon)",
    href: "/scenarios/topic-intelligence",
    icon: Brain,
    color: "from-orange-500 to-red-500",
    brief: "Monitor trends and predict emerging research areas",
    description:
      "Navigate hierarchical topic structures with popularity scores and trend predictions to identify emerging or declining research areas in cultural heritage.",
    features: [
      "Trend analysis over time",
      "Predictive modeling",
      "Research gap discovery",
    ],
    screenshot: "/screenshots/topic-intelligence.png",
  },
];

export const dataTypes: DataType[] = [
  {
    icon: Building2,
    title: "Institutions",
    count: 176014,
    description:
      "Universities, museums, companies, and cultural organizations driving heritage research",
  },
  {
    icon: Lightbulb,
    title: "Research Projects",
    count: 91956,
    description:
      "Funded initiatives spanning archaeology, digitization, preservation, and innovation",
  },
  {
    icon: ScrollText,
    title: "Research Outputs",
    count: 856251,
    description:
      "Publications, reports, and deliverables advancing cultural heritage knowledge",
  },
];

export function getScenario(path: string): Scenario | undefined {
  return scenarios.find((scenario) => scenario.href === path);
}
