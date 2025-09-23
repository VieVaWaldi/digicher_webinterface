import { ColumnDef } from "@tanstack/react-table";
import {
  ResearchOutputTableItem,
  useTableViewResearchOutput,
} from "hooks/queries/views/table/useTableViewResearchOutput";
import { BookOpen, Calendar, FileText, Trophy } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { Badge } from "shadcn/badge";
import { useDebounce } from "use-debounce";
import { PaginatedTable } from "./PaginatedTableComponent";

interface UsePaginatedResearchOutputsProps {
  icon: ReactNode;
  minYear?: number;
  maxYear?: number;
  researchOutputSearchQuery?: string;
  onResearchOutputClick?: (researchOutput: ResearchOutputTableItem) => void;
}

interface UsePaginatedResearchOutputsReturn {
  ResearchOutputsPaginated: React.ComponentType;
  isLoading: boolean;
  error: any;
  totalCount: number;
}

export function usePaginatedResearchOutputs({
  icon,
  minYear,
  maxYear,
  researchOutputSearchQuery,
  onResearchOutputClick,
}: UsePaginatedResearchOutputsProps): UsePaginatedResearchOutputsReturn {
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<
    "title" | "publication_date" | "relevance"
  >("publication_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [debouncedFilters] = useDebounce(
    {
      minYear,
      maxYear,
      researchOutputSearchQuery,
    },
    300,
  );

  const queryParams = useMemo(
    () => ({
      minYear: debouncedFilters.minYear,
      maxYear: debouncedFilters.maxYear,
      search: debouncedFilters.researchOutputSearchQuery,
      page,
      limit: 25,
      sortBy,
      sortOrder,
    }),
    [debouncedFilters, page, sortBy, sortOrder],
  );

  const { data, isPending, error } = useTableViewResearchOutput(queryParams);

  const columns: ColumnDef<ResearchOutputTableItem>[] = useMemo(() => {
    const baseColumns: ColumnDef<ResearchOutputTableItem>[] = [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <span>Title</span>
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
        accessorKey: "publication_date",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Publication Date</span>
          </div>
        ),
        cell: ({ row }) => {
          const publicationDate = row.getValue("publication_date") as string;
          if (!publicationDate)
            return <span className="text-sm text-gray-400">N/A</span>;

          const date = new Date(publicationDate);
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
        size: 140,
      },
      {
        accessorKey: "doi",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>DOI</span>
          </div>
        ),
        cell: ({ row }) => {
          const doi = row.getValue("doi") as string;
          if (!doi) return <span className="text-sm text-gray-400">N/A</span>;

          return (
            <div className="text-sm">
              <a
                href={`https://doi.org/${doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {doi}
              </a>
            </div>
          );
        },
        size: 200,
      },
    ];

    if (sortBy === "relevance" && researchOutputSearchQuery) {
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
  }, [sortBy, researchOutputSearchQuery]);

  const sortOptions = useMemo(() => {
    const baseOptions = [
      { value: "title", label: "Title" },
      { value: "publication_date", label: "Publication Date" },
    ];

    if (researchOutputSearchQuery) {
      baseOptions.push({ value: "relevance", label: "Relevance" });
    }

    return baseOptions;
  }, [researchOutputSearchQuery]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as "title" | "publication_date" | "relevance");
    setPage(0);
  };

  const handleSortOrderChange = (newSortOrder: "asc" | "desc") => {
    setSortOrder(newSortOrder);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const ResearchOutputsPaginated = () => (
    <PaginatedTable<ResearchOutputTableItem>
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
      title="Research Outputs"
      icon={<div className="h-5 w-5 text-gray-600">{icon}</div>}
      itemsPerPage={25}
      onRowClick={onResearchOutputClick}
    />
  );

  return {
    ResearchOutputsPaginated,
    isLoading: isPending,
    error,
    totalCount: data?.pagination.total || 0,
  };
}
