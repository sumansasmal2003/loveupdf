import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const redactions = formData.get("redactions") as string;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const hfFormData = new FormData();
    hfFormData.append("file", file);
    hfFormData.append("redactions", redactions || "[]");

    // 🔴 IMPORTANT: Use your actual Hugging Face space URL
    const HF_BACKEND_URL = "https://suman2003-pdf.hf.space/redact-pdf";

    const response = await fetch(HF_BACKEND_URL, {
      method: "POST",
      body: hfFormData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace('.pdf', '_redacted.pdf')}"`,
        "Content-Length": buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Redaction Error:", error);
    return NextResponse.json({ error: "Failed to process the document." }, { status: 500 });
  }
}
