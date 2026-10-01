import { NextResponse } from "next/server";
import { companyConfig } from "@/data/companyConfig";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      announcements: [
        {
          id: "ann-01",
          title: "CAC Direct Registration Desk Now Open",
          message: "Fast-track business name and company registration directly through our Ikorodu operational center.",
          category: "SYSTEM",
          isActive: true,
          publishedAt: new Date().toISOString(),
        },
      ],
      companyConfig,
    },
  });
}
