import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const hfFormData = new FormData();
    hfFormData.append("file", file);

    const HF_BACKEND_URL = "https://suman2003-pdf.hf.space/excel-to-pdf";
    const response = await fetch(HF_BACKEND_URL, { method: "POST", body: hfFormData });

    if (!response.ok) throw new Error(`Backend Error: ${await response.text()}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.xlsx?$/, '.pdf')}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to convert document." }, { status: 500 });
  }
}
