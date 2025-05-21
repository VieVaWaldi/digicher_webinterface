"use client";

import { useEffect } from "react";

import Link from "next/link";
import { Card } from "shadcn/card";
import { H2, Lead, P } from "shadcn/typography";
import ResourcesList from "components/navigation/DIGICHerLinks";

import { scenarios } from "./scenarios";
import { Navigation } from "components/navigation/Navigation";
import { Footer } from "components/navigation/Footer";

export default function Home() {
  useEffect(() => {
    fetch("/api/wakeup_neon");
  }, []);

  return (
    <>
      <Navigation />
      {/* md:pt-24 to offset the nav ... */}
      <main className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 md:gap-4 md:pt-24">
        <H2 className="text-center">Exploring European Cultural Heritage</H2>

        <P className="mx-auto mb-6 max-w-2xl text-center text-muted-foreground">
          This interactive platform visualises over €23 billion in funding
          across Cultural and Digital Heritage (CH/DH) fields from 1957 to 2030.
          Navigate through more than 26,000 institutions and over 10,000
          research projects to discover geographical distributions,
          collaboration networks, and funding patterns across Europe. Use
          interactive maps and filters to explore how heritage research has
          evolved over the decades, identify key institutional partnerships, and
          analyse funding allocations by country, topic, and time period.
          Whether you are a researcher seeking collaboration opportunities, a
          policy maker tracking investment trends, or an interested citizen
          looking to stay informed, this tool provides visual insights into the
          European heritage research landscape.
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
                  <div className="flex h-full flex-col rounded-md border border-orange-500/40 transition-all hover:scale-105 hover:bg-secondary/80">
                    <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
                      <Icon
                        size={48}
                        strokeWidth={1.25}
                        className="text-orange-500"
                      />
                      <div className="text-center">
                        <Lead className="text-foreground">
                          {scenario.title}
                        </Lead>
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

        <P className="mx-auto max-w-2xl text-center text-sm text-muted-foreground">
          This visualisation is itself an EU-funded project 🇪🇺 and primarily
          showcases EU-funded research initiatives, including collaborations
          with international partners. The European focus reflects the structure
          and priorities of our funding source.
        </P>

        <ResourcesList />
      </main>
      <Footer />
    </>
  );
}
