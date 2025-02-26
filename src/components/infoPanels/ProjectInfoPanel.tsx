import React from "react";

import {
  Award,
  Banknote,
  Book,
  Calendar,
  ClipboardCheck,
  Hash,
  Link,
  Target,
} from "lucide-react";

import { H3, Lead } from "shadcn/typography";
import { Project } from "datamodel/project/types";
import { CardContent, CardFooter, CardHeader } from "shadcn/card";

import BaseInfoPanel from "./BaseInfoPanel";

interface ProjectInfoPanelProps {
  project: Project;
  className?: string;
  objectiveMaxHeightSm?: string;
  objectiveMaxHeightMd?: string;
}

const ProjectInfoPanel = ({
  project,
  className = "",
}: ProjectInfoPanelProps) => {
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-200";
    switch (status.toLowerCase()) {
      // case "active":
      //   return "bg-green-100 text-green-800";
      // case "completed":
      //   return "bg-blue-100 text-blue-800";
      case "signed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <BaseInfoPanel className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {project.acronym && (
              <Lead className="!mt-0 mb-1 block text-sm font-medium text-orange-500">
                {project.acronym}
              </Lead>
            )}
            <H3 className="!pb-0">{project.title}</H3>
          </div>
          {project.status && (
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                project.status,
              )}`}
            >
              {project.status}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {project.objective && (
          <div className="text-justify">
            <div className="flex items-start gap-2">
              <Target className="mt-1 h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">{project.objective}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-medium">
                {formatDate(project.start_date)} -{" "}
                {formatDate(project.end_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Budget</p>
              <p className="font-medium">
                {formatCurrency(project.total_cost)}
              </p>
            </div>
          </div>

          {project.ec_max_contribution && (
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-gray-500">EC Contribution</p>
                <p className="font-medium">
                  {formatCurrency(project.ec_max_contribution)}
                </p>
              </div>
            </div>
          )}

          {project.ec_signature_date && (
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-gray-500">EC Signature Date</p>
                <p className="font-medium">
                  {formatDate(project.ec_signature_date)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Project ID</p>
              <p className="font-medium">{project.id_original}</p>
            </div>
          </div>

          {project.doi_id && (
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-gray-500">(DOI id in DataSet)</p>
                <p className="font-medium">{project.doi_id}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {(project.call_title || project.call_identifier || project.call_rcn) && (
        <CardFooter className="mt-4 flex-col space-y-2 bg-gray-50 p-4 text-sm text-gray-600">
          <div className="flex w-full items-center gap-2">
            <Book className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className="font-medium">Call Information</span>
          </div>
          {project.call_title && (
            <div className="ml-6">
              <span className="text-gray-500">Title: </span>
              {project.call_title}
            </div>
          )}
          {project.call_identifier && (
            <div className="ml-6">
              <span className="text-gray-500">Identifier: </span>
              {project.call_identifier}
            </div>
          )}
          {project.call_rcn && (
            <div className="ml-6">
              <span className="text-gray-500">RCN: </span>
              {project.call_rcn}
            </div>
          )}
        </CardFooter>
      )}
    </BaseInfoPanel>
  );
};

const formatDate = (date: Date | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
};

const formatCurrency = (amount: number | null) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};

export default ProjectInfoPanel;
