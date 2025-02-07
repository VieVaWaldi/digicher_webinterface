import { getConnection } from "core/database/connection";
import {
  Institution,
  InstitutionPoint,
  InstitutionCollaborators,
  InstitutionCollaborationWeights,
  InstitutionECNetFunding,
  InstitutionTopics,
} from "datamodel/institution/types";

const SELECT_INSTITUTION = `
  SELECT *
  FROM institutions
  WHERE id = $1 AND
  address_geolocation IS NOT NULL;`;

export async function getInstitutionById(id: number): Promise<Institution> {
  const pool = getConnection();
  const result = await pool.query<Institution>(SELECT_INSTITUTION, [id]);
  return result.rows[0];
}

/** Scenario Institutions */

const SELECT_INSTITUTION_POINTS = `
  SELECT 
      id, address_geolocation, sme, address_country
  FROM institutions
  WHERE address_geolocation IS NOT NULL;`;

export async function getInstitutionPoints(): Promise<InstitutionPoint[]> {
  const pool = getConnection();
  const result = await pool.query<InstitutionPoint>(SELECT_INSTITUTION_POINTS);
  return result.rows;
}

//
//
//

/* SCENARIO | Institution EC net Funding */

const SELECT_INSTITUTION_ECNET_FUNDING = `
  SELECT * FROM institution_ecnet_funding
  WHERE total_eu_funding != 0;
`;

export async function getInstitutionECNetFunding(): Promise<
  InstitutionECNetFunding[]
> {
  const pool = getConnection();
  const result = await pool.query<InstitutionECNetFunding>(
    SELECT_INSTITUTION_ECNET_FUNDING,
  );
  return result.rows;
}

/* Institution Collaboration */

const SELECT_INSTITUTION_COLLABORATION_WEIGHTS = `
  SELECT * FROM institution_collaboration_weights;
`;

export async function getInstitutionCollaborationWeights(): Promise<
  InstitutionCollaborationWeights[]
> {
  const pool = getConnection();
  const result = await pool.query<InstitutionCollaborationWeights>(
    SELECT_INSTITUTION_COLLABORATION_WEIGHTS,
  );
  return result.rows;
}

const SELECT_INSTITUTION_COLLABORATORS = `
  SELECT * FROM get_institution_collaborators($1);
`;

export async function getInstititutionCollaborators(
  id: number,
): Promise<InstitutionCollaborators[]> {
  const pool = getConnection();
  const result = await pool.query<InstitutionCollaborators>(
    SELECT_INSTITUTION_COLLABORATORS,
    [id],
  );
  return result.rows;
}

/* Institution Topics */

const SELECT_INSTITUTION_TOPICS = `
  SELECT 
    id as institution_id,
    name as institution_name,
    address_geolocation,
    topic_codes as topic
  FROM institution_topics
  WHERE address_geolocation IS NOT NULL;
`;

export async function getInstitutionTopics(): Promise<InstitutionTopics[]> {
  const pool = getConnection();
  const result = await pool.query<InstitutionTopics>(SELECT_INSTITUTION_TOPICS);
  return result.rows;
}
