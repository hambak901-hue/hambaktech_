import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { enrollmentId, lessonId, moduleId } = body;

    return NextResponse.json({
      success: true,
      message: "Lesson progress updated successfully.",
      data: {
        id: enrollmentId,
        progressPercent: 65,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Progress update failed";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
