import { getConnection } from "core/database/connection";

import { FundingProgramme } from "./types";

const SELECT_FUNDING_PROGRAMME = `
  SELECT id, code, framework_programme
  FROM fundingprogrammes
  ORDER BY framework_programme, code;`;

export async function getFundingProgrammes(): Promise<FundingProgramme[]> {
  const pool = getConnection();
  const result = await pool.query<FundingProgramme>(SELECT_FUNDING_PROGRAMME);
  return result.rows;
}
