import { Card, CardContent } from "../card";
import { Institution } from "lib/types";

interface InstitutionCardProps {
  institution: Institution;
  className?: string;
}

const InstitutionCard = ({
  institution,
  className = "",
}: InstitutionCardProps) => {
  return (
    <Card
      className={`p-0 max-w-xs bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 ${className}`}
    >
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1 text-gray-900">
          {institution.name}
        </h3>
        {institution.short_name && (
          <p className="text-sm text-blue-600 mb-3">{institution.short_name}</p>
        )}
        <div className="space-y-2 text-sm">
          {(institution.address_street ||
            institution.address_city ||
            institution.address_country) && (
            <div className="flex items-start space-x-2 text-gray-600">
              <svg
                className="w-4 h-4 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {[
                  institution.address_street,
                  institution.address_city,
                  institution.address_country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          {institution.sme && (
            <div className="flex items-center space-x-2 text-green-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>SME Verified</span>
            </div>
          )}
          {institution.url && (
            <a
              href={institution.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>Visit Website</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstitutionCard;
