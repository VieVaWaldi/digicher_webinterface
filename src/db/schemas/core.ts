import {
  boolean,
  date,
  doublePrecision,
  pgSchema,
  serial,
  text,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

export const coreSchema = pgSchema("core");

export const project = coreSchema.table("project", {
  id: text("id").notNull(),
  source_id: text("source_id"),
  source_system: text("source_system"),
  cordis_id: text("cordis_id"),
  doi: text("doi"),
  title: text("title"),
  acronym: text("acronym"),
  status: text("status"),
  start_date: date("start_date"),
  end_date: date("end_date"),
  ec_signature_date: date("ec_signature_date"),
  total_cost: doublePrecision("total_cost"),
  ec_max_contribution: doublePrecision("ec_max_contribution"),
  objective: text("objective"),
  call_identifier: text("call_identifier"),
  call_title: text("call_title"),
  call_rcn: text("call_rcn"),
  id_original: text("id_original"),
  id_openaire: text("id_openaire"),
  code: text("code"),
  duration: text("duration"),
  keywords: text("keywords"),
  funded_amount: doublePrecision("funded_amount"),
  website_url: text("website_url"),
  funder_name: text("funder_name"),
  funder_short_name: text("funder_short_name"),
  funder_jurisdiction: text("funder_jurisdiction"),
  currency: text("currency"),
  funder_total_cost: doublePrecision("funder_total_cost"),
  created_at: timestamp("created_at", { withTimezone: true }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type ProjectType = typeof project.$inferSelect;

export const institution = coreSchema.table("institution", {
  id: text("id").notNull(),
  source_id: text("source_id"),
  source_system: text("source_system"),
  legal_name: text("legal_name"),
  sme: boolean("sme"),
  url: text("url"),
  short_name: text("short_name"),
  vat_number: text("vat_number"),
  street: text("street"),
  postbox: text("postbox"),
  postalcode: text("postalcode"),
  city: text("city"),
  country: text("country"),
  geolocation: text("geolocation").array(),
  type_title: text("type_title"),
  nuts_level_0: text("nuts_level_0"),
  nuts_level_1: text("nuts_level_1"),
  nuts_level_2: text("nuts_level_2"),
  nuts_level_3: text("nuts_level_3"),
  original_id: text("original_id"),
  is_first_listed: boolean("is_first_listed"),
  alternative_names: text("alternative_names").array(),
  country_code: text("country_code"),
  country_label: text("country_label"),
  created_at: timestamp("created_at", { withTimezone: true }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type InstitutionType = typeof institution.$inferSelect;

export const researchoutput = coreSchema.table("researchoutput", {
  id: text("id").notNull(),
  source_id: text("source_id"),
  source_system: text("source_system"),
  doi: text("doi"),
  original_id: text("original_id"),
  publication_date: timestamp("publication_date"),
  updated_date: timestamp("updated_date"),
  type: text("type"),
  language_code: text("language_code"),
  title: text("title"),
  abstract: text("abstract"),
  fulltext: text("fulltext"),
  comment: text("comment"),
  funding_number: text("funding_number"),
  journal_number: text("journal_number"),
  journal_name: text("journal_name"),
  start_page: text("start_page"),
  end_page: text("end_page"),
  page_range: text("page_range"),
  issn: text("issn"),
  publisher: text("publisher"),
  sub_title: text("sub_title"),
  language_label: text("language_label"),
  open_access_color: text("open_access_color"),
  publicly_funded: boolean("publicly_funded"),
  is_green: boolean("is_green"),
  is_in_diamond_journal: boolean("is_in_diamond_journal"),
  citation_count: doublePrecision("citation_count"),
  influence: doublePrecision("influence"),
  popularity: doublePrecision("popularity"),
  impulse: doublePrecision("impulse"),
  citation_class: text("citation_class"),
  influence_class: text("influence_class"),
  impulse_class: text("impulse_class"),
  popularity_class: text("popularity_class"),
  issn_printed: text("issn_printed"),
  issn_online: text("issn_online"),
  issn_linking: text("issn_linking"),
  volume: text("volume"),
  issue: text("issue"),
  edition: text("edition"),
  conference_place: text("conference_place"),
  conference_date: date("conference_date"),
  created_at: timestamp("created_at", { withTimezone: true }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type ResearchOutputType = typeof researchoutput.$inferSelect;

export const topicoa = coreSchema.table("topicoa", {
  id: serial("id").primaryKey(),
  subfield_id: text("subfield_id").notNull(),
  field_id: text("field_id").notNull(),
  domain_id: text("domain_id").notNull(),
  topic_name: text("topic_name").notNull(),
  subfield_name: text("subfield_name").notNull(),
  field_name: text("field_name").notNull(),
  domain_name: text("domain_name").notNull(),
  keywords: text("keywords").notNull(),
  summary: text("summary").notNull(),
  wikipedia_url: text("wikipedia_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type TopicOAType = typeof topicoa.$inferSelect;

/**
 *
 *
 */

// export const coreSchema = pgSchema("core");

export const tableViewProject = coreSchema
  .view("table_view_project", {
    id: text("id").notNull(),
    title: text("title"),
    start_date: date("start_date"),
    end_date: date("end_date"),
    acronym: text("acronym"),
    objective: text("objective"), // Still needed for FTS, but not selected
    topic_id: numeric("topic_id"),
    subfield_id: text("subfield_id"),
    field_id: text("field_id"),
    domain_id: text("domain_id"),
    framework_programmes: text("framework_programmes").array(),
  })
  .existing();

// export type TableViewProjectType = {
//   id: string;
//   title: string | null;
//   start_date: string | null;
//   acronym: string | null;
// };

export type ProjectTableViewType = typeof tableViewProject.$inferSelect;
