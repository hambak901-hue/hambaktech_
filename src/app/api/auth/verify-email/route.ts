/**
 * @deprecated Legacy endpoint. Use canonical endpoint POST /api/v1/auth/verify-email instead.
 */
import { POST as canonicalPost } from "@/app/api/v1/auth/verify-email/route";

export const POST = canonicalPost;
