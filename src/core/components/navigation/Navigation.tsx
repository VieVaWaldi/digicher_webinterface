"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createElement } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../../../shadcn/sheet";
import { Button } from "../../../shadcn/button";
import { Settings, Home } from "lucide-react";
import { Separator } from "../../../shadcn/separator";
import SettingsMenu from "../menus/SettingsMenu";
import { getScenario } from "app/scenarios";

export function Navigation() {
  const pathname = usePathname();
  const scenario = getScenario(pathname);

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

          {scenario && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                {createElement(scenario.icon, {
                  // size: 20,
                  strokeWidth: 1.25,
                  className:
                    pathname === scenario.href
                      ? "text-orange-500"
                      : "text-muted-foreground",
                })}
                <span
                  className={
                    pathname === scenario.href
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  }
                >
                  {scenario.title}
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
