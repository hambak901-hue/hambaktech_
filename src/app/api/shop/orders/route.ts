import { NextRequest } from "next/server";
import { GET as canonicalGet, POST as canonicalPost } from "@/app/api/v1/shop/orders/route";

export async function GET(req: NextRequest) {
  return canonicalGet(req);
}

export async function POST(req: NextRequest) {
  return canonicalPost(req);
}
