import { boolean, date, numeric, pgSchema, text } from "drizzle-orm/pg-core";
import { coreSchema } from "db/schemas/core";

// export const coreMatsSchema = pgSchema("core_mats");

export const tableViewProject = coreSchema
  .view("table_view_project", {
    id: text("id").notNull(),
    title: text("title"),
    acronym: text("acronym"),

    source: text("source_system"),
    doi: text("doi"),

    start_date: date("start_date"),
    end_date: date("end_date"),

    objective: text("objective"),
    total_cost: numeric("total_cost"),
    funded_amount: numeric("funded_amount"),
    currency: text("currency"),
    keywords: text("keywords"),

    topic_id: numeric("topic_id"),
    subfield_id: text("subfield_id"),
    field_id: text("field_id"),
    domain_id: text("domain_id"),
    framework_programmes: text("framework_programmes").array(),
  })
  .existing();

export type ProjectTableViewType = typeof tableViewProject.$inferSelect;

// Institution table view — queries core.institution directly
export { institution as tableViewInstitution } from "db/schemas/core";
