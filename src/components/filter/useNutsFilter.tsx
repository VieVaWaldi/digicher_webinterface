"use client";

import { ChevronDown, ChevronRight, X } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { Button } from "shadcn/button";
import { H6 } from "shadcn/typography";
import { cn } from "shadcn/utils/shadcn-utils";

interface NutsNode {
  code: string;
  name: string;
  level: number;
  children: NutsNode[];
  parent?: string;
}

interface NutsFilterResult {
  NutsFilter: ReactNode;
  nutsPredicate: (
    nuts_0: string | null,
    nuts_1: string | null,
    nuts_2: string | null,
    nuts_3: string | null,
  ) => boolean;
  buildNutsHierarchy: (
    data: Array<{
      nuts_0: string | null;
      nuts_1: string | null;
      nuts_2: string | null;
      nuts_3: string | null;
    }>,
  ) => NutsNode[];
}

export default function useNutsFilter(
  data: Array<{
    nuts_0: string | null;
    nuts_1: string | null;
    nuts_2: string | null;
    nuts_3: string | null;
  }> = [],
): NutsFilterResult {
  const [selectedNuts, setSelectedNuts] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build NUTS hierarchy from data
  const buildNutsHierarchy = (
    inputData: Array<{
      nuts_0: string | null;
      nuts_1: string | null;
      nuts_2: string | null;
      nuts_3: string | null;
    }>,
  ): NutsNode[] => {
    const nodeMap = new Map<string, NutsNode>();

    // Helper function to add node if it doesn't exist
    const addNode = (
      code: string,
      name: string,
      level: number,
      parent?: string,
    ) => {
      if (!nodeMap.has(code)) {
        nodeMap.set(code, {
          code,
          name: name || code, // Fallback to code if name is empty
          level,
          children: [],
          parent,
        });
      }
      return nodeMap.get(code)!;
    };

    // Process each data point
    inputData.forEach((item) => {
      const { nuts_0, nuts_1, nuts_2, nuts_3 } = item;

      if (nuts_0) {
        const node0 = addNode(nuts_0, nuts_0, 0);

        if (nuts_1) {
          const node1 = addNode(nuts_1, nuts_1, 1, nuts_0);
          if (!node0.children.find((c) => c.code === nuts_1)) {
            node0.children.push(node1);
          }

          if (nuts_2) {
            const node2 = addNode(nuts_2, nuts_2, 2, nuts_1);
            if (!node1.children.find((c) => c.code === nuts_2)) {
              node1.children.push(node2);
            }

            if (nuts_3) {
              const node3 = addNode(nuts_3, nuts_3, 3, nuts_2);
              if (!node2.children.find((c) => c.code === nuts_3)) {
                node2.children.push(node3);
              }
            }
          }
        }
      }
    });

    // Return only top-level nodes (NUTS 0)
    return Array.from(nodeMap.values())
      .filter((node) => node.level === 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const nutsHierarchy = useMemo(() => buildNutsHierarchy(data), [data]);

  // Get all parent codes for a given NUTS code
  const getParentCodes = (code: string, hierarchy: NutsNode[]): string[] => {
    const findNodeAndParents = (
      nodes: NutsNode[],
      targetCode: string,
      parents: string[] = [],
    ): string[] => {
      for (const node of nodes) {
        if (node.code === targetCode) {
          return [...parents, targetCode];
        }
        const found = findNodeAndParents(node.children, targetCode, [
          ...parents,
          node.code,
        ]);
        if (found.length > 0) return found;
      }
      return [];
    };

    const result = findNodeAndParents(hierarchy, code);
    return result.slice(0, -1); // Remove the target code itself, keep only parents
  };

  // Toggle node selection
  const toggleNode = (code: string) => {
    setSelectedNuts((prev) => {
      const isSelected = prev.includes(code);

      if (isSelected) {
        // Remove the code
        return prev.filter((c) => c !== code);
      } else {
        // const parents = getParentCodes(code, nutsHierarchy);
        // const newSelection = [...new Set([...prev, ...parents, code])];
        // return newSelection;
        return [...prev, code];
      }
    });
  };

  // Toggle expand/collapse
  const toggleExpand = (code: string) => {
    setExpandedNodes((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(code)) {
        newExpanded.delete(code);
      } else {
        newExpanded.add(code);
      }
      return newExpanded;
    });
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedNuts([]);
  };

  // Render tree node
  const renderNode = (node: NutsNode, depth: number = 0): ReactNode => {
    const isSelected = selectedNuts.includes(node.code);
    const isExpanded = expandedNodes.has(node.code);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.code} className="w-full">
        <div
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-muted/50",
            isSelected && "border border-primary/20 bg-primary/10",
          )}
          style={{ marginLeft: `${depth * 16}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.code);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-4" />
          )}

          <div className="flex-1 text-sm" onClick={() => toggleNode(node.code)}>
            <span
              className={cn("mr-2 font-medium", isSelected && "font-semibold")}
            >
              {node.code}
            </span>
            {/* <span className={cn(isSelected && "font-medium")}>{node.name}</span> */}
          </div>

          {isSelected && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.code);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const NutsFilter = (
    <div>
      <div className="pb-2">
        <H6 className="text-center">NUTS Regions</H6>
        {selectedNuts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {selectedNuts.length > 0 && (
        <div className="mb-3 rounded bg-muted/30 p-2 text-xs">
          <div className="mb-1 font-medium">
            Selected: {selectedNuts.length} region(s)
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedNuts.slice(0, 3).map((code) => (
              <span key={code} className="rounded bg-primary/20 px-1 font-mono">
                {code}
              </span>
            ))}
            {selectedNuts.length > 3 && (
              <span className="text-muted-foreground">
                +{selectedNuts.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="max-h-64 overflow-y-auto rounded border">
        {nutsHierarchy.map((node) => renderNode(node))}
      </div>
    </div>
  );

  const nutsPredicate = (
    nuts_0: string | null,
    nuts_1: string | null,
    nuts_2: string | null,
    nuts_3: string | null,
  ): boolean => {
    if (selectedNuts.length === 0) {
      return true;
    }

    // Check if any of the NUTS levels match the selected codes
    const nutsValues = [nuts_0, nuts_1, nuts_2, nuts_3].filter(Boolean);
    return nutsValues.some((nuts) => selectedNuts.includes(nuts!));
  };

  return { NutsFilter, nutsPredicate, buildNutsHierarchy };
}
