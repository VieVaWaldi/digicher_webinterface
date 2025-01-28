"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Card } from "core/components/shadcn/card";
import ResourcesList from "core/components/content/ResourcesList";
import { H1, Lead, P } from "core/components/shadcn/typography";
import { MapPin, Building2, Coins, UsersRound } from "lucide-react";

const scenarios = [
  {
    title: "Institutions",
    href: "/scenarios/institutions",
    icon: Building2,
    description: "Explore cultural heritage institutions across Europe",
  },
  {
    title: "Projects",
    href: "/scenarios/project_coordinators_globe",
    icon: MapPin,
    description:
      "Discover project locations and their geographical distribution",
  },
  {
    title: "Funding",
    href: "/scenarios/institutions_ecnetfunding_bars",
    icon: Coins,
    description: "Analyze funding distribution and financial patterns",
  },
  {
    title: "Collaboration",
    href: "/scenarios/institution_collaboration_weights",
    icon: UsersRound,
    description: "Visualize collaboration networks between institutions",
  },
];

export default function Home() {
  useEffect(() => {
    fetch("/api/wakeup_neon");
  }, []);

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 md:gap-4">
      <H1 className="text-center">Cultural Heritage Map</H1>

      <P className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
        Turtles are reptiles of the order Testudines, characterized by a special
        shell developed mainly from their ribs. Modern turtles are divided into
        two major groups, the Pleurodira and Cryptodira.
      </P>

      <Card className="mx-auto mb-8 max-w-2xl border border-border/40 p-6 shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <Link
                key={scenario.href}
                href={scenario.href}
                className="block"
                passHref
              >
                <div className="flex h-full flex-col rounded-md border border-orange-500/40 transition-colors hover:bg-secondary/80">
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
                    <Icon
                      size={48}
                      strokeWidth={1.25}
                      className="text-orange-500"
                    />
                    <div className="text-center">
                      <Lead className="text-foreground">{scenario.title}</Lead>
                      <p className="text-sm text-muted-foreground">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      <ResourcesList />
    </main>
  );
}
