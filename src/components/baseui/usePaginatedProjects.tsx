import { ColumnDef } from "@tanstack/react-table";
import {
  ProjectTableItem,
  useTableViewProject,
} from "hooks/queries/views/table/useTableViewProject";
import { Calendar, Globe, Hash, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "shadcn/badge";
import { useDebounce } from "use-debounce";
import { PaginatedTable } from "./PaginatedTableComponent";

interface UsePaginatedProjectsProps {
  minYear?: number;
  maxYear?: number;
  projectSearchQuery?: string;
  selectedFrameworkProgrammes?: string[];
  selectedDomains?: string[];
  selectedFields?: string[];
  selectedSubfields?: string[];
  selectedTopics?: number[];
}

interface UsePaginatedProjectsReturn {
  ProjectsPaginated: React.ComponentType;
  isLoading: boolean;
  error: any;
  totalCount: number;
}

export function usePaginatedProjects({
  minYear,
  maxYear,
  projectSearchQuery,
  selectedFrameworkProgrammes,
  selectedDomains,
  selectedFields,
  selectedSubfields,
  selectedTopics,
}: UsePaginatedProjectsProps): UsePaginatedProjectsReturn {
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<"title" | "start_date" | "relevance">(
    "start_date",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [debouncedFilters] = useDebounce(
    {
      minYear,
      maxYear,
      projectSearchQuery,
      selectedFrameworkProgrammes,
      selectedDomains,
      selectedFields,
      selectedSubfields,
      selectedTopics,
    },
    300,
  );

  const queryParams = useMemo(
    () => ({
      minYear: debouncedFilters.minYear,
      maxYear: debouncedFilters.maxYear,
      search: debouncedFilters.projectSearchQuery,
      frameworkProgrammes: debouncedFilters.selectedFrameworkProgrammes,
      domainIds: debouncedFilters.selectedDomains,
      fieldIds: debouncedFilters.selectedFields,
      subfieldIds: debouncedFilters.selectedSubfields,
      topicIds: debouncedFilters.selectedTopics?.map((t) => t.toString()),
      page,
      limit: 25,
      sortBy,
      sortOrder,
    }),
    [debouncedFilters, page, sortBy, sortOrder],
  );

  const { data, isPending, error } = useTableViewProject(queryParams);

  const columns: ColumnDef<ProjectTableItem>[] = useMemo(() => {
    const baseColumns: ColumnDef<ProjectTableItem>[] = [
      {
        accessorKey: "acronym",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-500" />
            <span>Acronym</span>
          </div>
        ),
        cell: ({ row }) => {
          const acronym = row.getValue("acronym") as string;
          return acronym ? (
            <Badge variant="secondary" className="font-mono">
              {acronym}
            </Badge>
          ) : (
            <span className="text-sm text-gray-400">N/A</span>
          );
        },
        size: 120,
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span>Project Title</span>
          </div>
        ),
        cell: ({ row }) => {
          const title = row.getValue("title") as string;
          return (
            <div className="max-w-md">
              <p
                className="line-clamp-2 cursor-help font-medium text-gray-900 transition-all hover:line-clamp-none"
                title={title}
              >
                {title}
              </p>
            </div>
          );
        },
        size: 400,
      },
      {
        accessorKey: "start_date",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Start Date</span>
          </div>
        ),
        cell: ({ row }) => {
          const startDate = row.getValue("start_date") as string;
          if (!startDate)
            return <span className="text-sm text-gray-400">N/A</span>;

          const date = new Date(startDate);
          return (
            <div className="text-sm">
              <div className="font-medium">
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          );
        },
        size: 120,
      },
    ];

    if (sortBy === "relevance" && projectSearchQuery) {
      baseColumns.push({
        accessorKey: "rank",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gray-500" />
            <span>Relevance</span>
          </div>
        ),
        cell: ({ row }) => {
          const rank = row.getValue("rank") as number;
          if (typeof rank === "number") {
            return (
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 font-mono text-xs text-blue-700"
              >
                {rank.toFixed(3)}
              </Badge>
            );
          }
          return <span className="text-sm text-gray-400">N/A</span>;
        },
        size: 100,
      });
    }

    return baseColumns;
  }, [sortBy, projectSearchQuery]);

  const sortOptions = useMemo(() => {
    const baseOptions = [
      { value: "title", label: "Title" },
      { value: "start_date", label: "Start Date" },
    ];

    if (projectSearchQuery) {
      baseOptions.push({ value: "relevance", label: "Relevance" });
    }

    return baseOptions;
  }, [projectSearchQuery]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as "title" | "start_date" | "relevance");
    setPage(0);
  };

  const handleSortOrderChange = (newSortOrder: "asc" | "desc") => {
    setSortOrder(newSortOrder);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const ProjectsPaginated = () => (
    <PaginatedTable<ProjectTableItem>
      data={data?.data || []}
      columns={columns}
      loading={isPending}
      error={error}
      currentPage={page}
      totalPages={data?.pagination.totalPages || 0}
      totalCount={data?.pagination.total || 0}
      onPageChange={handlePageChange}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={handleSortChange}
      onSortOrderChange={handleSortOrderChange}
      sortOptions={sortOptions}
      title="Projects"
      icon={<Globe className="h-5 w-5 text-gray-600" />}
      itemsPerPage={25}
    />
  );

  return {
    ProjectsPaginated,
    isLoading: isPending,
    error,
    totalCount: data?.pagination.total || 0,
  };
}
