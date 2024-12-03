import { Pool } from "pg";
import {
  InstitutionCollaborators,
  Institution,
  InstitutionCollaborationWeights,
  InstitutionECNetFunding,
  InstitutionSmePoint,
  Project,
  ProjectCoordinatorPoint,
} from "lib/types";

if (
  !process.env.POSTGRES_USER ||
  !process.env.POSTGRES_HOST ||
  !process.env.POSTGRES_DATABASE ||
  !process.env.POSTGRES_PORT
) {
  throw new Error("Missing database configuration");
}

export const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD || "",
  port: parseInt(process.env.POSTGRES_PORT),
});

/* SCENARIO | Institutions SME Map */

const SELECT_INSTITUTION_SME_POINTS = `
  SELECT 
      id, sme, address_geolocation
  FROM institutions
  WHERE address_geolocation IS NOT NULL;`;

export async function getInstitutionPoints(): Promise<InstitutionSmePoint[]> {
  const result = await pool.query<InstitutionSmePoint>(
    SELECT_INSTITUTION_SME_POINTS
  );
  return result.rows;
}

const SELECT_INSTITUTION = `
  SELECT *
  FROM institutions
  WHERE id = $1 AND
  address_geolocation IS NOT NULL;`;

export async function getInstitutionById(id: number): Promise<Institution> {
  const result = await pool.query<Institution>(SELECT_INSTITUTION, [id]);
  return result.rows[0];
}

/* SCENARIO | Project Coordinators Globe */

const SELECT_PROJECT_COORDINATORS_BY_YEAR = `
  SELECT 
      p.id AS project_id,
      i.id AS coordinator_id,
      i.address_geolocation AS coordinator_location
  FROM 
      Projects p
      INNER JOIN Projects_Institutions pi ON p.id = pi.project_id
      INNER JOIN Institutions i ON pi.institution_id = i.id
  WHERE 
      pi.type = 'coordinator'
      AND $1 BETWEEN EXTRACT(YEAR FROM p.start_date) 
                  AND EXTRACT(YEAR FROM p.end_date)
      AND i.address_geolocation IS NOT NULL;`;

export async function getProjectCoordinatorsByYear(
  year: number
): Promise<ProjectCoordinatorPoint[]> {
  const date = `${year}`;
  const result = await pool.query<ProjectCoordinatorPoint>(
    SELECT_PROJECT_COORDINATORS_BY_YEAR,
    [date]
  );
  return result.rows;
}

const SELECT_PROJECT_BY_ID = `
  SELECT *
  FROM Projects
  WHERE id = $1;
`;

export async function getProjectById(id: number): Promise<Project> {
  const result = await pool.query<Project>(SELECT_PROJECT_BY_ID, [id]);
  return result.rows[0];
}

/* SCENARIO | Institution EC net Funding */

const SELECT_INSTITUTION_ECNET_FUNDING = `
  SELECT * FROM institution_ecnet_funding
  WHERE total_eu_funding != 0;
`;

export async function getInstitutionECNetFunding(): Promise<
  InstitutionECNetFunding[]
> {
  const result = await pool.query<InstitutionECNetFunding>(
    SELECT_INSTITUTION_ECNET_FUNDING
  );
  return result.rows;
}

/* Institution Collaboration */

const SELECT_INSTITUTION_COLLABORATION_WEIGHTS = `
  SELECT * FROM institution_collaboration_weights;
`;

export async function getInstitutionCollaborationWeights(): Promise<
  InstitutionCollaborationWeights[]
> {
  const result = await pool.query<InstitutionCollaborationWeights>(
    SELECT_INSTITUTION_COLLABORATION_WEIGHTS
  );
  return result.rows;
}

const SELECT_INSTITUTION_COLLABORATORS = `
  SELECT * FROM get_institution_collaborators($1);
`;

export async function getInstititutionCollaborators(id: number): Promise<InstitutionCollaborators[]> {
  const result = await pool.query<InstitutionCollaborators>(
    SELECT_INSTITUTION_COLLABORATORS,
    [id]
  );
  return result.rows;
}
