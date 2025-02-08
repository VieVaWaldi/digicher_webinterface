import { getConnection } from "core/database/connection";
import { Project, ProjectCoordinatorPoint } from "./types";

/* SCENARIO | Project Coordinators Globe */

const SELECT_PROJECTS_COORDINATOR = `
  SELECT * 
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
