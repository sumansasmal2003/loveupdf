"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Hash, File as FileIcon, Loader2, X, Download, LayoutTemplate } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [position, setPosition] = useState<"bottom-center" | "bottom-right">("bottom-center");
  const [format, setFormat] = useState<"number" | "page-n" | "n-of-total">("number");

  const handleUpload = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const removeFile = () => setFile(null);

  const addPageNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Embed standard Helvetica font to draw the text
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      pages.forEach((page, index) => {
        const { width } = page.getSize();
        const pageNum = index + 1;

        // Determine the text based on the selected format
        let text = `${pageNum}`;
        if (format === "page-n") text = `Page ${pageNum}`;
        if (format === "n-of-total") text = `${pageNum} of ${totalPages}`;

        const textSize = 11;
        const textWidth = font.widthOfTextAtSize(text, textSize);

        // Calculate X position
        let x = width / 2 - textWidth / 2; // default: bottom-center
        if (position === "bottom-right") {
          x = width - textWidth - 30; // 30 points padding from the right edge
        }

        // Draw the text exactly 30 points from the bottom of the page
        page.drawText(text, {
          x,
          y: 30,
          size: textSize,
          font: font,
          color: rgb(0, 0, 0), // Solid black text
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_numbered.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error adding page numbers:", error);
      alert("An error occurred while numbering the document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Add Page Numbers</h1>
        <p className="text-[#c4c7c5]">Easily insert page numbers into your PDF documents with custom formatting.</p>
      </header>

      {!file ? (
        <FileUploader
          onUpload={handleUpload}
          maxFiles={1}
          title="Select a PDF document"
        />
      ) : (
        <div className="w-full mt-4 max-w-2xl mx-auto">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col p-6 bg-[#1e1f20] border border-white/5 rounded-2xl relative overflow-hidden shadow-lg"
            >
              {isProcessing && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
                   <div className="h-full bg-[#8ab4f8] animate-pulse w-full"></div>
                </div>
              )}

              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6 z-10 w-full">
                <div className="flex items-center gap-4 overflow-hidden flex-1 min-w-0">
                  <div className="p-3 bg-[#131314] rounded-xl border border-white/5 shrink-0">
                    <FileIcon className="w-6 h-6 text-[#8ab4f8]" />
                  </div>
                  <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                    <span className="text-[#e3e3e3] font-medium truncate w-full block">{file.name}</span>
                    <span className="text-sm text-[#8e918f]">Configure your numbering options</span>
                  </div>
                </div>
                <button onClick={removeFile} disabled={isProcessing} className="p-2 text-[#8e918f] hover:text-[#ef4444] rounded-lg hover:bg-white/5 ml-4">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formatting Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#c4c7c5] flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-[#8ab4f8]" /> Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as "bottom-center" | "bottom-right")}
                    disabled={isProcessing}
                    className="bg-[#131314] border border-white/10 rounded-xl px-4 py-3 text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] transition-colors"
                  >
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#c4c7c5] flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[#8ab4f8]" /> Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as "number" | "page-n" | "n-of-total")}
                    disabled={isProcessing}
                    className="bg-[#131314] border border-white/10 rounded-xl px-4 py-3 text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] transition-colors"
                  >
                    <option value="number">1, 2, 3</option>
                    <option value="page-n">Page 1, Page 2</option>
                    <option value="n-of-total">1 of X, 2 of X</option>
                  </select>
                </div>
              </div>

              <button
                onClick={addPageNumbers}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all ${
                  isProcessing ? "bg-[#131314] text-[#8e918f] border border-white/5" : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa]"
                }`}
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Numbering Pages...</> : <><Download className="w-5 h-5" /> Insert & Download PDF</>}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
