import { getConnection } from "core/database/connection";

import { Topic } from "./types";

const SELECT_TOPIC = `
  SELECT id, name, level 
  FROM core.topic
  ORDER BY level, id;`;

export async function getTopics(): Promise<Topic[]> {
  const pool = getConnection();
  const result = await pool.query<Topic>(SELECT_TOPIC);
  return result.rows;
}
