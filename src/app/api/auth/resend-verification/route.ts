/**
 * @deprecated Legacy endpoint. Use canonical endpoint POST /api/v1/auth/resend-verification instead.
 */
import { POST as canonicalPost } from "@/app/api/v1/auth/resend-verification/route";

export const POST = canonicalPost;
