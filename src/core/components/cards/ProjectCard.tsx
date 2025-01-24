import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "core/components/shadcn/card";
import { Calendar, Banknote, Award } from "lucide-react";
import { Project } from "datamodel/project/types";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

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

const ProjectCard = ({ project, className = "" }: ProjectCardProps) => {
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-200";
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            {project.acronym && (
              <span className="mb-1 block text-sm font-medium text-gray-500">
                {project.acronym}
              </span>
            )}
            <CardTitle className="line-clamp-2 text-xl font-bold text-gray-900">
              {project.title}
            </CardTitle>
          </div>
          {project.status && (
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                project.status,
              )}`}
            >
              {project.status}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {project.objective && (
          <CardDescription className="line-clamp-3 text-gray-600">
            {project.objective}
          </CardDescription>
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
        </div>
      </CardContent>

      {(project.call_title || project.call_identifier) && (
        <CardFooter className="mt-4 bg-gray-50 text-sm text-gray-600">
          <Award className="mr-2 h-4 w-4" />
          <span className="line-clamp-1">
            {project.call_title || project.call_identifier}
          </span>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProjectCard;
