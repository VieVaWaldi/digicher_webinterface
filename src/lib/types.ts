export interface InstitutionSmePoint {
  id: number;
  sme: boolean | null;
  address_geolocation: number[] | null;
}

export interface Institution {
  id: number;
  name: string;
  sme: boolean | null;
  address_street: string | null;
  address_city: string | null;
  address_country: string | null;
  address_geolocation: number[] | null;
  url: string | null;
  short_name: string | null;
}

/* */

export interface ProjectCoordinatorPoint {
  project_id: number;
  coordinator_id: number;
  coordinator_location: number[];
}

export interface Project {
  id: number;
  id_original: string;
  doi_id: number | null;
  acronym: string | null;
  title: string;
  status: string | null;
  start_date: Date | null;
  end_date: Date | null;
  ec_signature_date: Date | null;
  total_cost: number | null;
  ec_max_contribution: number | null;
  objective: string | null;
  call_identifier: string | null;
  call_title: string | null;
  call_rcn: string | null;
}

/* */

export interface InstitutionECNetFunding {
  institution_id: number;
  institution_name: string;
  address_geolocation: number[];
  total_eu_funding: string | null;
  number_of_projects: string;
  avg_project_funding: string | null;
}

/* */

export interface InstitutionCollaborationWeights {
  institution_id: number;
  institution_name: string;
  address_geolocation: number[];
  collaboration_weight: number;
}

export interface InstitutionCollaborators {
  collaborator_id: number;
  collaborator_name: string;
  collaborator_geolocation: number[];
}

/* Institution Topics Filter */

export interface InstitutionTopics {
  institution_id: number;
  institution_name: string;
  address_geolocation: number[]; // assuming this is Point/geometry type
  topic: string[]; // array of strings since we used array_agg
}
