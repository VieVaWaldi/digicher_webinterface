import { BasePoint } from "datamodel/scenario_points/types";
import { ReactNode, useState, useEffect } from "react";
import { H4, H5 } from "shadcn/typography";
import { Spinner } from "shadcn/spinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "shadcn/pagination";

// Generic fetch hook type that works with any result type
type UseSearchHook<T> = (searchTerm: string) => {
  data: T[] | undefined;
  loading: boolean;
  error: string | null;
};

interface SearchComponentConfig<T> {
  useSearchHook: UseSearchHook<T>;
  idField: keyof T & string;
  displayField: keyof T & string;
  searchLabel?: string;
  placeholderText?: string;
  idPredicate?: string; // The field name in BasePoint to match against
}

interface SearchComponentResult {
  PaginatedResults: ReactNode;
  searchPredicate: (point: BasePoint) => boolean;
}

export default function useSearchComponent<T>({
  useSearchHook,
  idField,
  displayField,
  searchLabel = "Search",
  placeholderText = "Search...",
  idPredicate = idField,
}: SearchComponentConfig<T>): SearchComponentResult {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedTerm, setDebouncedTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults, loading, error } = useSearchHook(debouncedTerm);

  // Extract IDs from search results
  const resultIds: (string | number)[] =
    searchResults?.map((result) => String(result[idField])) ?? [];

  // Calculate pagination values
  const totalResults = searchResults?.length || 0;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = searchResults?.slice(startIndex, endIndex) || [];

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
    }
  };

  // Generate pagination numbers
  const getPaginationItems = () => {
    const items = [];
    const maxPagesShown = 5; // Maximum number of page links to show

    if (totalPages <= maxPagesShown) {
      // Show all pages if there are fewer than maxPagesShown
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            isActive={currentPage === 1}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );

      // Calculate start and end of shown pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust to show 3 pages in the middle
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-2">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      // Always show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            isActive={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  const PaginatedResults = (
    <div className="flex flex-col space-y-4">
      <H4 className="mb-2 ml-2">{searchLabel}</H4>

      <div className="mb-2">
        <textarea
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className="w-full resize-none rounded border p-2"
          rows={2}
        />
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="p-2 text-red-500">Error loading results: {error}</div>
      )}

      {!loading && searchResults && (
        <>
          <div className="flex items-center justify-between px-2">
            <H5 className="text-gray-500">{totalResults} results</H5>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) => Math.max(1, prev - 1));
                        }}
                      />
                    </PaginationItem>
                  )}

                  {getPaginationItems()}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          );
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto rounded border">
            {currentPageItems.length > 0 ? (
              currentPageItems.map((item) => (
                <div
                  key={String(item[idField])}
                  className="border-b p-3 last:border-b-0 hover:bg-gray-100"
                >
                  {String(item[displayField])}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {debouncedTerm
                  ? "No matching results found"
                  : "Enter a search term"}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const searchPredicate = (point: BasePoint): boolean => {
    if (!debouncedTerm || debouncedTerm.length === 0) {
      return true;
    }
    if (!searchResults || searchResults.length === 0) {
      return true;
    }
    // @ts-expect-error - We're accessing a dynamic property
    return resultIds.includes(String(point[idPredicate]));
  };

  return { PaginatedResults, searchPredicate };
}
