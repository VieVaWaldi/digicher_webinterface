export interface Institution {
  institution_id: number;
  name: string;
  is_sme: boolean | null;
  street: string | null;
  postbox: string | null;
  postalcode: string | null;
  city: string | null;
  country: string | null;
  geolocation: number[] | null;
  url: string | null;
  short_name: string | null;
}

export interface InstitutionTopics {
  institution_id: number;
  topic_ids: number[];
}

export interface InstitutionFundingProgrammes {
  institution_id: number;
  funding_ids: number[];
}
