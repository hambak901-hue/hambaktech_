import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AcademyService } from "@/lib/server/platform-store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    if (!code) {
      return errorResponse(new Error("Verification code is required"), 400);
    }

    const verificationResult = await AcademyService.verifyCertificate(code);
    return successResponse(
      verificationResult,
      verificationResult.valid
        ? "Official HambakTech Certificate verified as authentic."
        : "Certificate credential not found or revoked."
    );
  } catch (error) {
    return errorResponse(error);
  }
}
