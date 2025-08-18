import { getConnection } from "core/database/connection";

import {
  Project,
  ProjectFundingProgrammes,
  ProjectSearchResult,
  ProjectTopics,
} from "./types";

/** Project */

const SELECT_PROJECT_BY_ID = `
  SELECT *
  FROM core.project
  WHERE id = $1;
`;

export async function getProjectById(id: string): Promise<Project> {
  const pool = getConnection();
  const result = await pool.query<Project>(SELECT_PROJECT_BY_ID, [id]);
  return result.rows[0];
}

// function SELECT_PROJECTS_BY_IDS(ids: string): string {
//   return `
//   SELECT *
//   FROM core.project
//   WHERE id IN (${ids});`;
// }

export async function getProjectsByIds(ids: string): Promise<Project[]> {
  console.log(ids);
  try {
    const pool = getConnection();
    const idArray = ids.split(",");
    const placeholders = idArray.map((_, index) => `$${index + 1}`).join(",");
    const query = `SELECT * FROM core.project WHERE id IN (${placeholders})`;
    const result = await pool.query<Project>(query, idArray);
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
  FROM core.project AS p
  LEFT JOIN core.j_project_topic AS pt ON pt.project_id = p.id
  LEFT JOIN core.topic AS t ON pt.topic_id = t.id
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
  FROM core.project AS p
  LEFT JOIN core.j_project_fundingprogramme AS pf ON pf.project_id = p.id
  LEFT JOIN core.fundingprogramme AS f ON pf.fundingprogramme_id = f.id
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

/** Project Search */

const SELECT_PROJECTS_SEARCH = `
  SELECT 
    id AS project_id, 
    title
  FROM core.project
  WHERE 1=1
  $CONDITIONS;`;

export async function searchProjects(
  title: string,
): Promise<ProjectSearchResult[]> {
  try {
    const pool = getConnection();

    const searchTerms = title
      .toLowerCase()
      .split(" ")
      .filter((term) => term.trim() !== "");

    let conditions = "";
    const params: string[] = [];

    if (searchTerms.length > 0) {
      searchTerms.forEach((term, index) => {
        params.push(term);
        conditions += ` AND (
          lower(title) LIKE '%' || $${index + 1} || '%' OR 
          lower(acronym) LIKE '%' || $${index + 1} || '%' OR 
          lower(objective) LIKE '%' || $${index + 1} || '%'
        )`;
      });
    }

    // Replace the placeholder in the query with the conditions
    const query = SELECT_PROJECTS_SEARCH.replace("$CONDITIONS", conditions);

    const result = await pool.query<ProjectSearchResult>(query, params);
    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
