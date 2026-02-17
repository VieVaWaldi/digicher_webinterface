import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgSchema,
  text,
} from "drizzle-orm/pg-core";

export const coreMatsSchema = pgSchema("core_mats");

/** ToDo: Not used for the scenarios anymore, but the YearRangeFilter has a dependency on it -> Remove it */
export const mapViewProject = coreMatsSchema
  .materializedView("project_view", {
    project_id: text("project_id").notNull(),
    institution_id: text("institution_id").notNull(),
    start_date: date("start_date").notNull(),
    end_date: date("end_date").notNull(),
    total_cost: doublePrecision("total_cost"),
    geolocation: doublePrecision("geolocation").array(),
    country_code: text("country_code"),
    type: text("type"),
    sme: boolean("sme"),
    nuts_0: text("nuts_0"),
    nuts_1: text("nuts_1"),
    nuts_2: text("nuts_2"),
    nuts_3: text("nuts_3"),
    framework_programmes: text("framework_programmes").array(),
  })
  .existing();

export type MapViewProjectType = typeof mapViewProject.$inferSelect;

export const mapViewInstitution = coreMatsSchema
  .materializedView("institution_view", {
    institution_id: text("institution_id").notNull(),
    geolocation: doublePrecision("geolocation").array(),
    country_code: text("country_code"),
    type: text("type"),
    sme: boolean("sme"),
    total_cost: doublePrecision("total_cost"),
    projects: jsonb("projects").$type<
      {
        id: string;
        start: string;
        end: string;
        total_cost: number | null;
        framework_programmes: string[];
      }[]
    >(),
  })
  .existing();

export type MapViewInstitutionType = typeof mapViewInstitution.$inferSelect;

export const mapViewcollaborationNetwork = coreMatsSchema
  .materializedView("collaboration_network_view", {
    institution_id: text("institution_id").notNull(),
    collaborator_id: text("collaborator_id").notNull(),
    collaborator_geolocation: doublePrecision(
      "collaborator_geolocation",
    ).array(),
    projects: jsonb("projects").$type<
      {
        project_id: string;
        total_cost: number | null;
        combined_institution_cost: number | null;
      }[]
    >(),
  })
  .existing();

export type MapViewCollaborationNetworkType =
  typeof mapViewcollaborationNetwork.$inferSelect;

export const mapViewCollaborationByTopic = coreMatsSchema
  .materializedView("collaboration_by_topic", {
    a_institution_id: text("a_institution_id").notNull(),
    b_institution_id: text("b_institution_id").notNull(),
    a_geolocation: doublePrecision("a_geolocation").array().notNull(),
    b_geolocation: doublePrecision("b_geolocation").array().notNull(),
    a_country: text("a_country"),
    b_country: text("b_country"),
    project_id: text("project_id").notNull(),
    start_date: date("start_date"),
    end_date: date("end_date"),
    topic_id: text("topic_id").notNull(),
    subfield_id: text("subfield_id"),
    field_id: text("field_id"),
    framework_programmes: text("framework_programmes").array(),
  })
  .existing();

export type MapViewCollaborationByTopicType =
  typeof mapViewCollaborationByTopic.$inferSelect;
