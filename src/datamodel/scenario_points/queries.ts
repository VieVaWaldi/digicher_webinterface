import { getConnection } from "core/database/connection";

import {
  FundingInstitutionPoint,
  FundingProjectPoint,
  InstitutionCollaborationWeights,
  InstitutionCollaborators,
  InstitutionPoint,
  InstitutionProjectsFunding,
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
    projects_funding
  FROM mat_institution_funding
  WHERE address_geolocation IS NOT NULL;
`;

export async function getFundingInstitutionPoints(): Promise<
  FundingInstitutionPoint[]
> {
  const pool = getConnection();
  const result = await pool.query<FundingInstitutionPoint>(
    SELECT_FUNDING_INSTITUTIONS,
  );
  return result.rows.map((row) => ({
    ...row,
    projects_funding: parseProjectsFunding(row.projects_funding.toString()),
  }));
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

/** Data Parser Functions */

function parseProjectsFunding(
  project_funding_string: string,
): InstitutionProjectsFunding[] {
  const project_funding_clean = project_funding_string
    .replaceAll('{"', "")
    .replaceAll(')","', "")
    .replaceAll(')"}', "")
    .split("(");

  if (project_funding_clean[0] === "") {
    project_funding_clean.shift();
  }

  const projects_funding: InstitutionProjectsFunding[] = [];
  project_funding_clean.map((entry) => {
    const entries = entry.split(",");
    projects_funding.push({
      institution_id: 0,
      geolocation: [0, 0],
      country_code: "",
      project_id: parseInt(entries[0]),
      ec_contribution: parseInt(entries[1]) || null,
      net_ec_contribution: parseInt(entries[2]) || null,
      total_cost: parseInt(entries[3]) || null,
    });
  });

  return projects_funding;
}
