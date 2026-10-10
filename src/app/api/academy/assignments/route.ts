import { NextRequest, NextResponse } from "next/server";

const assignmentsStore: any[] = [
  {
    id: "asg-1",
    courseId: "crs-full-stack",
    title: "Milestone Project 1: Responsive E-Commerce Product Showcase",
    description: "Build a responsive product gallery using semantic HTML5, modern CSS Grid/Flexbox, and vanilla JavaScript for dynamic cart calculations.",
    maxScore: 100,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    submissions: [
      {
        id: "sub-1",
        enrollmentId: "enr-demo-1",
        content: "Implemented mobile-first CSS Grid catalog with localStorage cart sync and responsive media queries.",
        fileUrl: "https://github.com/hambaktech-demo/ecom-showcase",
        score: 95,
        graded: true,
        feedback: "Outstanding responsive layout and clean semantic structure. Excellent work!",
        submittedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ]
  },
  {
    id: "asg-2",
    courseId: "crs-full-stack",
    title: "Milestone Project 2: RESTful API & Relational Database Architecture",
    description: "Design and implement REST endpoints with parameter validation, session tokens, and PostgreSQL schema migrations for customer management.",
    maxScore: 100,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    submissions: []
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: assignmentsStore
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assignmentId, enrollmentId, content, fileUrl } = body;

    const assignment = assignmentsStore.find((a) => a.id === assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: { message: "Assignment not found." } },
        { status: 404 }
      );
    }

    const newSub = {
      id: "sub-" + Date.now(),
      enrollmentId,
      content,
      fileUrl,
      score: null,
      graded: false,
      feedback: "Under instructor review. Check back for graded assessment.",
      submittedAt: new Date().toISOString()
    };

    assignment.submissions.push(newSub);

    return NextResponse.json({
      success: true,
      message: "Solution submitted for mentor review.",
      data: newSub
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
