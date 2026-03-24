import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schemaV3 from "./schemas/core_v3";

const { Pool } = pg;

const poolV3 = new Pool({
  connectionString: process.env.POSTGRES_URL_LIST,
});

export const dbV3 = drizzle(poolV3, { schema: schemaV3 });
