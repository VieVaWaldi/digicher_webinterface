import { Building2, Globe2, Lightbulb, Map } from "lucide-react";
import React from "react";
import { Button } from "shadcn/button";

type IconOption = {
  icon: React.ReactNode;
  label?: string;
};

type ToggleProps = {
  isFirstOption: boolean;
  onChange: (value: boolean) => void;
  leftOption: IconOption;
  rightOption: IconOption;
  className?: string;
  showSwitchText?: boolean;
  switchTextClassName?: string;
};

export const IconToggle: React.FC<ToggleProps> = ({
  isFirstOption,
  onChange,
  leftOption,
  rightOption,
  className = "",
  showSwitchText = false,
  switchTextClassName = "",
}) => {
  const switchText = isFirstOption
    ? `Switch to ${rightOption.label}`
    : `Switch to ${leftOption.label}`;

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        className={`relative h-10 w-32 cursor-pointer overflow-hidden p-0 ${className}`}
        onClick={() => onChange(!isFirstOption)}
      >
        {/* Background indicator that slides */}
        <div
          className={`absolute inset-0 bg-primary transition-transform duration-200 ${
            isFirstOption ? "translate-x-0" : "translate-x-16"
          }`}
          style={{ width: "50%" }}
        />

        {/* Left option */}
        <div
          className={`absolute left-0 flex h-full w-16 items-center justify-center transition-colors duration-200 ${
            isFirstOption ? "text-primary-foreground" : "text-foreground"
          }`}
        >
          {leftOption.icon}
        </div>

        {/* Right option */}
        <div
          className={`absolute right-0 flex h-full w-16 items-center justify-center transition-colors duration-200 ${
            !isFirstOption ? "text-primary-foreground" : "text-foreground"
          }`}
        >
          {rightOption.icon}
        </div>
      </Button>

      {/* Optional switch text display */}
      {showSwitchText && (
        <span
          className={`text-sm text-muted-foreground ${switchTextClassName}`}
        >
          {switchText}
        </span>
      )}
    </div>
  );
};

export const ViewToggle: React.FC<{
  isGlobe: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}> = ({ isGlobe, onChange, className = "" }) => {
  return (
    <IconToggle
      isFirstOption={isGlobe}
      onChange={onChange}
      leftOption={{ icon: <Globe2 className="h-4 w-4" />, label: "Globe" }}
      rightOption={{ icon: <Map className="h-4 w-4" />, label: "Map" }}
      className={className}
    />
  );
};

export const ScopeToggle: React.FC<{
  isInstitution: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  showSwitchText?: boolean;
  switchTextClassName?: string;
}> = ({
  isInstitution,
  onChange,
  className = "",
  showSwitchText = true,
  switchTextClassName = "",
}) => {
  return (
    <IconToggle
      isFirstOption={isInstitution}
      onChange={onChange}
      leftOption={{
        icon: <Building2 className="h-4 w-4" />,
        label: "Institutions",
      }}
      rightOption={{
        icon: <Lightbulb className="h-4 w-4" />,
        label: "Projects",
      }}
      className={className}
      showSwitchText={showSwitchText}
      switchTextClassName={switchTextClassName}
    />
  );
};
