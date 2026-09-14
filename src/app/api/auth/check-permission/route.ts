/**
 * @deprecated Legacy endpoint. Use canonical endpoint POST /api/v1/auth/check-permission instead.
 */
import { POST as canonicalPost } from "@/app/api/v1/auth/check-permission/route";

export const POST = canonicalPost;
