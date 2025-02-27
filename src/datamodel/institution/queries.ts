import { getConnection } from "core/database/connection";
import {
  Institution,
  InstitutionFundingProgrammes,
  InstitutionTopics,
} from "datamodel/institution/types";

/** Institution */

const SELECT_INSTITUTION_BY_ID = `
  SELECT 
    id AS institution_id, 
    name,
    sme as is_sme,
    address_street as street,
    address_postbox as postbox,
    address_postalcode as postalcode,
    address_city as city,
    address_country as country,
    address_geolocation as geolocation,
    url,
    short_name
  FROM institutions
  WHERE id = $1 AND
  address_geolocation IS NOT NULL;`;

export async function getInstitutionById(id: number): Promise<Institution> {
  const pool = getConnection();
  const result = await pool.query<Institution>(SELECT_INSTITUTION_BY_ID, [id]);
  return result.rows[0];
}

function SELECT_INSTITUTIONS_BY_IDS(ids: string): string {
  return `
  SELECT 
    id AS institution_id, 
    name,
    sme as is_sme,
    address_street as street,
    address_postbox as postbox,
    address_postalcode as postalcode,
    address_city as city,
    address_country as country,
    address_geolocation as geolocation,
    url,
    short_name
  FROM institutions
  WHERE id IN (${ids}) AND
  address_geolocation IS NOT NULL;`;
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
  FROM mat_institutions_topics;`;

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
