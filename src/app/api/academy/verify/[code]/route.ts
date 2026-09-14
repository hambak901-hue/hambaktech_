import { NextRequest } from "next/server";
import { GET as canonicalGet } from "@/app/api/v1/academy/verify/[code]/route";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  return canonicalGet(req, context);
}
