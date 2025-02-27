import { getConnection } from "core/database/connection";

import { Project, ProjectFundingProgrammes, ProjectTopics } from "./types";

/** Project */

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

function SELECT_PROJECTS_BY_IDS(ids: string): string {
  return `
  SELECT *
  FROM Projects
  WHERE id IN (${ids});`;
}

export async function getProjectsByIds(ids: string): Promise<Project[]> {
  try {
    const pool = getConnection();
    const result = await pool.query<Project>(SELECT_PROJECTS_BY_IDS(ids));
    return result.rows;
  } catch (e) {
    console.log(e);
    throw Error;
  }
}

/** Project Topics */

const SELECT_PROJECTS_TOPICS = `
  SELECT 
    p.id as project_id,
    array_agg(DISTINCT t.id) as topic_ids
  FROM projects AS p
  LEFT JOIN projects_topics AS pt ON pt.project_id = p.id
  LEFT JOIN topics AS t ON pt.topic_id = t.id
  GROUP BY p.id;
`;

export async function getProjectsTopics(): Promise<ProjectTopics[]> {
  const pool = getConnection();
  const result = await pool.query<ProjectTopics>(SELECT_PROJECTS_TOPICS);
  return result.rows;
}

/** Project Funding Programmes */

const SELECT_PROJECT_FUNDING_PROGRAMME = `
  SELECT 
    p.id as project_id,
    array_agg(DISTINCT f.id) as funding_ids
  FROM projects AS p
  LEFT JOIN projects_fundingprogrammes AS pf ON pf.project_id = p.id
  LEFT JOIN fundingprogrammes AS f ON pf.fundingprogramme_id = f.id
  GROUP BY p.id;
`;

export async function getProjectsFundingProgrammes(): Promise<
  ProjectFundingProgrammes[]
> {
  const pool = getConnection();
  const result = await pool.query<ProjectFundingProgrammes>(
    SELECT_PROJECT_FUNDING_PROGRAMME,
  );
  return result.rows;
}
