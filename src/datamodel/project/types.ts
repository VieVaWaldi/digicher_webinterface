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

export interface ProjectTopics {
  project_id: number;
  topic_ids: number[];
}

export interface ProjectFundingProgrammes {
  project_id: number;
  funding_ids: number[];
}
