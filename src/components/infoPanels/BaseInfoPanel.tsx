import React from "react";

interface BaseInfoPanelProps {
  children: React.ReactNode;
  className?: string;
}

const BaseInfoPanel = ({ children, className = "" }: BaseInfoPanelProps) => {
  return (
    <div
      className={`${className} flex h-full flex-col border border-gray-200 p-0 transition-all duration-300 hover:shadow-xl`}
    >
      {children}
    </div>
  );
};

export default BaseInfoPanel;
