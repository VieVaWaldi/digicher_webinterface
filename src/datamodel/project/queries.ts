import { getConnection } from "core/database/connection";
import { Project, ProjectCoordinatorPoint } from "./types";

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
  const pool = getConnection();
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
  const pool = getConnection();
  const result = await pool.query<Project>(SELECT_PROJECT_BY_ID, [id]);
  return result.rows[0];
}
