"use client";

import Link from "next/link";
import DeckGlLinkList from "components/DeckGlLinkList";
import Header from "components/Header";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    fetch("/api/ping");
  }, []);

  return (
    <div>
      <Header showBackButton={false} />
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Map Scenarios</h1>
        <div className="flex flex-col gap-4">
          <Link
            href="/scenarios/institutions_sme_map"
            className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            S1: Institutions SME Map
          </Link>
          <Link
            href="/scenarios/project_coordinators_globe"
            className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            S2: Project Coordinators Globe
          </Link>
          <Link
            href="/scenarios/institutions_ecnetfunding_bars"
            className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            S3: Institutions EC net Funding Bars
          </Link>
          <Link
            href="/scenarios/institution_collaboration_weights"
            className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            S4: Institutions Collaboration Weights
          </Link>
        </div>
        <DeckGlLinkList />
      </main>
    </div>
  );
}
