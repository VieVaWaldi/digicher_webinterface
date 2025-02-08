import { FundingProgramme } from "datamodel/fundingprogrammes/types";
import { Topic } from "datamodel/topic/types";

export interface Project {
  id: number;
  id_original: string;
  doi_id: number | null;
  acronym: string | null;
  title: string;
  status: string | null;
  start_date: Date | null;
  end_date: Date | null;
  ec_signature_date: Date | null;
  total_cost: number | null;
  ec_max_contribution: number | null;
  objective: string | null;
  call_identifier: string | null;
  call_title: string | null;
  call_rcn: string | null;
}

export interface ProjectCoordinatorPoint {
  project_id: number;
  coordinator_id: number;
  address_geolocation: number[];
  address_country: string;
  start_date: Date;
  end_date: Date;
  topics?: Topic[];
  funding_programmes?: FundingProgramme[];
}
