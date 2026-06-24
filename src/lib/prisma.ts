import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Runtime queries go through the pooled connection (pgbouncer-safe);
  // prisma.config.ts uses DIRECT_URL separately for CLI/migrations.
  //
  // Supabase's pooler (and intermediate network hops) can silently drop an
  // idle connection before `pg` notices, surfacing as Prisma error P1017
  // ("Server has closed the connection") on the next query that reuses it.
  // keepAlive plus a short idle timeout keep the client-side pool recycling
  // connections faster than the server/network drops them.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    idleTimeoutMillis: 20_000,
    max: 10,
  });
  // An idle pooled client that the server already closed emits an 'error'
  // event when pg destroys it in the background; without a listener this
  // crashes the process.
  pool.on("error", (err) => {
    console.error("[pg pool] idle client error:", err.message);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
