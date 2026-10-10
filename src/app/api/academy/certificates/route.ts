import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: "cert-demo-1",
        certificateNumber: "HT-CERT-2026-0089",
        recipientName: "Abubakar Ibrahim",
        studentName: "Abubakar Ibrahim",
        courseId: "crs-full-stack",
        courseTitle: "Full-Stack Web & Software Engineering",
        grade: "Distinction (Grade A)",
        issueDate: "2026-09-15",
        verificationUrl: "https://business.hambaktech.com.ng/verify/certificate/HT-CERT-2026-0089"
      }
    ]
  });
}
