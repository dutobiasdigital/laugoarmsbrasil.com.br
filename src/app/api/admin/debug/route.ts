import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "NOT SET";
  const directUrl = process.env.DIRECT_URL ?? "NOT SET";

  // Mask passwords
  const mask = (url: string) => url.replace(/:([^@]+)@/, ":****@");

  let dbTest = "NOT TESTED";
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    dbTest = `OK: ${JSON.stringify(result)}`;
  } catch (e) {
    dbTest = `ERROR: ${String(e)}`;
  }

  return NextResponse.json({
    DATABASE_URL: mask(dbUrl),
    DIRECT_URL: mask(directUrl),
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "NOT SET",
    dbTest,
  });
}
