/**
 * @deprecated Legacy endpoint. Use canonical endpoint POST /api/v1/auth/reset-password instead.
 */
import { POST as canonicalPost } from "@/app/api/v1/auth/reset-password/route";

export const POST = canonicalPost;
