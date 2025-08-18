import { FundingProgramme } from "datamodel/fundingprogramme/types";
import { Topic } from "datamodel/topic/types";

/**
 * The primary data in a Scenario is called Point.
 * All Points inherit from BasePoint.
 *
 * Interfaces with "type" define further sub classifications.
 */

export interface BasePoint {
  institution_id: number;
  project_id?: string;
  geolocation: number[];
  country_code: string | null;
  topics?: Topic[];
  funding_programmes?: FundingProgramme[];
}

/** 1. Institution Scenario */

export interface InstitutionPoint extends BasePoint {
  is_sme: boolean | null;
}

/** 2. Project Scenario */

export interface ProjectCoordinatorPoint extends BasePoint {
  start_date: Date;
  end_date: Date;
}

/** 3. Funding Scenario */

export interface FundingBasePoint extends BasePoint {
  total_cost: string | null;
}

export interface FundingInstitutionPoint extends FundingBasePoint {
  type: "institution";
  projects_funding: InstitutionProjectsFunding[];
}

export interface InstitutionProjectsFunding extends BasePoint {
  type: "institution_projects";
  ec_contribution: number | null; // not needed?
  net_ec_contribution: number | null;
  total_cost: number | null; // not needed?
  start_date: Date;
  // topic_ids: number[];
}

export interface FundingProjectPoint extends FundingBasePoint {
  type: "project";
}

/** 4. Collaboration Scenario */

export interface InstitutionCollaborationWeights extends BasePoint {
  collaboration_weight: number;
}

export interface InstitutionCollaborators extends BasePoint {
  type: "collaborator";
}
