import {
  doublePrecision,
  integer,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { coreSchema } from "./core";

/* j Project RO */

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

/* j Project Topicoa */
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
