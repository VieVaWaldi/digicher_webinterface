import { getConnection } from "core/database/connection";
import { InstitutionFundingProgrammes, InstitutionTopics } from "./types";

const SELECT_INSTITUTIONS_TOPICS = `
  SELECT *
  FROM mat_institutions_topics;`;

export async function getInstitutionsTopics(): Promise<InstitutionTopics[]> {
  const pool = getConnection();
  const result = await pool.query<InstitutionTopics>(
    SELECT_INSTITUTIONS_TOPICS,
  );
  return result.rows;
}

const SELECT_INSTITUTION_FUNDING_PROGRAMME = `
  SELECT *
  FROM mat_institutions_fundingprogrammes;`;

export async function getInstitutionsFundingProgrammes(): Promise<
  InstitutionFundingProgrammes[]
> {
  const pool = getConnection();
  const result = await pool.query<InstitutionFundingProgrammes>(
    SELECT_INSTITUTION_FUNDING_PROGRAMME,
  );
  return result.rows;
}
