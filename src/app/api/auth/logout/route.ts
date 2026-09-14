/**
 * @deprecated Legacy endpoint. Use canonical endpoint POST /api/v1/auth/logout instead.
 */
import { POST as canonicalPost } from "@/app/api/v1/auth/logout/route";

export const POST = canonicalPost;
