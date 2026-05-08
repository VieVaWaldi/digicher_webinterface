import {
  boolean,
  date,
  doublePrecision,
  integer,
  json,
  numeric,
  pgMaterializedView,
  pgTable,
  real,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// core_v3 is a separate database; all tables live in the public schema.

export const projectV3 = pgTable("project", {
  id: numeric("id").notNull(),
  title: varchar("title"),
  acronym: varchar("acronym"),
  startDate: date("startDate"),
  endDate: date("endDate"),
  summary: varchar("summary"),
  keywords: varchar("keywords"),
  frameworkProgrammes: text("frameworkProgrammes").array(),
  granted: json("granted"),
  fundings: json("fundings"),
  subjects: text("subjects").array(),
  is_ch: boolean("is_ch"),
  pred: real("pred"),
});

export const organizationV3 = pgTable("organization", {
  id: numeric("id").notNull(),
  legalName: varchar("legalName"),
  legalShortName: varchar("legalShortName"),
  countryCode: varchar("countryCode"),
  rorTypes: text("rorTypes").array(),
  rorLocations: json("rorLocations"),
  geolocation: text("geolocation").array(),
});

export const workV3 = pgTable("work", {
  id: numeric("id").notNull(),
  title: varchar("title"),
  publicationDate: date("publicationDate"),
  publisher: varchar("publisher"),
  openAccessColor: varchar("openAccessColor"),
  descriptions: text("descriptions").array(),
  pids: json("pids"),
  instances: json("instances"),
  citationCount: doublePrecision("citationCount"),
  container: json("container"),
  language: json("language"),
  influence: doublePrecision("influence"),
});

export const relationV3 = pgTable("relation", {
  source: numeric("source"),
  sourceType: varchar("sourceType"),
  target: numeric("target"),
  targetType: varchar("targetType"),
  relType: json("relType"),
  validated: boolean("validated"),
  cordis_ec_contribution: doublePrecision("cordis_ec_contribution"),
  cordis_type: varchar("cordis_type"),
});

export const relationTopicV3 = pgTable("relation_topic", {
  type: varchar("type"),
  source_id: numeric("source_id"),
  topic_id: integer("topic_id"),
  score: real("score"),
  created_at: timestamp("created_at"),
});

export const topicV3 = pgTable("topic", {
  id: integer("id").primaryKey(),
  subfield_id: varchar("subfield_id"),
  field_id: varchar("field_id"),
  domain_id: varchar("domain_id"),
  topic_name: varchar("topic_name"),
  subfield_name: varchar("subfield_name"),
  field_name: varchar("field_name"),
  domain_name: varchar("domain_name"),
});

// Materialized view — one row per work, best-scoring topic via DISTINCT ON.
// DOI pre-extracted from pids JSON; search_vector pre-computed (GIN indexed).
export const tableViewWorkV3 = pgMaterializedView("table_view_work", {
  id: numeric("id").notNull(),
  title: varchar("title"),
  publication_date: date("publication_date"),
  publisher: varchar("publisher"),
  open_access_color: varchar("open_access_color"),
  citation_count: doublePrecision("citation_count"),
  influence: doublePrecision("influence"),
  doi: varchar("doi"),
  // search_vector (tsvector) is not declared here — referenced via sql`` in queries
  topic_id: integer("topic_id"),
  subfield_id: varchar("subfield_id"),
  field_id: varchar("field_id"),
  domain_id: varchar("domain_id"),
}).existing();

export type WorkTableViewType = typeof tableViewWorkV3.$inferSelect;

// Materialized view created by the pipeline (project_view.sql).
// One row per project; best-scoring topic chosen via DISTINCT ON.
// Columns are aliased to snake_case in the view definition.
export const tableViewProjectV3 = pgMaterializedView("table_view_project", {
  id: numeric("id").notNull(),
  title: varchar("title"),
  acronym: varchar("acronym"),
  start_date: date("start_date"),
  end_date: date("end_date"),
  summary: varchar("summary"),
  total_cost: doublePrecision("total_cost"),
  funded_amount: doublePrecision("funded_amount"),
  currency: varchar("currency"),
  keywords: varchar("keywords"),
  is_ch: boolean("is_ch"),
  pred: real("pred"),
  framework_programmes: text("framework_programmes").array(),
  topic_id: integer("topic_id"),
  subfield_id: varchar("subfield_id"),
  field_id: varchar("field_id"),
  domain_id: varchar("domain_id"),
}).existing();
