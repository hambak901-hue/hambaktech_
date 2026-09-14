import { GET as canonicalGet } from "@/app/api/v1/shop/delivery-zones/route";

export async function GET() {
  return canonicalGet();
}
