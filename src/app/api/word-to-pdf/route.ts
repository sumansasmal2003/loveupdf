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

    // 🔴 IMPORTANT: Use YOUR Hugging Face space URL + /word-to-pdf
    const HF_BACKEND_URL = "https://suman2003-pdf.hf.space/word-to-pdf";

    const response = await fetch(HF_BACKEND_URL, {
      method: "POST",
      body: hfFormData,
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
        "Content-Disposition": `attachment; filename="${file.name.replace('.docx', '.pdf')}"`,
        "Content-Length": buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Conversion Error:", error);
    return NextResponse.json({ error: "Failed to convert document." }, { status: 500 });
  }
}
