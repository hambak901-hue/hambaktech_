import { NextRequest, NextResponse } from "next/server";

// In-memory persistent store for development/preview sessions
const enrollmentsStore: any[] = [
  {
    id: "enr-demo-1",
    userId: "usr-student-1",
    courseId: "crs-full-stack",
    courseTitle: "Full-Stack Web & Software Engineering",
    studentRegNumber: "HT-STD-2026-0042",
    cohort: "Q4 2026",
    schedulePreference: "Morning (9:00 AM - 12:00 PM)",
    studyMode: "In-Person Lab",
    status: "ACTIVE",
    paymentStatus: "PAID",
    progressPercent: 45,
    createdAt: new Date().toISOString(),
  }
];

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    data: enrollmentsStore
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      courseId,
      studentName = "Platform Student",
      studentPhone = "08147837664",
      studentEmail = "student@hambaktech.com.ng",
      cohort = "Q4 2026",
      schedulePreference = "Morning (9:00 AM - 12:00 PM)",
      studyMode = "In-Person Lab",
      payWithWallet = true,
      highestEducation = "O Level / High School",
      priorExperience = "Beginner",
      guardianName = "",
      guardianPhone = ""
    } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: { message: "Course ID is required." } },
        { status: 400 }
      );
    }

    const regNumber = "HT-STD-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const invoiceRef = "HT-INV-ACAD-" + Math.floor(100000 + Math.random() * 900000);
    const enrollmentId = "enr-" + Date.now();
    const idCardNumber = "HT-IDC-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);

    const newEnrollment = {
      id: enrollmentId,
      courseId,
      courseTitle: body.courseTitle || "Academy Professional Program",
      studentRegNumber: regNumber,
      studentName,
      studentPhone,
      studentEmail,
      cohort,
      schedulePreference,
      studyMode,
      status: "ACTIVE",
      paymentStatus: payWithWallet ? "PAID" : "PENDING",
      progressPercent: 0,
      invoiceRef,
      tuitionFee: body.tuitionFee || 50000,
      idCardNumber,
      createdAt: new Date().toISOString(),
    };

    enrollmentsStore.unshift(newEnrollment);

    return NextResponse.json({
      success: true,
      message: payWithWallet 
        ? "Enrollment confirmed! Tuition paid from wallet and your lab seat has been reserved."
        : "Enrollment application submitted. Invoice generated for settlement.",
      data: newEnrollment
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Enrollment failed.";
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
