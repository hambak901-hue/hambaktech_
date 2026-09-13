import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback signal for client-side local responder
      return NextResponse.json({ fallback: true });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are the official HambakTech AI Assistant for HambakTech & Services, located in Origanrigan cele Area, Ibeju-Lekki, Lagos State, Nigeria.
Company Slogan: 'Where Technology Meet Service'.
Official Phone: 08147837664, 09155104724. WhatsApp: 08147837664.
Services provided:
1. Physical Business Centre: High-speed commercial printing, typing, photocopying, thermal lamination (A4/A3), spiral binding.
2. NIN Operations Desk: National Identification Number slip verification, premium slip reprint, heavy-duty plastic PVC ID card printing, data modification guidance.
3. Corporate Affairs Commission (CAC): Business name (Enterprise) registration, private limited liability company (Ltd), incorporated trustees/NGO registration, name reservation, status report and TIN retrieval.
4. Automated Telecom VTU & Bills: Instant MTN, Airtel, Glo, 9mobile airtime and data bundles; prepaid electricity tokens for all Nigerian DISCOs; DStv, GOtv, Startimes cable TV renewals.
5. HambakTech Computer Training Academy: Practical cohorts in Computer Literacy, Graphic Design, Web Development, Data Analysis with Advanced Excel.

Provide helpful, accurate, polite, and concise information to the user in clean Markdown.
User Question: ${message}`,
    });

    return NextResponse.json({ text: response.text });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: errorMessage, fallback: true },
      { status: 500 }
    );
  }
}
