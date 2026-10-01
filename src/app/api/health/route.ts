import { NextResponse } from "next/server";
import { isDatabaseReachable } from "@/lib/db";

export async function GET() {
  const dbStatus = await isDatabaseReachable();

  return NextResponse.json({
    status: "HEALTHY",
    version: "1.0.0",
    platform: "HAMBAKTECH BUSINESS PLATFORM",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    components: {
      api: "UP",
      database: dbStatus ? "CONNECTED" : "IN_MEMORY_FALLBACK",
    },
  });
}
