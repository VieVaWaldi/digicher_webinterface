import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgSchema,
  text,
} from "drizzle-orm/pg-core";

/* Use .existing() to tell drizzle that views and mats already exist */

export const coreMatsSchema = pgSchema("core_mats");

export const projectView = coreMatsSchema
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
    framework_programme: text("framework_programme"),
  })
  .existing();

export type ProjectViewType = typeof projectView.$inferSelect;

export const institutionView = coreMatsSchema
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
    framework_programme: text("framework_programme"),
  })
  .existing();

export type InstitutionViewType = typeof institutionView.$inferSelect;

export const fundingprogramme = coreMatsSchema
  .materializedView("fundingprogramme", {
    project_id: text("project_id").notNull(),
    funding_id: text("funding_id").notNull(),
    framework_programme: text("framework_programme").notNull(),
  })
  .existing();

export type FundingprogrammeType = typeof fundingprogramme.$inferSelect;

export const matInstitutionsCollaborationWeights = coreMatsSchema
  .materializedView("mat_institutions_collaboration_weights", {
    institution_id: text("institution_id").notNull(),
    geolocation: doublePrecision("geolocation").array(),
    country: text("country"),
    collaboration_weight: integer("collaboration_weight").notNull(),
  })
  .existing();

export type MatInstitutionsCollaborationWeightsType =
  typeof matInstitutionsCollaborationWeights.$inferSelect;

export const getInstitutionCollaborators = coreMatsSchema
  .materializedView("get_institution_collaborators", {
    institution_id: text("institution_id").notNull(),
    geolocation: doublePrecision("geolocation").array(),
    country: text("country"),
  })
  .existing();

export type GetInstitutionCollaboratorsType =
  typeof getInstitutionCollaborators.$inferSelect;
