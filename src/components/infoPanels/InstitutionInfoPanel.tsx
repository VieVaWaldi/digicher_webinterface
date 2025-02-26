import React from "react";

import { CheckCircle, Globe, MapPin } from "lucide-react";

import { CardContent } from "shadcn/card";
import { H3, Lead } from "shadcn/typography";
import { Institution } from "datamodel/institution/types";

import BaseInfoPanel from "./BaseInfoPanel";

interface InstitutionInfoPanelProps {
  institution: Institution;
  className?: string;
}

const InstitutionInfoPanel = ({
  institution,
  className = "",
}: InstitutionInfoPanelProps) => {
  // Combine address components that exist
  const addressParts = [
    institution.street,
    institution.postbox && `PO Box ${institution.postbox}`,
    institution.postalcode,
    institution.city,
    institution.country,
  ].filter(Boolean);

  return (
    <BaseInfoPanel className={className}>
      <CardContent className="space-y-4 p-4">
        <div>
          <H3 className="!mb-1 !pb-0">{institution.name}</H3>
          {institution.short_name && (
            <Lead className="!text-sm text-orange-500">
              {institution.short_name}
            </Lead>
          )}
        </div>

        <div className="space-y-3 text-sm">
          {addressParts.length > 0 && (
            <div className="flex items-start space-x-2 text-gray-600">
              <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
              <span>{addressParts.join(", ")}</span>
            </div>
          )}

          {institution.is_sme && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>SME Verified</span>
            </div>
          )}

          {institution.url && (
            <a
              href={institution.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-orange-500 transition-colors hover:text-orange-800"
            >
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span>Visit Website</span>
            </a>
          )}

          {institution.geolocation && (
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>
                {institution.geolocation[0].toFixed(6)},{" "}
                {institution.geolocation[1].toFixed(6)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </BaseInfoPanel>
  );
};

export default InstitutionInfoPanel;
