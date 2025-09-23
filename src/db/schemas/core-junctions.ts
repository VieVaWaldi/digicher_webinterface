import {
  boolean,
  date,
  doublePrecision,
  integer,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { coreSchema } from "./core";

export const j_project_researchoutput = coreSchema.table(
  "j_project_researchoutput",
  {
    project_id: text("project_id").notNull(),
    researchoutput_id: text("researchoutput_id").notNull(),
    relation_type: text("relation_type"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.project_id, table.researchoutput_id] }),
  }),
);

export const j_project_institution = coreSchema.table(
  "j_project_institution",
  {
    project_id: text("project_id").notNull(),
    institution_id: text("institution_id").notNull(),
    institution_position: serial("institution_position"),
    ec_contribution: doublePrecision("ec_contribution"),
    net_ec_contribution: doublePrecision("net_ec_contribution"),
    total_cost: doublePrecision("total_cost"),
    type: text("type"),
    organization_id: text("organization_id"),
    rcn: serial("rcn"),
    relation_type: text("relation_type"),
    validation_date: date("validation_date"),
    validated: boolean("validated"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.project_id, table.institution_id] }),
  }),
);

export const j_project_topicoa = coreSchema.table(
  "j_project_topicoa",
  {
    project_id: text("project_id").notNull(),
    topic_id: integer("topic_id").notNull(),
    score: doublePrecision("score"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.project_id, table.topic_id] }),
  }),
);

export type JProjectTopicOAType = typeof j_project_topicoa.$inferSelect;
