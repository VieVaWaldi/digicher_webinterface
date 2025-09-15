import {
  boolean,
  integer,
  pgSchema,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const feedbackSchema = pgSchema("feedback");

export const feedback_v1 = feedbackSchema.table("feedback_v1", {
  id: serial("id").primaryKey(),
  scenario_name: text("scenario_name").notNull(),

  is_useful: boolean("is_useful").notNull(),
  usefulness_reason: text("usefulness_reason"),
  feedback_improvement_suggestion: text("feedback_improvement_suggestion"),

  user_agent: text("user_agent"),
  ip_address: text("ip_address"),
  screen_resolution: text("screen_resolution"),
  viewport_size: text("viewport_size"),
  timezone: text("timezone"),
  language: text("language"),
  session_duration_ms: integer("session_duration_ms"),
  referrer: text("referrer"),
  page_load_time_ms: integer("page_load_time_ms"),

  submitted_at: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
});

export type FeedbackType = typeof feedback_v1.$inferSelect;
export type FeedbackInsertType = typeof feedback_v1.$inferInsert;
