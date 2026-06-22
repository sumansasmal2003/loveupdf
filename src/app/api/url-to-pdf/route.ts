import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // 🔴 IMPORTANT: Use YOUR actual Hugging Face space URL here!
    const HF_BACKEND_URL = "https://suman2003-pdf.hf.space/url-to-pdf";

    const response = await fetch(HF_BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Python Backend Error: ${errorData}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="webpage_converted.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Conversion Error:", error);
    return NextResponse.json({ error: "Failed to convert URL." }, { status: 500 });
  }
}
