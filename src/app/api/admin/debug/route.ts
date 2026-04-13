import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "NOT SET";
  const directUrl = process.env.DIRECT_URL ?? "NOT SET";

  // Parse URL to show username and host without password
  function parseDbUrl(url: string) {
    try {
      const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@(.+)/);
      if (!match) return { raw: url };
      return {
        user: match[1],
        passwordLength: match[2].length,
        passwordFirst3: match[2].slice(0, 3) + "***",
        hostAndDb: match[3],
      };
    } catch {
      return { raw: url };
    }
  }

  let dbTest = "NOT TESTED";
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    dbTest = `OK: ${JSON.stringify(result)}`;
  } catch (e) {
    dbTest = `ERROR: ${String(e)}`;
  }

  return NextResponse.json({
    DATABASE_URL: parseDbUrl(dbUrl),
    DIRECT_URL: parseDbUrl(directUrl),
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "NOT SET",
    dbTest,
  });
}
