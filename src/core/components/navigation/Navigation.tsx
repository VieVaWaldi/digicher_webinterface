"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createElement, FC, SVGProps } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../../../shadcn/sheet";
import { Button } from "../../../shadcn/button";
import {
  Settings,
  Home,
  Building2,
  MapPin,
  Coins,
  UsersRound,
} from "lucide-react";
import { Separator } from "../../../shadcn/separator";
import SettingsMenu from "../menus/SettingsMenu";

type PathMap = {
  [key: string]: {
    title: string;
    icon: FC<SVGProps<SVGSVGElement>>;
    path: string;
  };
};

// ToDo Use the json[] from page and put that somewhere else
const pathToTitle: PathMap = {
  "/scenarios/institutions": {
    title: "Institutions",
    icon: Building2,
    path: "/scenarios/institutions",
  },
  "/scenarios/projects": {
    title: "Projects",
    icon: MapPin,
    path: "/scenarios/project_coordinators_globe",
  },
  "/scenarios/institutions_ecnetfunding_bars": {
    title: "Funding",
    icon: Coins,
    path: "/scenarios/institutions_ecnetfunding_bars",
  },
  "/scenarios/institution_collaboration_weights": {
    title: "Collaboration",
    icon: UsersRound,
    path: "/scenarios/institution_collaboration_weights",
  },
};

export function Navigation() {
  const pathname = usePathname();
  const currentPath = pathToTitle[pathname];

  return (
    // z-10 needed to hide DeckGL behind nav
    <nav className="static z-10 w-full border-b bg-background px-4 py-2 md:fixed md:top-0 md:w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/images/digicher-logo.png"
            alt="Digicher Logo"
            width={72}
            height={32}
            className="object-contain"
          />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              asChild
              className={pathname === "/" ? "text-orange-500" : ""}
            >
              <Link href="/" className="flex items-center gap-2">
                <Home
                  size={20}
                  strokeWidth={1.25}
                  className={pathname === "/" ? "text-orange-500" : ""}
                />
                <span>Home</span>
              </Link>
            </Button>
          </div>

          {currentPath && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                {createElement(currentPath.icon, {
                  // size: 20,
                  strokeWidth: 1.25,
                  className:
                    pathname === currentPath.path
                      ? "text-orange-500"
                      : "text-muted-foreground",
                })}
                <span
                  className={
                    pathname === currentPath.path
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  }
                >
                  {currentPath.title}
                </span>
              </div>
            </>
          )}
        </div>

        <Sheet>
          <Button variant="ghost" size="icon" asChild>
            <SheetTrigger>
              <Settings className="h-5 w-5" />
            </SheetTrigger>
          </Button>
          <SheetContent>
            <SheetTitle>Settings</SheetTitle>
            <SettingsMenu />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
