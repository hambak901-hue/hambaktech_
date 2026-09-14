import { NextRequest } from "next/server";
import { POST as canonicalPost } from "@/app/api/v1/academy/progress/route";

export async function POST(req: NextRequest) {
  return canonicalPost(req);
}
