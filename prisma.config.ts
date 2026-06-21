import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // CLI commands (migrate, studio, db push) use the direct, non-pooled
    // connection — required for DDL against a Supabase pgbouncer setup.
    url: env("DIRECT_URL"),
  },
});
