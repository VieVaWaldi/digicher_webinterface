import { getConnection } from "core/database/connection";
import { Topic } from "datamodel/topic/types";

const SELECT_TOPIC = `
  SELECT id, name, level 
  FROM topics
  ORDER BY level, id;`;

export async function getTopics(): Promise<Topic[]> {
  const pool = getConnection();
  const result = await pool.query<Topic>(SELECT_TOPIC);
  return result.rows;
}
