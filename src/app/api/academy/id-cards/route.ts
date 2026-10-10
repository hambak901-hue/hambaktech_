import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: "idcard-demo-1",
        idCardNumber: "HT-IDC-2026-92811",
        studentName: "Abubakar Ibrahim",
        courseId: "crs-full-stack",
        courseTitle: "Full-Stack Web & Software Engineering",
        cohort: "Q4 2026",
        isActive: true,
        issuedAt: new Date().toISOString()
      }
    ]
  });
}
