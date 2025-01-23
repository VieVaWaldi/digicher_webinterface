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

export interface InstitutionSmePoint {
  id: number;
  sme: boolean | null;
  address_geolocation: number[] | null;
}

export interface InstitutionECNetFunding {
  institution_id: number;
  institution_name: string;
  address_geolocation: number[];
  total_eu_funding: string | null;
  number_of_projects: string;
  avg_project_funding: string | null;
}

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

export interface InstitutionTopics {
  institution_id: number;
  institution_name: string;
  address_geolocation: number[];
  topic: string[];
}
