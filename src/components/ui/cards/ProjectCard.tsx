import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "../card";
import { Project } from "lib/types";
import { Calendar, Target, Banknote, Award } from "lucide-react";

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
      className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            {project.acronym && (
              <span className="text-sm font-medium text-gray-500 mb-1 block">
                {project.acronym}
              </span>
            )}
            <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
              {project.title}
            </CardTitle>
          </div>
          {project.status && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                project.status
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
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-medium">
                {formatDate(project.start_date)} -{" "}
                {formatDate(project.end_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-gray-400" />
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
        <CardFooter className="bg-gray-50 mt-4 text-sm text-gray-600">
          <Award className="w-4 h-4 mr-2" />
          <span className="line-clamp-1">
            {project.call_title || project.call_identifier}
          </span>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProjectCard;
