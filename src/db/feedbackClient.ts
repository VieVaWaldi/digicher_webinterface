import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as feedbackSchema from "./schemas/feedback";

const { Pool } = pg;

const feedbackPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: "db_digicher_feedback",
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const feedbackDb = drizzle(feedbackPool, { schema: feedbackSchema });
