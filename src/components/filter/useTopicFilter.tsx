"use client";

import { useProjectTopicsEnriched } from "hooks/queries/topic/useProjectTopicsEnriched";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "shadcn/button";
import { Checkbox } from "shadcn/checkbox";
import { Input } from "shadcn/input";
import { H6 } from "shadcn/typography";

interface TopicTreeNode {
  id: string;
  name: string;
  type: "domain" | "field" | "subfield" | "topic";
  children?: TopicTreeNode[];
  count?: number;
}

interface SelectedCounts {
  domains: number;
  fields: number;
  subfields: number;
  topics: number;
}

interface TopicFilterResult {
  TopicFilter: ReactNode;
  topicPredicate: (projectId: string) => boolean;
  getTopicColor: (projectId: string) => [number, number, number, number];
  selectedDomains: string[];
  selectedFields: string[];
  selectedSubfields: string[];
  selectedTopics: number[];
}

export const useTopicFilter = (
  defaultOpenSubfieldId: string | null = null,
): TopicFilterResult => {
  const enrichedData = useProjectTopicsEnriched();

  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedSubfields, setSelectedSubfields] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const { treeData, lookupMaps } = useMemo(() => {
    if (!enrichedData?.length) return { treeData: [], lookupMaps: null };

    const projectDomainMap = new Map<string, string>();
    const projectFieldMap = new Map<string, string>();
    const projectSubfieldMap = new Map<string, string>();
    const projectTopicMap = new Map<string, number>();

    const domainMap = new Map<string, TopicTreeNode>();
    const fieldMap = new Map<string, TopicTreeNode>();
    const subfieldMap = new Map<string, TopicTreeNode>();
    const topicMap = new Map<string, TopicTreeNode>();

    enrichedData.forEach(({ project_id, topic }) => {
      if (!topic) return;

      projectDomainMap.set(project_id, topic.domain_id);
      projectFieldMap.set(project_id, topic.field_id);
      projectSubfieldMap.set(project_id, topic.subfield_id);
      projectTopicMap.set(project_id, topic.id);

      if (!domainMap.has(topic.domain_id)) {
        domainMap.set(topic.domain_id, {
          id: topic.domain_id,
          name: topic.domain_name,
          type: "domain",
          children: [],
        });
      }

      const fieldKey = `${topic.domain_id}-${topic.field_id}`;
      if (!fieldMap.has(fieldKey)) {
        const fieldNode: TopicTreeNode = {
          id: topic.field_id,
          name: topic.field_name,
          type: "field",
          children: [],
        };
        fieldMap.set(fieldKey, fieldNode);
        domainMap.get(topic.domain_id)!.children!.push(fieldNode);
      }

      const subfieldKey = `${topic.field_id}-${topic.subfield_id}`;
      if (!subfieldMap.has(subfieldKey)) {
        const subfieldNode: TopicTreeNode = {
          id: topic.subfield_id,
          name: topic.subfield_name,
          type: "subfield",
          children: [],
        };
        subfieldMap.set(subfieldKey, subfieldNode);
        fieldMap.get(fieldKey)!.children!.push(subfieldNode);
      }

      const topicKey = `${topic.subfield_id}-${topic.id}`;
      if (!topicMap.has(topicKey)) {
        const topicNode: TopicTreeNode = {
          id: topic.id.toString(),
          name: topic.topic_name,
          type: "topic",
        };
        topicMap.set(topicKey, topicNode);
        subfieldMap.get(subfieldKey)!.children!.push(topicNode);
      }
    });

    const sortedTreeData = Array.from(domainMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return {
      treeData: sortedTreeData,
      lookupMaps: {
        projectDomainMap,
        projectFieldMap,
        projectSubfieldMap,
        projectTopicMap,
      },
    };
  }, [enrichedData]);

  useEffect(() => {
    if (defaultOpenSubfieldId) {
      setSelectedSubfields((prev) => [...prev, defaultOpenSubfieldId]);
    }

    if (!defaultOpenSubfieldId || !treeData.length) return;

    const pathToExpand = new Set<string>();

    // Find the path to the subfield
    const findSubfieldPath = (
      nodes: TopicTreeNode[],
      parentKey = "",
    ): boolean => {
      for (const node of nodes) {
        const nodeKey = `${parentKey}-${node.type}-${node.id}`;

        if (node.type === "subfield" && node.id === defaultOpenSubfieldId) {
          pathToExpand.add(parentKey); // Add parent domain/field keys
          return true;
        }

        if (node.children && findSubfieldPath(node.children, nodeKey)) {
          pathToExpand.add(nodeKey);
          return true;
        }
      }
      return false;
    };

    findSubfieldPath(treeData);
    setExpandedNodes(pathToExpand);
  }, [defaultOpenSubfieldId, treeData]);

  const selectedSets = useMemo(
    () => ({
      domains: new Set(selectedDomains),
      fields: new Set(selectedFields),
      subfields: new Set(selectedSubfields),
      topics: new Set(selectedTopics),
    }),
    [selectedDomains, selectedFields, selectedSubfields, selectedTopics],
  );

  const filteredTreeData = useMemo(() => {
    if (!searchQuery.trim()) return treeData;

    const searchLower = searchQuery.toLowerCase();

    const filterNode = (node: TopicTreeNode): TopicTreeNode | null => {
      const nameMatches = node.name.toLowerCase().includes(searchLower);
      // ToDo: Add summary and keywords to search

      const filteredChildren =
        (node.children?.map(filterNode).filter(Boolean) as TopicTreeNode[]) ||
        [];

      if (nameMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    };

    return treeData.map(filterNode).filter(Boolean) as TopicTreeNode[];
  }, [treeData, searchQuery]);

  const handleDomainToggle = useCallback((domainId: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId],
    );
  }, []);

  const handleFieldToggle = useCallback((fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId],
    );
  }, []);

  const handleSubfieldToggle = useCallback((subfieldId: string) => {
    setSelectedSubfields((prev) =>
      prev.includes(subfieldId)
        ? prev.filter((id) => id !== subfieldId)
        : [...prev, subfieldId],
    );
  }, []);

  const handleTopicToggle = useCallback((topicId: number) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  }, []);

  const toggleNodeExpansion = useCallback((nodeKey: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeKey)) {
        newSet.delete(nodeKey);
      } else {
        newSet.add(nodeKey);
      }
      return newSet;
    });
  }, []);

  const isNodeSelected = useCallback(
    (node: TopicTreeNode) => {
      switch (node.type) {
        case "domain":
          return selectedSets.domains.has(node.id);
        case "field":
          return selectedSets.fields.has(node.id);
        case "subfield":
          return selectedSets.subfields.has(node.id);
        case "topic":
          return selectedSets.topics.has(parseInt(node.id));
        default:
          return false;
      }
    },
    [selectedSets],
  );

  const selectedCounts: SelectedCounts = useMemo(
    () => ({
      domains: selectedDomains.length,
      fields: selectedFields.length,
      subfields: selectedSubfields.length,
      topics: selectedTopics.length,
    }),
    [selectedDomains, selectedFields, selectedSubfields, selectedTopics],
  );

  const clearAllSelections = useCallback(() => {
    setSelectedDomains([]);
    setSelectedFields([]);
    setSelectedSubfields([]);
    setSelectedTopics([]);
  }, []);

  function simpleTopicColor(topicId: number): [number, number, number, number] {
    // Simple hash to get pseudo-random but consistent colors
    const hash = topicId * 2654435761; // Large prime for better distribution
    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;

    return [r, g, b, 140];
  }

  const getTopicColor = useCallback(
    (projectId: string): [number, number, number, number] => {
      if (!lookupMaps) return [0, 0, 0, 140];

      const topicId = lookupMaps.projectTopicMap.get(projectId);
      if (!topicId) return [0, 0, 0, 140];

      return simpleTopicColor(topicId);
    },
    [lookupMaps],
  );

  const renderTreeNode = useCallback(
    (node: TopicTreeNode, depth: number = 0, parentKey: string = "") => {
      const nodeKey = `${parentKey}-${node.type}-${node.id}`;
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes.has(nodeKey);
      const isSelected = isNodeSelected(node);

      const handleToggle = () => {
        switch (node.type) {
          case "domain":
            handleDomainToggle(node.id);
            break;
          case "field":
            handleFieldToggle(node.id);
            break;
          case "subfield":
            handleSubfieldToggle(node.id);
            break;
          case "topic":
            handleTopicToggle(parseInt(node.id));
            break;
        }
      };

      return (
        <div key={nodeKey} className="select-none">
          <div
            className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpansion(nodeKey);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-4" />}

            <Checkbox
              checked={isSelected}
              onCheckedChange={handleToggle}
              className="h-4 w-4"
            />

            <span
              className={`flex-1 text-sm ${isSelected ? "font-medium" : ""}`}
              style={
                node.type === "topic"
                  ? {
                      color: `rgb(${simpleTopicColor(parseInt(node.id))[0]}, ${simpleTopicColor(parseInt(node.id))[1]}, ${simpleTopicColor(parseInt(node.id))[2]})`,
                    }
                  : {}
              }
              onClick={
                hasChildren ? () => toggleNodeExpansion(nodeKey) : handleToggle
              }
            >
              {node.name}
            </span>

            <span className="text-xs capitalize text-gray-500">
              {node.type}
            </span>
          </div>

          {hasChildren && isExpanded && (
            <div>
              {node
                .children!.sort((a, b) => a.name.localeCompare(b.name))
                .map((child) => renderTreeNode(child, depth + 1, nodeKey))}
            </div>
          )}
        </div>
      );
    },
    [
      expandedNodes,
      isNodeSelected,
      handleDomainToggle,
      handleFieldToggle,
      handleSubfieldToggle,
      handleTopicToggle,
      toggleNodeExpansion,
      simpleTopicColor,
    ],
  );

  const topicPredicate = useCallback(
    (projectId: string): boolean => {
      if (
        !lookupMaps ||
        (selectedSets.domains.size === 0 &&
          selectedSets.fields.size === 0 &&
          selectedSets.subfields.size === 0 &&
          selectedSets.topics.size === 0)
      ) {
        return true;
      }

      const projectDomain = lookupMaps.projectDomainMap.get(projectId);
      const projectField = lookupMaps.projectFieldMap.get(projectId);
      const projectSubfield = lookupMaps.projectSubfieldMap.get(projectId);
      const projectTopic = lookupMaps.projectTopicMap.get(projectId);

      return !!(
        (projectDomain && selectedSets.domains.has(projectDomain)) ||
        (projectField && selectedSets.fields.has(projectField)) ||
        (projectSubfield && selectedSets.subfields.has(projectSubfield)) ||
        (projectTopic && selectedSets.topics.has(projectTopic))
      );
    },
    [lookupMaps, selectedSets],
  );

  const TopicFilter = (
    <div className="space-y-4">
      <H6 className="text-center">Topics</H6>

      {/* Selection summary */}
      {selectedCounts.domains +
        selectedCounts.fields +
        selectedCounts.subfields +
        selectedCounts.topics >
        0 && (
        <div className="flex items-center justify-between rounded bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          <span>
            Selected: {selectedCounts.domains}d, {selectedCounts.fields}f,{" "}
            {selectedCounts.subfields}sf, {selectedCounts.topics}t
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllSelections}
            className="h-6 text-xs"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          placeholder="Search domains, fields, subfields, topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tree view */}
      <div className="max-h-96 overflow-y-auto rounded-md border dark:bg-gray-900">
        {filteredTreeData.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {searchQuery ? "No matching topics found" : "No topics available"}
          </div>
        ) : (
          <div className="p-2">
            {filteredTreeData.map((domain) => renderTreeNode(domain))}
          </div>
        )}
      </div>
    </div>
  );

  return {
    TopicFilter,
    topicPredicate,
    getTopicColor,
    selectedDomains,
    selectedFields,
    selectedSubfields,
    selectedTopics,
  };
};
