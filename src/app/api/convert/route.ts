import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const hfFormData = new FormData();
    hfFormData.append("file", file);

    // 🔴 IMPORTANT: Replace this with your actual Hugging Face Space URL!
    const HF_BACKEND_URL = "https://suman2003-pdf.hf.space/convert";

    const response = await fetch(HF_BACKEND_URL, {
      method: "POST",
      body: hfFormData,
    });

    if (!response.ok) {
      // If Python crashes, we will now accurately catch it hereW
      const errorData = await response.text();
      throw new Error(`Python Backend Error: ${errorData}`);
    }

    // 1. Get raw ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // 2. CRITICAL FIX: Convert to a strict Node Buffer to prevent data loss
    const buffer = Buffer.from(arrayBuffer);

    // 3. Return with explicit Content-Length
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${file.name.replace('.pdf', '.docx')}"`,
        "Content-Length": buffer.length.toString(), // Prevents file truncation
      },
    });

  } catch (error) {
    console.error("Conversion Error:", error);
    return NextResponse.json(
      { error: "Failed to convert document." },
      { status: 500 }
    );
  }
}
