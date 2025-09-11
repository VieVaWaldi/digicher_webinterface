import { getConnection } from "core/database/connection";
import {
  Institution,
  InstitutionFundingProgrammes,
  InstitutionSearchResult,
  InstitutionTopics,
} from "datamodel/institution/types";

/** Institution */

const SELECT_INSTITUTION_BY_ID = `
  SELECT 
    id AS institution_id, 
    legal_name,
    sme as is_sme,
    street,
    postbox,
    postalcode,
    city,
    country,
    geolocation,
    url,
    short_name
  FROM core.institution
  WHERE id = $1 AND
  geolocation IS NOT NULL;`;

export async function getInstitutionById(id: string): Promise<Institution> {
  const pool = getConnection();
  const result = await pool.query<Institution>(SELECT_INSTITUTION_BY_ID, [id]);
  return result.rows[0];
}

function SELECT_INSTITUTIONS_BY_IDS(ids: string): string {
  return `
  SELECT 
    id AS institution_id, 
    legal_name,
    sme as is_sme,
    street as street,
    postbox as postbox,
    postalcode as postalcode,
    city as city,
    country as country,
    geolocation as geolocation,
    url,
    short_name
  FROM core.institution
  WHERE id IN (${ids}) AND
  geolocation IS NOT NULL;`;
}

export async function getInstitutionsByIds(
  ids: string,
): Promise<Institution[]> {
  const pool = getConnection();
  const result = await pool.query<Institution>(SELECT_INSTITUTIONS_BY_IDS(ids));
  return result.rows;
}

/** Institution Topics */

const SELECT_INSTITUTIONS_TOPICS = `
  SELECT 
    institution_id,
    topic_ids
  FROM core_mats.mat_institutions_topics;`;

export async function getInstitutionsTopics(): Promise<InstitutionTopics[]> {
  const pool = getConnection();
  const result = await pool.query<InstitutionTopics>(
    SELECT_INSTITUTIONS_TOPICS,
  );
  return result.rows;
}

/** Institution Funding Programmes */

const SELECT_INSTITUTION_FUNDING_PROGRAMME = `
  SELECT 
    institution_id,
    funding_ids
  FROM core_mats.mat_institutions_fundingprogrammes;`;

export async function getInstitutionsFundingProgrammes(): Promise<
  InstitutionFundingProgrammes[]
> {
  const pool = getConnection();
  const result = await pool.query<InstitutionFundingProgrammes>(
    SELECT_INSTITUTION_FUNDING_PROGRAMME,
  );
  return result.rows;
}

/** Institution Search */

const SELECT_INSTITUTIONS_SEARCH = `
  SELECT 
    id AS institution_id, 
    legal_name
  FROM core.institution
  WHERE lower(legal_name) LIKE '%' || $1 || '%' AND
  geolocation IS NOT NULL;`;

export async function searchInstitutions(
  name: string,
): Promise<InstitutionSearchResult[]> {
  try {
    const pool = getConnection();
    const result = await pool.query<InstitutionSearchResult>(
      SELECT_INSTITUTIONS_SEARCH,
      [name.toLowerCase()],
    );
    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
