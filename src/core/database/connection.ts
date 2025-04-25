import { Pool, PoolConfig } from "pg";

function getPool() {
  if (
    !process.env.POSTGRES_USER ||
    !process.env.POSTGRES_HOST ||
    !process.env.POSTGRES_DATABASE ||
    !process.env.POSTGRES_PORT
  ) {
    throw new Error("Missing database configuration");
  }

  const poolConfig: PoolConfig = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD || "",
    port: parseInt(process.env.POSTGRES_PORT),
  };

  if (
    process.env.MODE == "PROD" ||
    process.env.MODE == undefined ||
    process.env.MODE == null
  ) {
    poolConfig.ssl = {
      rejectUnauthorized: true,
    };
  }

  return new Pool(poolConfig);
}

let pool: Pool;

export function getConnection() {
  if (!pool) {
    pool = getPool();
  }
  return pool;
}

// ToDo Move
export async function pingNeon(): Promise<boolean> {
  const pool = getConnection();
  await pool.query("SELECT 1");
  return true;
}
