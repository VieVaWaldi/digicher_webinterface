import { getConnection } from "core/database/connection";

import {
  FundingInstitutionPoint,
  FundingProjectPoint,
  InstitutionCollaborationWeights,
  InstitutionCollaborators,
  InstitutionPoint,
  ProjectCoordinatorPoint,
} from "./types";

/** 1. Institution Scenario */

const SELECT_INSTITUTION_POINTS = `
  SELECT 
      id as institution_id, 
      address_geolocation as geolocation,
      sme as is_sme,
      address_country as country_code
  FROM institutions
  WHERE address_geolocation IS NOT NULL;`;

export async function getInstitutionPoints(): Promise<InstitutionPoint[]> {
  const pool = getConnection();
  const result = await pool.query<InstitutionPoint>(SELECT_INSTITUTION_POINTS);
  return result.rows;
}

/** 2. Project Scenario */

const SELECT_PROJECTS_COORDINATOR = `
  SELECT 
    project_id,
    coordinator_id as institution_id,
    start_date,
    end_date,
    address_geolocation as geolocation,
    address_country as country_code
  FROM mat_projects_coordinator
  WHERE address_geolocation IS NOT NULL;
`;

export async function getProjectsCoordinatorPoints(): Promise<
  ProjectCoordinatorPoint[]
> {
  const pool = getConnection();
  const result = await pool.query<ProjectCoordinatorPoint>(
    SELECT_PROJECTS_COORDINATOR,
  );
  return result.rows;
}

/** 3. Funding Scenario */

const SELECT_FUNDING_INSTITUTIONS = `
  SELECT 
    id as institution_id,
    address_geolocation as geolocation,
    address_country as country_code,
    total_eu_funding as total_cost,
    number_of_projects,
    avg_project_funding
  FROM mat_institution_funding
  WHERE total_eu_funding != 0;
`;

export async function getFundingInstitutionPoints(): Promise<
  FundingInstitutionPoint[]
> {
  const pool = getConnection();
  const result = await pool.query<FundingInstitutionPoint>(
    SELECT_FUNDING_INSTITUTIONS,
  );
  return result.rows;
}

const SELECT_FUNDING_PROJECTS = `
  SELECT 
    project_id,
    coordinator_id as institution_id,
    address_geolocation as geolocation,
    address_country as country_code,
    total_cost 
  FROM mat_projects_coordinator
  WHERE address_geolocation IS NOT NULL;
`;

export async function getFundingProjectPoints(): Promise<
  FundingProjectPoint[]
> {
  const pool = getConnection();
  const result = await pool.query<FundingProjectPoint>(SELECT_FUNDING_PROJECTS);
  return result.rows;
}

/** 4. Funding Scenario */

// WIP

const SELECT_INSTITUTION_COLLABORATION_WEIGHTS = `
  SELECT
    institution_id,
    institution_name as name,
    address_geolocation as geolocation,
    collaboration_weight
  FROM institution_collaboration_weights;
`;

export async function getInstitutionCollaborationWeights(): Promise<
  InstitutionCollaborationWeights[]
> {
  const pool = getConnection();
  const result = await pool.query<InstitutionCollaborationWeights>(
    SELECT_INSTITUTION_COLLABORATION_WEIGHTS,
  );
  return result.rows;
}

const SELECT_INSTITUTION_COLLABORATORS = `
  SELECT
    collaborator_id as institution_id,
    collaborator_name as name,
    collaborator_location as geolocation
  FROM get_institution_collaborators($1);
`;

export async function getInstititutionCollaborators(
  id: number,
): Promise<InstitutionCollaborators[]> {
  const pool = getConnection();
  const result = await pool.query<InstitutionCollaborators>(
    SELECT_INSTITUTION_COLLABORATORS,
    [id],
  );
  return result.rows;
}
