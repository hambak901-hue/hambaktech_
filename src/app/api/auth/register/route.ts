/**
 * @deprecated Legacy endpoint. Use canonical endpoint POST /api/v1/auth/register instead.
 */
import { POST as canonicalPost } from "@/app/api/v1/auth/register/route";

export const POST = canonicalPost;
