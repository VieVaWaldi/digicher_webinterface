import { H4 } from "shadcn/typography";

interface FundingInfoBoxProps {
  count: number;
  totalFunding: number;
  showInstitutions: boolean;
}

export function FundingInfoBox({
  count,
  totalFunding,
  showInstitutions,
}: FundingInfoBoxProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">
        This scenario displays funding data as geographical bars on the map.
        Toggle between two views: Institutions shows all institutions with bar
        heights representing their total received funding. Projects displays
        project locations based on their coordinator institution, with bar
        heights showing each projects total funding.
      </div>
      <div className="text-lg font-medium">
        Displaying {count.toLocaleString()}{" "}
        <span className="font-semibold text-orange-400">
          {showInstitutions ? "Institutions" : "Projects"}
        </span>{" "}
        with{" "}
        <span className="font-semibold text-orange-400">
          {new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(totalFunding)}
        </span>
      </div>
    </div>
  );
}

export interface FundingTitleProps {
  count: number;
  showInstitutions: boolean;
  totalFunding: number;
}

export function FundingTitle({
  count,
  showInstitutions = false,
  totalFunding = 0,
}: FundingTitleProps) {
  // return <H4>Funding Map ({count.toLocaleString()})</H4>;
  return (
    <span>
      Displaying {count}{" "}
      <span className="font-semibold text-orange-400">
        {showInstitutions ? "Institutions" : "Projects"}{" "}
      </span>{" "}
      with{" "}
      <span className="font-semibold text-orange-400">
        {new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(totalFunding)}
      </span>
    </span>
  );
}
