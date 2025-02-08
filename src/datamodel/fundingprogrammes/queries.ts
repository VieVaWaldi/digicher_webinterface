import { getConnection } from "core/database/connection";
import { Topic } from "datamodel/topic/types";
import { FundingProgramme } from "./types";

const SELECT_TOPIC = `
  SELECT id, name, level 
  FROM topics
  ORDER BY level, id;`;

export async function getTopics(): Promise<Topic[]> {
  const pool = getConnection();
  const result = await pool.query<Topic>(SELECT_TOPIC);
  return result.rows;
}

const SELECT_FUNDING_PROGRAMME = `
  SELECT id, code, framework_programme
  FROM fundingprogrammes
  ORDER BY framework_programme, code;`;

export async function getFungingProgrammes(): Promise<FundingProgramme[]> {
  const pool = getConnection();
  const result = await pool.query<FundingProgramme>(SELECT_FUNDING_PROGRAMME);
  return result.rows;
}
