import React, { useState, useMemo } from "react";
import { BarChart3, X } from "lucide-react";
import { Button } from "shadcn/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "shadcn/tabs";
import { H4 } from "shadcn/typography";
import { Label } from "shadcn/label";
import { RadioGroup, RadioGroupItem } from "shadcn/radio-group";

interface TopicRankingData {
  name: string;
  amount: number;
  formattedAmount: string;
  rank: number;
}

export interface TopicFundingByYear {
  [year: number]: {
    level1: {
      [topicName: string]: number; // topicName to ec funding amount
    };
    level2: {
      [topicName: string]: number; // topicName to ec funding amount
    };
    level3p: {
      [topicName: string]: number; // topicName to ec funding amount
    };
  };
}

interface TopicPanelProps {
  topicFundingByYear: TopicFundingByYear;
  year: number;
  formatEuro: (value: number) => string;
}

// Update the active tab type to include all three levels
type TopicLevel = "level1" | "level2" | "level3p";

const TopicRankingPanel: React.FC<TopicPanelProps> = ({
  topicFundingByYear,
  year,
  formatEuro,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TopicLevel>("level1");
  const [maxItems, setMaxItems] = useState<string>("10");

  // Calculate topic rankings for current year only
  const rankings = useMemo(() => {
    // Helper function to calculate rankings for a specific level and year
    const getRankingsForLevel = (
      level: TopicLevel,
      currentYear: number,
    ): TopicRankingData[] => {
      if (
        !topicFundingByYear[currentYear] ||
        !topicFundingByYear[currentYear][level]
      ) {
        return [];
      }

      // Get current year rankings
      const currentTopics = Object.entries(
        topicFundingByYear[currentYear][level],
      )
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

      // Return formatted rankings
      return currentTopics.map((topic, index) => {
        const currentRank = index + 1;

        return {
          name: topic.name,
          amount: topic.amount,
          formattedAmount: formatEuro(topic.amount),
          rank: currentRank,
        };
      });
    };

    return {
      level1: getRankingsForLevel("level1", year),
      level2: getRankingsForLevel("level2", year),
      level3p: getRankingsForLevel("level3p", year),
    };
  }, [topicFundingByYear, year, formatEuro]);

  // Filter rankings based on maxItems
  const filteredRankings = useMemo(() => {
    const limit = maxItems === "All" ? Infinity : parseInt(maxItems);
    return {
      level1: rankings.level1.slice(0, limit),
      level2: rankings.level2.slice(0, limit),
      level3p: rankings.level3p.slice(0, limit),
    };
  }, [rankings, maxItems]);

  // Determine table label based on active tab
  const tableLabel =
    activeTab === "level1"
      ? "Field"
      : activeTab === "level2"
        ? "Subfield"
        : "Topic";

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        className="absolute right-2 top-2 z-10 h-10 w-10 rounded-xl bg-white text-orange-500"
        onClick={() => setIsOpen(true)}
      >
        <BarChart3 strokeWidth={2.2} style={{ transform: "scale(1.4)" }} />
      </Button>
    );
  }

  return (
    <div className="absolute right-2 top-2 z-20 w-80 rounded-xl border border-gray-200 bg-white/90 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <H4 className="text-gray-700">Trends</H4>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full p-0"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TopicLevel)}
      >
        <div className="px-3 pt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="level1">Fields</TabsTrigger>
            <TabsTrigger value="level2">Subfields</TabsTrigger>
            <TabsTrigger value="level3p">Topics</TabsTrigger>
          </TabsList>
        </div>

        <div className="border-b border-gray-200 p-3">
          <RadioGroup
            defaultValue="10"
            value={maxItems}
            onValueChange={setMaxItems}
            className="flex items-center gap-4 justify-center"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10" id="max-10" />
              <Label htmlFor="max-10" className="text-sm">
                Top 10
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="25" id="max-25" />
              <Label htmlFor="max-25" className="text-sm">
                Top 25
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="All" id="max-all" />
              <Label htmlFor="max-all" className="text-sm">
                All
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="max-h-96 overflow-y-auto p-3">
          <TabsContent value="level1" className="mt-0">
            {filteredRankings.level1.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-600">
                    <th className="pb-2 text-left font-medium">Rank</th>
                    <th className="pb-2 text-left font-medium">Field</th>
                    <th className="pb-2 text-right font-medium">Funding</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRankings.level1.map((topic) => (
                    <tr
                      key={topic.name}
                      className="border-b border-gray-100 text-sm"
                    >
                      <td className="py-2 text-gray-600">{topic.rank}</td>
                      <td className="py-2 font-medium text-gray-800">
                        {topic.name}
                      </td>
                      <td className="py-2 text-right text-orange-500">
                        {topic.formattedAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-6 text-center text-gray-500">
                No data available for {year}
              </div>
            )}
          </TabsContent>

          <TabsContent value="level2" className="mt-0">
            {filteredRankings.level2.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-600">
                    <th className="pb-2 text-left font-medium">Rank</th>
                    <th className="pb-2 text-left font-medium">Subfield</th>
                    <th className="pb-2 text-right font-medium">Funding</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRankings.level2.map((topic) => (
                    <tr
                      key={topic.name}
                      className="border-b border-gray-100 text-sm"
                    >
                      <td className="py-2 text-gray-600">{topic.rank}</td>
                      <td className="py-2 font-medium text-gray-800">
                        {topic.name}
                      </td>
                      <td className="py-2 text-right text-orange-500">
                        {topic.formattedAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-6 text-center text-gray-500">
                No data available for {year}
              </div>
            )}
          </TabsContent>

          <TabsContent value="level3p" className="mt-0">
            {filteredRankings.level3p.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-600">
                    <th className="pb-2 text-left font-medium">Rank</th>
                    <th className="pb-2 text-left font-medium">Topic</th>
                    <th className="pb-2 text-right font-medium">Funding</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRankings.level3p.map((topic) => (
                    <tr
                      key={topic.name}
                      className="border-b border-gray-100 text-sm"
                    >
                      <td className="py-2 text-gray-600">{topic.rank}</td>
                      <td className="py-2 font-medium text-gray-800">
                        {topic.name}
                      </td>
                      <td className="py-2 text-right text-orange-500">
                        {topic.formattedAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-6 text-center text-gray-500">
                No data available for {year}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      <div className="border-t border-gray-200 p-3 text-xs text-gray-500">
        <span>Funding distribution for {year}</span>
      </div>
    </div>
  );
};

export default TopicRankingPanel;
