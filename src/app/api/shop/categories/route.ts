import { NextRequest } from "next/server";
import { GET as canonicalGet, POST as canonicalPost } from "@/app/api/v1/shop/categories/route";

export async function GET() {
  return canonicalGet();
}

export async function POST(req: NextRequest) {
  return canonicalPost(req);
}
