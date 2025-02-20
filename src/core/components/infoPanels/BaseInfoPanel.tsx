import React from "react";
import { Card } from "shadcn/card";

interface BaseInfoPanelProps {
  children: React.ReactNode;
  className?: string;
}

const BaseInfoPanel = ({ children, className = "" }: BaseInfoPanelProps) => {
  return (
    <Card
      className={`h-full w-full border border-gray-200 p-0 transition-all duration-300 hover:shadow-xl ${className}`}
    >
      <div className="flex h-full flex-col">{children}</div>
    </Card>
  );
};

export default BaseInfoPanel;
