/**
 * @deprecated Legacy endpoint. Use canonical endpoint GET /api/v1/auth/me instead.
 */
import { GET as canonicalGet } from "@/app/api/v1/auth/me/route";

export const GET = canonicalGet;
