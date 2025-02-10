import { FundingProgramme } from "datamodel/fundingprogrammes/types";
import { Topic } from "datamodel/topic/types";

export interface Institution {
  id: number;
  name: string;
  sme: boolean | null;
  address_street: string | null;
  address_city: string | null;
  address_country: string | null;
  address_geolocation: number[] | null;
  url: string | null;
  short_name: string | null;
}

/** Scenario Institutions */

export interface InstitutionPoint {
  id: number;
  address_geolocation: number[];
  sme: boolean | null;
  address_country: string | null;
  topics?: Topic[];
  funding_programmes?: FundingProgramme[];
  total_eu_funding: string | null; // NO
}

export interface InstitutionFundingPoint {
  id: number;
  address_geolocation: number[];
  total_eu_funding: string | null;
  number_of_projects: string;
  address_country: string | null;
  avg_project_funding: string | null;
  topics?: Topic[];
  sme: boolean | null; // NO
  funding_programmes?: FundingProgramme[];
}

export interface InstitutionCollaborationWeights {
  institution_id: number;
  institution_name: string;
  address_geolocation: number[];
  collaboration_weight: number;
}

export interface InstitutionCollaborators {
  collaborator_id: number;
  collaborator_name: string;
  collaborator_geolocation: number[];
}

// export interface InstitutionTopics {
//   institution_id: number;
//   institution_name: string;
//   address_geolocation: number[];
//   topic: string[];
// }
