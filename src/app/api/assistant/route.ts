import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import companyConfig from "@/data/companyConfig";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = (body.message || "").trim();

    if (!userMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        fallback: true,
        text: null,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the official HambakTech Smart Digital Assistant.
HambakTech (legally Hambaktech & Services, CAC Registered) operates a physical technology hub and business centre in Ibeju-Lekki, Lagos, along with a digital services portal.

Services provided:
1. VTU & Utilities: Instant Airtime & Data top-ups (MTN, Airtel, Glo, 9mobile), Electricity token vending (Ikeja, Eko, AEDC, IBEDC, etc.), Cable TV subscriptions (DStv, GOtv, Startimes).
2. Business Centre & Office: High-speed printing, photocopy, scanning, lamination, spiral binding, passport photography, typing.
3. Corporate & CAC: Business Name Registration, Limited Liability Company, Incorporated Trustees/NGO filings.
4. NIN & Identity Desk: NIN retrieval/reprint, plastic PVC ID printing, data modification guidance.
5. HambakTech Academy: Practical ICT training in Computer Literacy, Graphic Design, Web Development, and Data Analysis with certified completion.

Office Details:
- Address: ${companyConfig.address}
- Phone: ${companyConfig.phonePrimary}
- WhatsApp: ${companyConfig.whatsapp}
- Email: ${companyConfig.email}
- Hours: ${companyConfig.operatingHours}

Guidelines:
- Be concise, helpful, polite, and professional.
- Use clear bullet points and actionable guidance.
- Always include relevant next steps or URLs when appropriate (e.g., /services, /academy, /dashboard, /contact).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || "";
    return NextResponse.json({ text: replyText });
  } catch (err: unknown) {
    console.error("Gemini assistant route error:", err);
    return NextResponse.json({
      fallback: true,
      text: null,
    });
  }
}
