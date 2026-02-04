// import { InstitutionType } from "db/schemas/core";
// import { useInstitutionById } from "hooks/queries/institution/useInstitutionById";
// import { useProjectbyId } from "hooks/queries/project/useProjectById";
// import {
//   Award,
//   Banknote,
//   Book,
//   Building2,
//   Calendar,
//   ChevronDown,
//   ChevronUp,
//   ClipboardCheck,
//   ExternalLink,
//   Hash,
//   Link,
//   MapPin,
//   Target,
//   Users,
// } from "lucide-react";
// import React, { useState } from "react";
// import { H6, Lead, Small } from "shadcn/typography";
// import ResearchOutputPagination from "./ResesearchOutputPagination";
//
// interface ProjectViewInfoPanelProps {
//   institution_id?: string | null;
//   project_id?: string | null;
//   // institution?: InstitutionType | null;
//   // project?: ProjectType | null;
//   // isPendingInstitution?: boolean;
//   // isPendingProject?: boolean;
//   // className?: string;
// }
//
// const Spinner = () => (
//   <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
// );
//
// const LoadingState = () => (
//   <div className="rounded-lg bg-white p-4 shadow-lg">
//     <Spinner />
//   </div>
// );
//
// const ProjectInfoPanel: React.FC<ProjectViewInfoPanelProps> = ({
//   institution_id,
//   project_id,
// }) => {
//   const [showProjectDetails, setShowProjectDetails] = useState(false);
//
//   const { data: project, isPending: isPendingProject } = useProjectbyId(
//     project_id || "",
//     {
//       enabled: !!project_id,
//     },
//   );
//
//   const { data: institution, isPending: isPendingInstitution } =
//     useInstitutionById(institution_id || "", {
//       enabled: !!institution_id,
//     });
//
//   const formatDate = (date: Date | string | null) => {
//     if (!date) return "N/A";
//     return new Date(date).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//     });
//   };
//
//   const formatCurrency = (amount: number | null) => {
//     if (!amount) return "N/A";
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "EUR",
//       notation: "compact",
//       maximumFractionDigits: 1,
//     }).format(amount);
//   };
//
//   const getStatusColor = (status: string | null) => {
//     if (!status) return "bg-gray-200 text-gray-600";
//     switch (status.toLowerCase()) {
//       case "signed":
//         return "bg-green-100 text-green-800";
//       case "active":
//         return "bg-blue-100 text-blue-800";
//       case "completed":
//         return "bg-purple-100 text-purple-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };
//
//   const formatAddress = (institution: InstitutionType) => {
//     const parts = [
//       institution.street,
//       institution.city,
//       institution.country,
//     ].filter(Boolean);
//
//     if (institution.nuts_level_3) {
//       parts.push(`(${institution.nuts_level_3})`);
//     }
//
//     return parts.join(", ") || "N/A";
//   };
//
//   const isCordisProject = project?.source_system?.toLowerCase() === "cordis";
//   const isOpenAireProject =
//     project?.source_system?.toLowerCase() === "openaire";
//
//   return (
//     <div className={`space-y-6 overflow-hidden`}>
//       {/* Institution Section */}
//
//       {institution_id && (
//         <div className="space-y-4">
//           {isPendingInstitution ? (
//             <LoadingState />
//           ) : institution ? (
//             <>
//               <div>
//                 <H6 className="!pb-0">
//                   {institution.legal_name || "Unknown Institution"}
//                 </H6>
//                 {institution.alternative_names &&
//                   institution.alternative_names.length > 0 && (
//                     <Small className="mt-1 text-gray-500">
//                       Also known as: {institution.alternative_names.join(", ")}
//                     </Small>
//                   )}
//               </div>
//
//               <div className="space-y-3">
//                 {institution.url && (
//                   <div className="flex items-center gap-2">
//                     <ExternalLink className="h-4 w-4 text-gray-400" />
//                     <a
//                       href={institution.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-sm text-blue-600 underline hover:text-blue-800"
//                     >
//                       {institution.url}
//                     </a>
//                   </div>
//                 )}
//
//                 <div className="flex items-start gap-2">
//                   <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
//                   <div className="text-sm">
//                     <p className="text-gray-500">Address</p>
//                     <p>{formatAddress(institution)}</p>
//                   </div>
//                 </div>
//
//                 <div className="flex items-center gap-6">
//                   {institution.type_title && (
//                     <div className="flex items-center gap-2">
//                       <Building2 className="h-4 w-4 text-gray-400" />
//                       <div className="text-sm">
//                         <p className="text-gray-500">Type</p>
//                         <p>{institution.type_title}</p>
//                       </div>
//                     </div>
//                   )}
//
//                   {institution.sme !== null && (
//                     <div className="flex items-center gap-2">
//                       <Users className="h-4 w-4 text-gray-400" />
//                       <div className="text-sm">
//                         <p className="text-gray-500">SME</p>
//                         <p>{institution.sme ? "Yes" : "No"}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//
//                 {institution.source_system && (
//                   <div className="text-xs text-gray-400">
//                     Source: {institution.source_system}
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             <div className="py-4 text-center">
//               <Small className="text-gray-400">
//                 No institution data available
//               </Small>
//             </div>
//           )}
//           <div className="border-t border-gray-200" />
//         </div>
//       )}
//
//       {/* Project Section */}
//       <div className="space-y-4">
//         {isPendingProject ? (
//           <LoadingState />
//         ) : project ? (
//           <>
//             <div className="flex items-start justify-between gap-2">
//               <div className="flex-1">
//                 <H6 className="!pb-0">{project.title || "Untitled Project"}</H6>
//                 <div className="mt-2 flex items-center gap-4">
//                   {project.acronym && (
//                     <Lead className="!mt-0 text-sm font-medium text-orange-500">
//                       {project.acronym}
//                     </Lead>
//                   )}
//                   {project.doi && (
//                     <div className="flex items-center gap-1">
//                       <Link className="h-3 w-3 text-gray-400" />
//                       <Small className="text-gray-500">
//                         DOI: {project.doi}
//                       </Small>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <Calendar className="h-4 w-4 text-gray-400" />
//                 <div>
//                   <p className="font-medium">
//                     {formatDate(project.start_date)} -{" "}
//                     {formatDate(project.end_date)}
//                   </p>
//                 </div>
//               </div>
//
//               {project.status && (
//                 <div className="flex items-center gap-2">
//                   <ClipboardCheck className="h-4 w-4 text-gray-400" />
//                   <div>
//                     {project.status && (
//                       <span
//                         className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
//                           project.status,
//                         )}`}
//                       >
//                         {project.status}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//
//             <button
//               onClick={() => setShowProjectDetails(!showProjectDetails)}
//               className="flex items-center gap-2 text-sm text-blue-600 transition-colors hover:text-blue-800"
//             >
//               {showProjectDetails ? (
//                 <>
//                   <ChevronUp className="h-4 w-4" />
//                   Show less
//                 </>
//               ) : (
//                 <>
//                   <ChevronDown className="h-4 w-4" />
//                   See more
//                 </>
//               )}
//             </button>
//
//             {showProjectDetails && (
//               <div className="space-y-4 border-t border-gray-100 pt-4">
//                 {project.objective && (
//                   <div className="flex items-start gap-2">
//                     <Target className="mt-1 h-4 w-4 text-gray-400" />
//                     <div>
//                       <p className="text-sm text-gray-500">Objective</p>
//                       <p className="text-justify text-sm">
//                         {project.objective}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   {project.total_cost && (
//                     <div className="flex items-center gap-2">
//                       <Banknote className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-gray-500">Total Cost</p>
//                         <p className="font-medium">
//                           {formatCurrency(project.total_cost)}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//
//                   {project.ec_max_contribution && (
//                     <div className="flex items-center gap-2">
//                       <Award className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-gray-500">EC Contribution</p>
//                         <p className="font-medium">
//                           {formatCurrency(project.ec_max_contribution)}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//
//                   {project.funded_amount && (
//                     <div className="flex items-center gap-2">
//                       <Banknote className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-gray-500">Funded Amount</p>
//                         <p className="font-medium">
//                           {formatCurrency(project.funded_amount)}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//
//                   {project.funder_total_cost && (
//                     <div className="flex items-center gap-2">
//                       <Award className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-gray-500">Funder Total Cost</p>
//                         <p className="font-medium">
//                           {formatCurrency(project.funder_total_cost)}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//
//                   {project.ec_signature_date && (
//                     <div className="flex items-center gap-2">
//                       <ClipboardCheck className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-gray-500">EC Signature Date</p>
//                         <p className="font-medium">
//                           {formatDate(project.ec_signature_date)}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//
//                   {project.duration && (
//                     <div className="flex items-center gap-2">
//                       <Calendar className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-gray-500">Duration</p>
//                         <p className="font-medium">{project.duration}</p>
//                       </div>
//                     </div>
//                   )}
//
//                   {project.id_original && (
//                     <div className="flex items-center gap-2">
//                       <Hash className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-gray-500">Original ID</p>
//                         <p className="font-medium">{project.id_original}</p>
//                       </div>
//                     </div>
//                   )}
//
//                   {project.id_openaire && (
//                     <div className="flex items-center gap-2">
//                       <Hash className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-gray-500">OpenAIRE ID</p>
//                         <p className="font-medium">{project.id_openaire}</p>
//                       </div>
//                     </div>
//                   )}
//
//                   {project.code && (
//                     <div className="flex items-center gap-2">
//                       <Hash className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-gray-500">Code</p>
//                         <p className="font-medium">{project.code}</p>
//                       </div>
//                     </div>
//                   )}
//
//                   {project.website_url && (
//                     <div className="col-span-2 flex items-center gap-2">
//                       <ExternalLink className="h-4 w-4 text-gray-400" />
//                       <div className="min-w-0">
//                         <p className="text-gray-500">Website</p>
//                         <a
//                           href={project.website_url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="break-all font-medium text-blue-600 underline hover:text-blue-800"
//                         >
//                           {project.website_url}
//                         </a>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//
//                 {/* Source-specific information */}
//                 {isCordisProject &&
//                   (project.call_title ||
//                     project.call_identifier ||
//                     project.call_rcn) && (
//                     <div className="rounded-lg bg-blue-50 p-4">
//                       <div className="mb-2 flex items-center gap-2">
//                         <Book className="h-4 w-4 text-blue-500" />
//                         <span className="text-sm font-medium text-blue-700">
//                           Call Information (CORDIS)
//                         </span>
//                       </div>
//                       <div className="space-y-1 text-sm">
//                         {project.call_title && (
//                           <div>
//                             <span className="text-gray-600">Title: </span>
//                             <span className="text-gray-800">
//                               {project.call_title}
//                             </span>
//                           </div>
//                         )}
//                         {project.call_identifier && (
//                           <div>
//                             <span className="text-gray-600">Identifier: </span>
//                             <span className="text-gray-800">
//                               {project.call_identifier}
//                             </span>
//                           </div>
//                         )}
//                         {project.call_rcn && (
//                           <div>
//                             <span className="text-gray-600">RCN: </span>
//                             <span className="text-gray-800">
//                               {project.call_rcn}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//
//                 {isOpenAireProject &&
//                   (project.funder_name ||
//                     project.funder_jurisdiction ||
//                     project.currency) && (
//                     <div className="rounded-lg bg-green-50 p-4">
//                       <div className="mb-2 flex items-center gap-2">
//                         <Award className="h-4 w-4 text-green-500" />
//                         <span className="text-sm font-medium text-green-700">
//                           Funder Information (OpenAIRE)
//                         </span>
//                       </div>
//                       <div className="space-y-1 text-sm">
//                         {project.funder_name && (
//                           <div>
//                             <span className="text-gray-600">Funder: </span>
//                             <span className="text-gray-800">
//                               {project.funder_name}
//                             </span>
//                             {project.funder_short_name && (
//                               <span className="text-gray-600">
//                                 {" "}
//                                 ({project.funder_short_name})
//                               </span>
//                             )}
//                           </div>
//                         )}
//                         {project.funder_jurisdiction && (
//                           <div>
//                             <span className="text-gray-600">
//                               Jurisdiction:{" "}
//                             </span>
//                             <span className="text-gray-800">
//                               {project.funder_jurisdiction}
//                             </span>
//                           </div>
//                         )}
//                         {project.currency && (
//                           <div>
//                             <span className="text-gray-600">Currency: </span>
//                             <span className="text-gray-800">
//                               {project.currency}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//
//                 {project.keywords && (
//                   <div>
//                     <p className="mb-1 text-sm text-gray-500">Keywords</p>
//                     <p className="text-sm">{project.keywords}</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="py-4 text-center">
//             <Small className="text-gray-400">No project data available</Small>
//           </div>
//         )}
//       </div>
//
//       {/* Research Output Section */}
//       <div className="border-t border-gray-200" />
//
//       <ResearchOutputPagination projectId={project?.id || ""} />
//     </div>
//   );
// };
//
// export default ProjectInfoPanel;
