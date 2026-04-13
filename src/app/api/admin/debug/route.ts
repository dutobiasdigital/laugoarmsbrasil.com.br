import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "NOT SET";
  const directUrl = process.env.DIRECT_URL ?? "NOT SET";

  function parseDbUrl(url: string) {
    try {
      const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@(.+)/);
      if (!match) return { raw: url.substring(0, 30) + "..." };
      return {
        user: match[1],
        passwordLength: match[2].length,
        passwordFirst3: match[2].slice(0, 3) + "***",
        hostAndDb: match[3],
      };
    } catch {
      return { raw: url.substring(0, 30) + "..." };
    }
  }

  // Test 1: DATABASE_URL (pooler)
  let poolerTest = "NOT TESTED";
  try {
    const { PrismaClient } = await import("@prisma/client");
    const c = new PrismaClient({ datasourceUrl: dbUrl });
    const r = await c.$queryRaw`SELECT current_database() as db, current_user as usr`;
    poolerTest = `OK: ${JSON.stringify(r)}`;
    await c.$disconnect();
  } catch (e) {
    poolerTest = `ERROR: ${String(e).substring(0, 300)}`;
  }

  // Test 2: DIRECT_URL
  let directTest = "NOT TESTED";
  try {
    const { PrismaClient } = await import("@prisma/client");
    const c = new PrismaClient({ datasourceUrl: directUrl });
    const r = await c.$queryRaw`SELECT current_database() as db, current_user as usr`;
    directTest = `OK: ${JSON.stringify(r)}`;
    await c.$disconnect();
  } catch (e) {
    directTest = `ERROR: ${String(e).substring(0, 300)}`;
  }

  // Test 3: Hardcoded direct connection (to isolate env var issues)
  let hardcodedTest = "NOT TESTED";
  try {
    const { PrismaClient } = await import("@prisma/client");
    const hardUrl = "postgresql://postgres:MagnumDb2026secure@db.mfefumwjzbzuqfyvpoeo.supabase.co:5432/postgres";
    const c = new PrismaClient({ datasourceUrl: hardUrl });
    const r = await c.$queryRaw`SELECT current_database() as db, current_user as usr`;
    hardcodedTest = `OK: ${JSON.stringify(r)}`;
    await c.$disconnect();
  } catch (e) {
    hardcodedTest = `ERROR: ${String(e).substring(0, 300)}`;
  }

  return NextResponse.json({
    DATABASE_URL_parsed: parseDbUrl(dbUrl),
    DIRECT_URL_parsed: parseDbUrl(directUrl),
    test_pooler: poolerTest,
    test_direct: directTest,
    test_hardcoded_direct: hardcodedTest,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
