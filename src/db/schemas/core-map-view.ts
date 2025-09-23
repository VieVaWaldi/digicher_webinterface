import {
  boolean,
  date,
  doublePrecision,
  pgSchema,
  text,
} from "drizzle-orm/pg-core";

export const coreMatsSchema = pgSchema("core_mats");

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
    project_id: text("project_id").notNull(),
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

export type MapViewInstitutionType = typeof mapViewInstitution.$inferSelect;

export const mapViewCollaborations = coreMatsSchema
  .materializedView("collaborations", {
    a_institution_id: text("a_institution_id").notNull(),
    b_institution_id: text("b_institution_id").notNull(),
    a_geolocation: doublePrecision("a_geolocation").array().notNull(),
    b_geolocation: doublePrecision("b_geolocation").array().notNull(),
    project_id: text("project_id").notNull(),
  })
  .existing();

export type MapViewCollaborationsType =
  typeof mapViewCollaborations.$inferSelect;
