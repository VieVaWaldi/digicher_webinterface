import Link from "next/link";
import { H2, Lead } from "shadcn/typography";
import { Book, Binary, Layers, Palette } from "lucide-react";

const resources = [
  {
    title: "Basic Examples",
    href: "https://deck.gl/examples",
    icon: Book,
    description: "Learn from basic Deck GL examples",
  },
  {
    title: "Advanced Examples",
    href: "https://deck.gl/showcase",
    icon: Binary,
    description: "Explore advanced Deck GL implementations",
  },
  {
    title: "Layer Reference",
    href: "https://deck.gl/docs/api-reference/layers",
    icon: Layers,
    description: "Complete list of Deck GL layers",
  },
  {
    title: "Mapbox Styles",
    href: "https://docs.mapbox.com/api/maps/styles/",
    icon: Palette,
    description: "Available styles for Mapbox maps",
  },
];

export default function ResourcesList() {
  return (
    <div className="mx-auto max-w-2xl">
      <H2 className="text-center">Resources</H2>
      <div className="mt-6 flex flex-col gap-4">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <Link
              key={resource.href}
              href={resource.href}
              className="group block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-4 rounded-md p-4 transition-colors hover:bg-secondary/80">
                <Icon
                  size={32}
                  strokeWidth={1.25}
                  className="text-orange-500"
                />
                <div>
                  <Lead className="text-base text-foreground">
                    {resource.title}
                  </Lead>
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
