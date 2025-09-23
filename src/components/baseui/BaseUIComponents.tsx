import { scenarios } from "app/scenarios";
import SettingsMenu from "components/menus/SettingsMenu";
import {
  Download,
  Home,
  InfoIcon,
  Lightbulb,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "shadcn/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "shadcn/sheet";
import { Spinner } from "shadcn/spinner";
import { H2, H4 } from "shadcn/typography";
import { FeedbackButton } from "./Feedback";

export const CSS_BUTTON =
  "h-10 w-10 rounded-xl bg-white text-orange-500 md:h-12 md:w-12 shadow-lg lg:h-16 lg:w-16";
export const BTN_SCALE = "scale-[1.6] md:scale-[1.8] lg:scale-[2.4]";
export const STRK_WDTH = 2.2;

/** Content */

interface TitleProps {
  loading: boolean;
  titleContent: ReactNode;
  centerOffset?: string;
}

export const Title = ({
  loading,
  titleContent,
  centerOffset = "left-1/2 -translate-x-1/2",
}: TitleProps) => {
  return (
    <div
      className={`absolute ${centerOffset} z-10 rounded-b-xl bg-white px-3 py-2 text-center shadow-lg`}
    >
      <div className="flex min-h-6 items-center justify-center">
        {loading ? (
          <Spinner className="h-8 w-8" />
        ) : (
          <H4 className="text-1xl font-semibold md:text-2xl">{titleContent}</H4>
        )}
      </div>
    </div>
  );
};

/** Main Menu */

interface MainMenuProps {
  showNavigation: boolean;
  onToggleNavigation: () => void;
  onNavigate: () => void;
  onShowInfoBox: () => void;
  onDownloadAction?: () => void;
  showBanner: boolean;
  setShowBanner: (showBanner: boolean) => void;
  setShowFeedback: (showFeedback: boolean) => void;
}

export const MainMenu = ({
  showNavigation,
  onToggleNavigation,
  onNavigate,
  onShowInfoBox,
  onDownloadAction,
  showBanner,
  setShowBanner,
  setShowFeedback,
}: MainMenuProps) => {
  return (
    <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 transform flex-row space-x-2 md:space-x-3">
      <NavigationMenu
        showNavigation={showNavigation}
        onToggleNavigation={onToggleNavigation}
        onNavigate={onNavigate}
      />
      <InfoButton onShowInfoBox={onShowInfoBox} />
      <DownloadButton onDownloadAction={onDownloadAction} />
      <SettingsButton />
      <FeedbackButton
        showBanner={showBanner}
        setShowBanner={setShowBanner}
        setShowFeedback={setShowFeedback}
      />
    </div>
  );
};

/** Menu Buttons */

interface NavigationMenuProps {
  showNavigation: boolean;
  onToggleNavigation: () => void;
  onNavigate: () => void;
}

export const NavigationMenu = ({
  showNavigation,
  onToggleNavigation,
  onNavigate,
}: NavigationMenuProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
    onNavigate();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="relative">
      {/* Navigation Menu Items */}
      {showNavigation && (
        <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col-reverse space-y-3 space-y-reverse duration-300 animate-in">
          {/* Home button */}
          <div
            className="text-grey-100 flex cursor-pointer items-center space-x-2 rounded-xl bg-white p-2 shadow-lg"
            onClick={() => handleNavigation("/")}
          >
            <div className="flex items-center justify-center">
              <Home
                strokeWidth={STRK_WDTH}
                style={{ transform: `scale(${BTN_SCALE})` }}
              />
            </div>
            <span className="pr-2 text-gray-600">Home</span>
          </div>

          {/* Base button */}
          <div
            className={`text-grey-400 flex cursor-pointer items-center space-x-2 rounded-xl bg-white p-2 shadow-lg ${
              isActive("/scenarios/base") ? "border-2 border-orange-500" : ""
            }`}
            onClick={() => handleNavigation("/scenarios/base")}
          >
            <div className="flex items-center justify-center">
              <Lightbulb
                strokeWidth={STRK_WDTH}
                style={{ transform: `scale(${BTN_SCALE})` }}
              />
            </div>
            <span className="pr-2 text-gray-600">Base</span>
          </div>

          {/* Scenario buttons */}
          {scenarios.map((scenario) => {
            const IconComponent = scenario.icon;
            const active = isActive(scenario.href);

            return (
              <div
                key={scenario.id}
                className={`flex cursor-pointer items-center space-x-2 rounded-xl bg-white p-2 text-orange-500 shadow-lg ${
                  active ? "border-2 border-orange-500" : ""
                }`}
                onClick={() => handleNavigation(scenario.href)}
              >
                <div className="flex items-center justify-center">
                  <IconComponent
                    strokeWidth={STRK_WDTH}
                    style={{ transform: `scale(${BTN_SCALE})` }}
                  />
                </div>
                <span className="pr-2 text-gray-600">
                  {scenario.titleShort}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Button */}
      <Button
        variant="secondary"
        className={CSS_BUTTON}
        onClick={onToggleNavigation}
      >
        {showNavigation ? (
          <X strokeWidth={STRK_WDTH} className={BTN_SCALE} />
        ) : (
          <Menu strokeWidth={STRK_WDTH} className={BTN_SCALE} />
        )}
      </Button>
    </div>
  );
};

export const SettingsButton = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" className={CSS_BUTTON}>
          <Settings strokeWidth={STRK_WDTH} className={BTN_SCALE} />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>Settings</SheetTitle>
        <SettingsMenu />
      </SheetContent>
    </Sheet>
  );
};

interface InfoButtonProps {
  onShowInfoBox: () => void;
}

export const InfoButton = ({ onShowInfoBox }: InfoButtonProps) => {
  return (
    <Button variant="secondary" className={CSS_BUTTON} onClick={onShowInfoBox}>
      <InfoIcon strokeWidth={STRK_WDTH} className={BTN_SCALE} />
    </Button>
  );
};

interface DownloadButtonProps {
  onDownloadAction?: () => void;
}

export const DownloadButton = ({ onDownloadAction }: DownloadButtonProps) => {
  if (!onDownloadAction) return null;

  return (
    <Button
      variant="secondary"
      className={CSS_BUTTON}
      onClick={onDownloadAction}
    >
      <Download strokeWidth={STRK_WDTH} className={BTN_SCALE} />
    </Button>
  );
};

interface InfoBoxProps {
  showInfoBox: boolean;
  onHideInfoBox: () => void;
  infoBoxContent: ReactNode;
}

export const InfoBox = ({
  showInfoBox,
  onHideInfoBox,
  infoBoxContent,
}: InfoBoxProps) => {
  if (!showInfoBox) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center"
      onClick={onHideInfoBox}
    >
      <div className="relative max-h-[80vh] w-11/12 max-w-2xl overflow-y-auto rounded-xl bg-white/90 p-6 backdrop-blur-md">
        <div className="flex flex-row justify-between">
          <H2 className="text-xl font-semibold text-gray-800">
            About This Visualisation
          </H2>
          <button
            className="-mt-3 mb-3 text-gray-500 hover:text-gray-700"
            onClick={onHideInfoBox}
          >
            <X className="text-gray-500" />
          </button>
        </div>
        <div className="mb-4 h-px w-full bg-gray-300" />
        {infoBoxContent}
      </div>
    </div>
  );
};
