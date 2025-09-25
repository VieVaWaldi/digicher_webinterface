import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import * as React from "react";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shadcn/select";
import { Spinner } from "shadcn/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "shadcn/table";

export interface PaginatedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: any;

  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;

  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string) => void;
  onSortOrderChange: (sortOrder: "asc" | "desc") => void;

  sortOptions: Array<{ value: string; label: string }>;

  title?: string;
  icon?: ReactNode;
  itemsPerPage?: number;

  onRowClick?: (item: T) => void;

  onDownload?: () => void;
  isDownloading: boolean;
}

export function PaginatedTable<T>({
  data,
  columns,
  loading = false,
  error,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  onSortOrderChange,
  sortOptions,
  title = "Table",
  icon,
  itemsPerPage = 25,
  onRowClick,
  onDownload,
  isDownloading,
}: PaginatedTableProps<T>) {
  const [stableStats, setStableStats] = useState({
    totalCount,
    totalPages,
    currentPage,
  });

  useEffect(() => {
    if (!loading && totalCount > 0 && totalPages > 0) {
      setStableStats({
        totalCount,
        totalPages,
        currentPage,
      });
    }
  }, [loading, totalCount, totalPages, currentPage]);

  const displayStats =
    loading && stableStats.totalCount > 0
      ? stableStats
      : {
          totalCount,
          totalPages,
          currentPage,
        };

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: sortBy,
      desc: sortOrder === "desc",
    },
  ]);

  useEffect(() => {
    setSorting([
      {
        id: sortBy,
        desc: sortOrder === "desc",
      },
    ]);
  }, [sortBy, sortOrder]);

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;

      setSorting(newSorting);

      if (newSorting.length > 0) {
        const sort = newSorting[0];
        onSortChange(sort.id);
        onSortOrderChange(sort.desc ? "desc" : "asc");
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2">
          {icon || <Globe className="h-5 w-5 text-red-600" />}
          <h2 className="text-lg font-semibold text-red-800">{title}</h2>
        </div>
        <p className="mt-2 text-red-600">Error loading data: {error.message}</p>
      </div>
    );
  }

  const startItem = displayStats.currentPage * itemsPerPage + 1;
  const endItem = Math.min(
    (displayStats.currentPage + 1) * itemsPerPage,
    displayStats.totalCount,
  );

  const getSortIcon = (isSorted: false | "asc" | "desc") => {
    if (isSorted === "asc") return "↑";
    if (isSorted === "desc") return "↓";
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {icon || <Globe className="h-5 w-5 text-gray-600" />}
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              side="bottom"
              sideOffset={5}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
            }
            className="flex items-center gap-1"
            disabled={loading}
          >
            {getSortIcon(sortOrder === "asc" ? "asc" : "desc")}
          </Button>
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-600">
          {loading && displayStats.totalCount === 0 ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Loading...
            </div>
          ) : (
            `Showing ${startItem}-${endItem} of ${displayStats.totalCount.toLocaleString()} results`
          )}
        </div>
      </div>

      {onDownload && (
        <div className="flex">
          {!loading && (
            <Button onClick={onDownload} className="" variant="default">
              Download
            </Button>
          )}
          {isDownloading && (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Loading...
            </div>
          )}
        </div>
      )}

      {/* Pagination Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(displayStats.currentPage - 1)}
          disabled={displayStats.currentPage === 0 || loading}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            Page {displayStats.currentPage + 1} of {displayStats.totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(displayStats.currentPage + 1)}
          disabled={
            displayStats.currentPage >= displayStats.totalPages - 1 || loading
          }
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-medium">
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="h-6 w-6" />
                    <span className="text-gray-500">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="transition-colors hover:bg-gray-50/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
