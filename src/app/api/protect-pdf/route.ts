import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 });

    const hfFormData = new FormData();
    hfFormData.append("file", file);
    hfFormData.append("password", password);

    // 🔴 IMPORTANT: Use your actual Hugging Face space URL
    const HF_BACKEND_URL = "https://suman2003-pdf.hf.space/protect-pdf";

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
        "Content-Disposition": `attachment; filename="${file.name.replace('.pdf', '_protected.pdf')}"`,
        "Content-Length": buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Encryption Error:", error);
    return NextResponse.json({ error: "Failed to protect the document." }, { status: 500 });
  }
}
