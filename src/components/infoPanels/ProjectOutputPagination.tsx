// import { useProjectsByInstitution } from "hooks/queries/project/useProjectsByInstitution";
// import {
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   FileText,
//   Link,
// } from "lucide-react";
// import React, { useState } from "react";
// import { H6, Small } from "shadcn/typography";
//
// interface ProjectOutputPaginationProps {
//   institutionId: string;
//   className?: string;
// }
//
// const Spinner = () => (
//   <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
// );
//
// const LoadingState = () => (
//   <div className="flex items-center justify-center p-8">
//     <Spinner />
//   </div>
// );
//
// const ProjectOutputPagination: React.FC<ProjectOutputPaginationProps> = ({
//   institutionId,
//   className = "",
// }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const offset = (currentPage - 1) * itemsPerPage;
//
//   const {
//     data: response,
//     isPending: isPendingProjects,
//     error: errorProjects,
//   } = useProjectsByInstitution({
//     institutionId: institutionId || "",
//     limit: itemsPerPage,
//     offset: offset,
//   });
//
//   const projects = response?.data || [];
//   const totalCount = response?.totalCount || 0;
//   const totalPages = response?.totalPages || 0;
//   const hasMore = response?.hasMore || false;
//
//   const formatDate = (date: string | null) => {
//     if (!date) return "N/A";
//     return new Date(date).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };
//
//   const hasNextPage = hasMore;
//   const hasPrevPage = currentPage > 1;
//
//   const handleNextPage = () => {
//     if (hasNextPage) {
//       setCurrentPage(currentPage + 1);
//     }
//   };
//
//   const handlePrevPage = () => {
//     if (hasPrevPage) {
//       setCurrentPage(currentPage - 1);
//     }
//   };
//
//   if (errorProjects) {
//     return (
//       <div className={`space-y-4 ${className}`}>
//         <H6 className="!pb-0">Projects</H6>
//         <div className="py-8 text-center">
//           <Small className="text-red-500">Error loading projects</Small>
//         </div>
//       </div>
//     );
//   }
//
//   return (
//     <div className={`space-y-4 overflow-hidden ${className}`}>
//       <H6 className="!pb-0">Projects</H6>
//
//       {isPendingProjects ? (
//         <LoadingState />
//       ) : (
//         <>
//           {/* Pagination Controls */}
//           {totalCount > 0 && (
//             <div className="flex items-center justify-between py-2">
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={handlePrevPage}
//                   disabled={!hasPrevPage}
//                   className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition-colors ${
//                     hasPrevPage
//                       ? "text-blue-600 hover:bg-blue-50 hover:text-blue-800"
//                       : "cursor-not-allowed text-gray-400"
//                   }`}
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                   Previous
//                 </button>
//
//                 <span className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
//                   {currentPage}
//                 </span>
//
//                 <button
//                   onClick={handleNextPage}
//                   disabled={!hasNextPage}
//                   className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition-colors ${
//                     hasNextPage
//                       ? "text-blue-600 hover:bg-blue-50 hover:text-blue-800"
//                       : "cursor-not-allowed text-gray-400"
//                   }`}
//                 >
//                   Next
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>
//               <Small className="text-gray-500">
//                 Page {currentPage} of {totalPages} ({totalCount} total)
//               </Small>
//             </div>
//           )}
//
//           {/* Projects List */}
//           {projects.length === 0 ? (
//             <div className="py-8 text-center">
//               <Small className="text-gray-500">
//                 No projects found for this institution
//               </Small>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {projects.scenarios((item, index) => (
//                 <div
//                   key={`${item.doi || index}`}
//                   className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
//                 >
//                   <div className="space-y-2">
//                     {/* Title */}
//                     <div className="flex items-start gap-2">
//                       <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
//                       <div className="min-w-0 flex-1">
//                         <p className="break-words text-sm font-medium text-gray-900">
//                           {item.title || "Untitled Project"}
//                         </p>
//                       </div>
//                     </div>
//
//                     {/* Date and DOI */}
//                     <div className="flex items-center gap-4 text-xs text-gray-500">
//                       {item.date && (
//                         <div className="flex items-center gap-1">
//                           <Calendar className="h-3 w-3" />
//                           <span>{formatDate(item.date)}</span>
//                         </div>
//                       )}
//
//                       {item.doi && (
//                         <div className="flex min-w-0 items-center gap-1">
//                           <Link className="h-3 w-3 flex-shrink-0" />
//                           <span className="break-all">DOI: {item.doi}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };
//
// export default ProjectOutputPagination;
