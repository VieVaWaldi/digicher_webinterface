"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ChevronDown, Github, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { dataTypes, scenarios } from "./scenarios";

const HeritageMonitor = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchData = async () => {
      await queryClient.prefetchQuery({
        queryKey: ["views-project"],
        queryFn: () =>
          fetch("/api/views/map/project").then((res) => res.json()),
      });

      await queryClient.prefetchQuery({
        queryKey: ["views-institution"],
        queryFn: () =>
          fetch("/api/views/map/institution").then((res) => res.json()),
      });

      await queryClient.prefetchQuery({
        queryKey: ["j_project_topic"],
        queryFn: () =>
          fetch("/api/topic/j_project_topic").then((res) => res.json()),
      });

      await queryClient.prefetchQuery({
        queryKey: ["topic"],
        queryFn: () => fetch("/api/topic/topics").then((res) => res.json()),
      });

      await queryClient.prefetchQuery({
        queryKey: ["topic"],
        queryFn: () =>
          fetch("/api/views/map/collaboration").then((res) => res.json()),
      });
    };

    prefetchData();
  }, [queryClient]);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-orange-600/10" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 119, 0, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(0, 119, 255, 0.3) 0%, transparent 50%)",
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-orange-500/20 to-blue-500/20 px-4 py-2">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium">
              <a
                href="https://lis.academy/informetrics-scientometrics/scientometrics-science-quantitative-analysis/"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer underline transition-colors hover:text-orange-400"
              >
                Scientometric
              </a>{" "}
              Intelligence Platform
            </span>
          </div>

          <h1 className="mb-4 animate-pulse bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text pb-3 text-6xl font-bold text-transparent md:text-8xl">
            Heritage Monitor<span className="text-2xl">v0.2</span>
          </h1>

          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-300 md:text-2xl">
            Visualize the evolution of cultural heritage research across Europe
            through advanced{" "}
            <a
              href="https://lis.academy/informetrics-scientometrics/scientometrics-science-quantitative-analysis/"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer underline transition-colors hover:text-orange-400"
            >
              scientometric
            </a>{" "}
            analysis
          </p>

          <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() =>
                document
                  .getElementById("scenarios")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="transform rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 font-semibold shadow-2xl transition-all hover:scale-105 hover:from-orange-600 hover:to-orange-700"
            >
              Explore Scenarios
              <ArrowRight className="ml-2 inline h-5 w-5" />
            </button>
            <button
              className="rounded-lg border border-white/20 bg-white/10 px-8 py-4 font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
              onClick={() => router.push("/scenarios/base")}
            >
              Start the Tool
            </button>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-3 gap-8">
            {dataTypes.map((type, idx) => (
              <div key={idx} className="text-center">
                <type.icon className="mx-auto mb-2 h-8 w-8 text-orange-400" />
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent md:text-3xl">
                  {type.count}
                </div>
                <div className="text-sm text-gray-400">{type.title}</div>
              </div>
            ))}
          </div>
        </div>

        <ChevronDown
          className="absolute bottom-1 h-12 w-12 transform animate-bounce cursor-pointer text-gray-400 duration-1000 md:h-16 md:w-16"
          onClick={() =>
            document
              .getElementById("brief")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        />
      </section>

      {/* What It Does - Brief */}
      <section id="brief" className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
            Intelligence for Cultural Heritage
          </h2>
          <p className="text-xl leading-relaxed text-gray-300">
            Heritage Monitor transforms vast datasets from European research
            initiatives into actionable intelligence. We let you identify
            experts, analyze funding patterns, collaboration networks, minority
            related research and (in development) research trends. This enables
            policy makers, researchers, and institutions to make data-driven
            decisions that shape the future of cultural heritage.
          </p>
        </div>
      </section>

      {/* Data Types */}
      <section className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Core Data Entities
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {dataTypes.map((type, idx) => (
              <div
                key={idx}
                className="transform rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-orange-500/50"
              >
                <type.icon className="mb-4 h-12 w-12 text-orange-400" />
                <h3 className="mb-2 text-2xl font-bold">{type.title}</h3>
                <div className="mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">
                  {type.count}
                </div>
                <p className="text-gray-400">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenarios Grid */}
      <section id="scenarios" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-4xl font-bold">
            Five Analytical Scenarios
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-400">
            Each scenario is designed to address specific stakeholder needs
            through interactive visualizations and evidence-based insights
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => router.push(scenario.href)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:shadow-2xl hover:shadow-orange-500/20"
              >
                {/* Background Icon with Blur Effect */}
                <div className="pointer-events-none absolute -right-4 -top-4 opacity-10 transition-all duration-300 group-hover:scale-110 group-hover:opacity-20">
                  <scenario.icon className="h-32 w-32 text-white" />
                </div>

                {/* Gradient Overlay for Depth */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Play Button Container */}
                <div className="relative z-10 mb-6 flex items-center justify-between">
                  <div
                    className={`relative h-16 w-16 rounded-full bg-gradient-to-r ${scenario.color} p-4 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-orange-500/30`}
                  >
                    <scenario.icon className="h-full w-full text-white" />

                    {/* Pulse Ring Effect - Triggers on hover */}
                    <div className="pointer-events-none absolute -inset-2 rounded-full border-2 border-white/40 opacity-0 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute -inset-2 rounded-full border-2 border-white/20 opacity-0 transition-all duration-500 group-hover:animate-ping group-hover:opacity-100" />
                  </div>

                  {/* Status Badge */}
                  {scenario.title.includes("coming soon") && (
                    <div className="pointer-events-none rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400 backdrop-blur-sm">
                      Coming Soon
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="mb-3 text-xl font-bold transition-colors duration-300 group-hover:text-orange-300">
                    {scenario.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                    {scenario.brief}
                  </p>
                </div>

                {/* Interactive Elements */}
                <div className="pointer-events-none absolute bottom-4 right-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2 font-medium text-orange-400">
                    <span>Explore</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          {/* Extended Explanation */}
          <div className="mb-20">
            <h2 className="mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-center text-4xl font-bold text-transparent">
              Transforming Heritage Research Through Data
            </h2>
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-2xl font-bold">The Challenge</h3>
                <p className="mb-4 text-gray-300">
                  Cultural heritage research spans thousands of institutions,
                  hundreds of funding programs, and countless research outputs.
                  This fragmentation makes it nearly impossible to identify
                  trends, find collaborators, or ensure equitable representation
                  of minority communities.
                </p>
                <p className="text-gray-300">
                  Traditional approaches rely on personal networks and
                  incomplete information, leading to missed opportunities and
                  reinforcing existing biases in research funding and
                  collaboration.
                </p>
              </div>
              <div>
                <h3 className="mb-4 text-2xl font-bold">Our Solution</h3>
                <p className="mb-4 text-gray-300">
                  HeritageMonitor aggregates data from CORDIS, OpenAIRE, ArXiv,
                  and CORE to create a comprehensive view of the cultural
                  heritage research landscape. Using advanced algorithms for
                  topic modeling, network analysis, and predictive analytics, we
                  transform raw data into strategic intelligence.
                </p>
                <p className="text-gray-300">
                  Our platform enables evidence-based decision making, revealing
                  hidden patterns in collaboration networks, identifying
                  emerging research areas before they become mainstream, and
                  ensuring minority heritage receives appropriate attention and
                  resources.
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Details */}
          <div className="space-y-16">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Scenario Deep Dives
            </h2>
            {scenarios.map((scenario, idx) => (
              <div
                key={scenario.id}
                className={`flex flex-col items-center gap-8 md:flex-row ${idx % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              >
                <div className="flex-1">
                  <div
                    className={`inline-block rounded-lg bg-gradient-to-r p-3 ${scenario.color} mb-4`}
                  >
                    <scenario.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold">{scenario.title}</h3>
                  <p className="mb-4 text-gray-300">{scenario.description}</p>
                  <ul className="space-y-2">
                    {scenario.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-2">
                        <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400" />
                        <span className="text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900 p-8">
                    <div className="relative aspect-[4/3] min-h-[200px] overflow-hidden rounded-lg bg-gradient-to-br from-white/5 to-white/10 md:aspect-video md:min-h-[250px]">
                      <Image
                        src={scenario.screenshot}
                        alt={`${scenario.title} screenshot`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={85}
                        priority={idx < 2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Issues */}
          <div className="mt-20">
            <h2 className="mb-8 text-center text-3xl font-bold">
              Key Challenges We Address
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-xl font-bold text-orange-400">
                  Defining Cultural Heritage
                </h3>
                <p className="text-gray-300">
                  Cultural heritage is inherently interdisciplinary, spanning
                  archaeology, digital humanities, conservation science, and
                  countless other fields. Our hierarchical topic modeling
                  approach captures this complexity while maintaining analytical
                  precision.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-xl font-bold text-orange-400">
                  Data Fragmentation
                </h3>
                <p className="text-gray-300">
                  Research data is scattered across multiple databases,
                  languages, and formats. Our unified data model and enrichment
                  strategies bridge these gaps, creating a comprehensive view of
                  the research landscape.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-xl font-bold text-orange-400">
                  Minority Representation{" "}
                  <span className="text-base text-gray-400">(coming soon)</span>
                </h3>
                <p className="text-gray-300">
                  Minority communities are often invisible in traditional
                  research metrics. Our specialized tracking and keyword-based
                  identification systems ensure their contributions and needs
                  are properly recognized.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-xl font-bold text-orange-400">
                  Predictive Capabilities{" "}
                  <span className="text-base text-gray-400">(coming soon)</span>
                </h3>
                <p className="text-gray-300">
                  Understanding where research is heading is as important as
                  knowing where its been. Our machine learning models identify
                  emerging trends, helping stakeholders stay ahead of the curve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-orange-900/20 to-blue-900/20 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold">Ready to Explore?</h2>
          <p className="mb-8 text-xl text-gray-300">
            Dive into the data and discover insights that will shape the future
            of cultural heritage research
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              className="transform rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 font-semibold shadow-2xl transition-all hover:scale-105 hover:from-orange-600 hover:to-orange-700"
              onClick={() => router.push("/scenarios/funding-tracker")}
            >
              Launch Platform
              <ArrowRight className="ml-2 inline h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-gradient-to-b from-gray-950 to-gray-900 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Department Information */}
            <div className="flex flex-col gap-6">
              <h3 className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-xl font-semibold text-transparent">
                Digital Humanities at Friedrich Schiller University
              </h3>
              <p className="leading-relaxed text-gray-300">
                The junior professorship focuses on high-level research and
                teaching in Digital Humanities and Digital Cultural Heritage,
                specializing in image- and object-based knowledge media. Our
                work encompasses information behavior, museum mediation, and
                digital competencies development.
              </p>
              <Link
                href="https://www.gw.uni-jena.de/en/8465/juniorprofessur-fuer-digital-humanities"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-orange-400 backdrop-blur-sm transition-all hover:border-orange-500/50 hover:bg-orange-500/20 hover:text-orange-300"
              >
                Visit Department Website
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-6">
              <h3 className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-xl font-semibold text-transparent">
                Contact
              </h3>
              <div className="space-y-2">
                <p className="text-gray-300">
                  Led by J.Prof. Dr. Sander Münster
                </p>
                <p className="text-gray-300">Developed by Walter Ehrenberger</p>
              </div>
              <div className="flex gap-x-4">
                <Link
                  href="https://github.com/vievawaldi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all hover:border-orange-500/30 hover:bg-white/10 hover:text-orange-400"
                >
                  <Github className="h-5 w-5" strokeWidth={1.25} />
                  <span>@github</span>
                </Link>
                <Link
                  href="https://walterai.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all hover:border-orange-500/30 hover:bg-white/10 hover:text-orange-400"
                >
                  <Github className="h-5 w-5" strokeWidth={1.25} />
                  <span>@Developer Website</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright and Funding */}
          <div className="flex flex-col gap-8 border-t border-white/10 pt-12">
            <div className="flex justify-center">
              <Image
                src="/images/eu-funded.png"
                alt="EU Funded - DigiCHer Logo"
                width={256}
                height={128}
                className="object-contain opacity-80 transition-opacity hover:opacity-100"
              />
            </div>
            <div className="text-center">
              <p className="mb-2 text-gray-400">
                DigiCHer Project | Horizon Europe Grant #101132481
              </p>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Friedrich Schiller University Jena
                | Heritage Monitor v0.1
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeritageMonitor;
