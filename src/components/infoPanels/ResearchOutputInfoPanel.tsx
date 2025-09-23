import { useResearchoutputbyId } from "hooks/queries/researchoutput/useResearchOutputById";
import {
  BookOpen,
  Calendar,
  FileText,
  Globe,
  Hash,
  Link,
  MessageSquare,
  Tag,
} from "lucide-react";
import React from "react";
import { H6, Small } from "shadcn/typography";

interface ResearchOutputInfoPanelProps {
  researchOutputId?: string | null;
}

const Spinner = () => (
  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
);

const LoadingState = () => (
  <div className="rounded-lg bg-white p-4 shadow-lg">
    <Spinner />
  </div>
);

const ResearchOutputInfoPanel: React.FC<ResearchOutputInfoPanelProps> = ({
  researchOutputId,
}) => {
  const { data: researchOutput, isPending } = useResearchoutputbyId(
    researchOutputId || "",
    {
      enabled: !!researchOutputId,
    },
  );

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 overflow-hidden">
      {isPending ? (
        <LoadingState />
      ) : researchOutput ? (
        <>
          <div>
            <H6 className="!pb-0">
              {researchOutput.title || "Untitled Research Output"}
            </H6>
            {researchOutput.type && (
              <Small className="mt-1 text-gray-500">
                Type: {researchOutput.type}
              </Small>
            )}
          </div>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              {researchOutput.publication_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Publication Date</p>
                    <p className="font-medium">
                      {formatDate(researchOutput.publication_date)}
                    </p>
                  </div>
                </div>
              )}

              {researchOutput.language_code && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Language</p>
                    <p className="font-medium">
                      {researchOutput.language_code.toUpperCase()}
                    </p>
                  </div>
                </div>
              )}

              {researchOutput.publisher && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Publisher</p>
                    <p className="font-medium">{researchOutput.publisher}</p>
                  </div>
                </div>
              )}

              {researchOutput.issn && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">ISSN</p>
                    <p className="font-medium">{researchOutput.issn}</p>
                  </div>
                </div>
              )}
            </div>

            {/* DOI */}
            {researchOutput.doi && (
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-gray-400" />
                <div className="min-w-0">
                  <p className="text-gray-500">DOI</p>
                  <a
                    href={`https://doi.org/${researchOutput.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-medium text-blue-600 underline hover:text-blue-800"
                  >
                    {researchOutput.doi}
                  </a>
                </div>
              </div>
            )}

            {/* Abstract */}
            {researchOutput.abstract && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-500">Abstract</p>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg bg-gray-50 p-3">
                  <p className="text-justify text-sm leading-relaxed">
                    {researchOutput.abstract}
                  </p>
                </div>
              </div>
            )}

            {/* Comment */}
            {researchOutput.comment && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-500">Comment</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm">{researchOutput.comment}</p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 rounded-lg bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-500">Metadata</p>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                {researchOutput.source_system && (
                  <div>
                    <span className="font-medium">Source System: </span>
                    <span>{researchOutput.source_system}</span>
                  </div>
                )}
                {researchOutput.original_id && (
                  <div>
                    <span className="font-medium">Original ID: </span>
                    <span className="font-mono">
                      {researchOutput.original_id}
                    </span>
                  </div>
                )}
                {researchOutput.updated_date && (
                  <div>
                    <span className="font-medium">Last Updated: </span>
                    <span>{formatDate(researchOutput.updated_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="py-4 text-center">
          <Small className="text-gray-400">
            No research output data available
          </Small>
        </div>
      )}
    </div>
  );
};

export default ResearchOutputInfoPanel;
