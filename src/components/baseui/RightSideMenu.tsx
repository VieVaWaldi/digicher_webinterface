import { X } from "lucide-react";
import { ReactNode, useCallback, useState } from "react";
import { Button } from "shadcn/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "shadcn/tabs";

interface RightSideMenuProps {
  rightPanelTabs?: Array<{
    id: string;
    label: string;
    content: ReactNode;
  }>;
}

export default function RightSideMenu({
  rightPanelTabs = [],
}: RightSideMenuProps) {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string>("filters");

  const togglePanel = useCallback((tabId: string) => {
    setIsRightPanelOpen(true);
    setActiveTabId(tabId);
  }, []);

  const handleCloseRightPanel = useCallback(() => {
    setIsRightPanelOpen(false);
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const panel = (
    <div
      className={`border-grey-300 absolute right-0 top-0 z-10 h-full w-1/2 border-l-2 bg-white/60 backdrop-blur-md transition-transform duration-200 ${
        isRightPanelOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full overflow-auto">
        <div className="flex flex-col">
          <Tabs value={activeTabId} onValueChange={handleTabChange}>
            <div className="flex items-center justify-between border-b p-4">
              <TabsList>
                {rightPanelTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button
                variant="ghost"
                className="h-8 w-8"
                onClick={handleCloseRightPanel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {rightPanelTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <div className="p-4">{tab.content}</div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );

  return {
    panel: panel,
    togglePanel,
    isOpen: isRightPanelOpen,
  };
}
