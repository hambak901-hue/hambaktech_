import { NextResponse } from "next/server";
import { servicesData } from "@/data/servicesData";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: servicesData,
  });
}
