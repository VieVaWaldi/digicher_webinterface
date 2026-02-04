// import { InstitutionType } from "db/schemas/core";
// import { useInstitutionById } from "hooks/queries/institution/useInstitutionById";
// import { Building2, ExternalLink, MapPin, Users } from "lucide-react";
// import React from "react";
// import { H6, Small } from "shadcn/typography";
// import ProjectOutputPagination from "./ProjectOutputPagination";
//
// interface InstitutionInfoPanelProps {
//   institution_id?: string | null;
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
// const InstitutionInfoPanel: React.FC<InstitutionInfoPanelProps> = ({
//   institution_id,
// }) => {
//   const { data: institution, isPending: isPendingInstitution } =
//     useInstitutionById(institution_id || "", {
//       enabled: !!institution_id,
//     });
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
//   return (
//     <div className="space-y-6 overflow-hidden">
//       {/* Institution Section */}
//       <div className="space-y-4">
//         {isPendingInstitution ? (
//           <LoadingState />
//         ) : institution ? (
//           <>
//             <div>
//               <H6 className="!pb-0">
//                 {institution.legal_name || "Unknown Institution"}
//               </H6>
//               {institution.alternative_names &&
//                 institution.alternative_names.length > 0 && (
//                   <Small className="mt-1 text-gray-500">
//                     Also known as: {institution.alternative_names.join(", ")}
//                   </Small>
//                 )}
//             </div>
//
//             <div className="space-y-3">
//               {institution.url && (
//                 <div className="flex items-center gap-2">
//                   <ExternalLink className="h-4 w-4 text-gray-400" />
//                   <a
//                     href={institution.url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-sm text-blue-600 underline hover:text-blue-800"
//                   >
//                     {institution.url}
//                   </a>
//                 </div>
//               )}
//
//               <div className="flex items-start gap-2">
//                 <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
//                 <div className="text-sm">
//                   <p className="text-gray-500">Address</p>
//                   <p>{formatAddress(institution)}</p>
//                 </div>
//               </div>
//
//               <div className="flex items-center gap-6">
//                 {institution.type_title && (
//                   <div className="flex items-center gap-2">
//                     <Building2 className="h-4 w-4 text-gray-400" />
//                     <div className="text-sm">
//                       <p className="text-gray-500">Type</p>
//                       <p>{institution.type_title}</p>
//                     </div>
//                   </div>
//                 )}
//
//                 {institution.sme !== null && (
//                   <div className="flex items-center gap-2">
//                     <Users className="h-4 w-4 text-gray-400" />
//                     <div className="text-sm">
//                       <p className="text-gray-500">SME</p>
//                       <p>{institution.sme ? "Yes" : "No"}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//
//               {institution.source_system && (
//                 <div className="text-xs text-gray-400">
//                   Source: {institution.source_system}
//                 </div>
//               )}
//             </div>
//           </>
//         ) : (
//           <div className="py-4 text-center">
//             <Small className="text-gray-400">
//               No institution data available
//             </Small>
//           </div>
//         )}
//       </div>
//
//       {/* Divider */}
//       <div className="border-t border-gray-200" />
//
//       {/* Projects Section */}
//       <ProjectOutputPagination institutionId={institution_id || ""} />
//     </div>
//   );
// };
//
// export default InstitutionInfoPanel;
