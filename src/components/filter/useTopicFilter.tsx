"use client";

import { useProjectTopicsEnriched } from "hooks/queries/topic/useProjectTopicsEnriched";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Box, IconButton, Checkbox, Typography, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { SearchBar } from "components/mui/SearchBar";

interface TopicTreeNode {
  id: string;
  name: string;
  type: "field" | "subfield" | "topic";
  children?: TopicTreeNode[];
  count?: number;
}

interface SelectedCounts {
  fields: number;
  subfields: number;
  topics: number;
}

interface TopicFilterResult {
  TopicFilter: ReactNode;
  topicPredicate: (projectId: string) => boolean;
  getTopicColor: (projectId: string) => [number, number, number, number];
  selectedFields: string[];
  selectedSubfields: string[];
  selectedTopics: number[];
}

export const useTopicFilter = (
  defaultOpenSubfieldId: string | null = null,
): TopicFilterResult => {
  const enrichedData = useProjectTopicsEnriched();

  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedSubfields, setSelectedSubfields] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const { treeData, lookupMaps } = useMemo(() => {
    if (!enrichedData?.length) return { treeData: [], lookupMaps: null };

    const projectFieldMap = new Map<string, string>();
    const projectSubfieldMap = new Map<string, string>();
    const projectTopicMap = new Map<string, number>();

    const fieldMap = new Map<string, TopicTreeNode>();
    const subfieldMap = new Map<string, TopicTreeNode>();
    const topicMap = new Map<string, TopicTreeNode>();

    enrichedData.forEach(({ project_id, topic }) => {
      if (!topic) return;

      projectFieldMap.set(project_id, topic.field_id);
      projectSubfieldMap.set(project_id, topic.subfield_id);
      projectTopicMap.set(project_id, topic.id);

      // Use field_id as key (fields are now top-level)
      if (!fieldMap.has(topic.field_id)) {
        const fieldNode: TopicTreeNode = {
          id: topic.field_id,
          name: topic.field_name,
          type: "field",
          children: [],
        };
        fieldMap.set(topic.field_id, fieldNode);
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
        fieldMap.get(topic.field_id)!.children!.push(subfieldNode);
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

    const sortedTreeData = Array.from(fieldMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return {
      treeData: sortedTreeData,
      lookupMaps: {
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
          pathToExpand.add(parentKey); // Add parent field key
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
      fields: new Set(selectedFields),
      subfields: new Set(selectedSubfields),
      topics: new Set(selectedTopics),
    }),
    [selectedFields, selectedSubfields, selectedTopics],
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
      fields: selectedFields.length,
      subfields: selectedSubfields.length,
      topics: selectedTopics.length,
    }),
    [selectedFields, selectedSubfields, selectedTopics],
  );

  const clearAllSelections = useCallback(() => {
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
        <Box key={nodeKey} sx={{ userSelect: "none" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: 1,
              px: 1,
              py: 0.5,
              pl: `${depth * 16 + 8}px`,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpansion(nodeKey);
                }}
                sx={{ p: 0, width: 20, height: 20 }}
              >
                {isExpanded ? (
                  <ExpandMoreIcon sx={{ fontSize: 16 }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            ) : (
              <Box sx={{ width: 20 }} />
            )}

            <Checkbox
              checked={isSelected}
              onChange={handleToggle}
              size="small"
              icon={<CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />}
              checkedIcon={<CheckBoxIcon sx={{ fontSize: 18 }} />}
              sx={{ p: 0 }}
            />

            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontWeight: isSelected ? 500 : 400,
                color:
                  node.type === "topic"
                    ? `rgb(${simpleTopicColor(parseInt(node.id))[0]}, ${simpleTopicColor(parseInt(node.id))[1]}, ${simpleTopicColor(parseInt(node.id))[2]})`
                    : "text.primary",
              }}
              onClick={
                hasChildren ? () => toggleNodeExpansion(nodeKey) : handleToggle
              }
            >
              {node.name}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                textTransform: "capitalize",
                color: "text.secondary",
              }}
            >
              {node.type}
            </Typography>
          </Box>

          {hasChildren && isExpanded && (
            <Box>
              {node
                .children!.sort((a, b) => a.name.localeCompare(b.name))
                .map((child) => renderTreeNode(child, depth + 1, nodeKey))}
            </Box>
          )}
        </Box>
      );
    },
    [
      expandedNodes,
      isNodeSelected,
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
        (selectedSets.fields.size === 0 &&
          selectedSets.subfields.size === 0 &&
          selectedSets.topics.size === 0)
      ) {
        return true;
      }

      const projectField = lookupMaps.projectFieldMap.get(projectId);
      const projectSubfield = lookupMaps.projectSubfieldMap.get(projectId);
      const projectTopic = lookupMaps.projectTopicMap.get(projectId);

      return !!(
        (projectField && selectedSets.fields.has(projectField)) ||
        (projectSubfield && selectedSets.subfields.has(projectSubfield)) ||
        (projectTopic && selectedSets.topics.has(projectTopic))
      );
    },
    [lookupMaps, selectedSets],
  );

  const TopicFilter = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Selection summary */}
      {selectedCounts.fields +
        selectedCounts.subfields +
        selectedCounts.topics >
        0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 1,
            backgroundColor: "action.hover",
            p: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Selected: {selectedCounts.fields}, {selectedCounts.subfields},{" "}
            {selectedCounts.topics}
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={clearAllSelections}
            sx={{ minWidth: "auto", fontSize: "0.75rem" }}
          >
            Clear
          </Button>
        </Box>
      )}

      {/* Search input */}
      <SearchBar
        placeholder="Search fields, subfields, topics..."
        value={searchQuery}
        onSearch={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      {/* Tree view */}
      <Box>
        {filteredTreeData.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? "No matching topics found" : "No topics available"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 1 }}>
            {filteredTreeData.map((field) => renderTreeNode(field))}
          </Box>
        )}
      </Box>
    </Box>
  );

  return {
    TopicFilter,
    topicPredicate,
    getTopicColor,
    selectedFields,
    selectedSubfields,
    selectedTopics,
  };
};
