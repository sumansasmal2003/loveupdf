"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { Stamp, File as FileIcon, Loader2, X, Download, Type, Droplet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState("0.3");

  const handleUpload = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const removeFile = () => setFile(null);

  const addWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Use a bold font to make the watermark stand out
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const textSize = 60;
        const textWidth = font.widthOfTextAtSize(watermarkText, textSize);
        const textHeight = font.heightAtSize(textSize);

        // Draw the text diagonally in the exact center of the page
        page.drawText(watermarkText, {
          x: width / 2 - textWidth / 2 + 50, // Offset slightly to account for rotation math
          y: height / 2 - textHeight / 2 - 50,
          size: textSize,
          font: font,
          color: rgb(0.5, 0.5, 0.5), // Medium gray
          opacity: parseFloat(opacity),
          rotate: degrees(45),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_watermarked.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error adding watermark:", error);
      alert("An error occurred while stamping the document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Add Watermark</h1>
        <p className="text-[#c4c7c5]">Stamp custom text across your document pages to protect your work.</p>
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
                    <span className="text-sm text-[#8e918f]">Configure your watermark</span>
                  </div>
                </div>
                <button onClick={removeFile} disabled={isProcessing} className="p-2 text-[#8e918f] hover:text-[#ef4444] rounded-lg hover:bg-white/5 ml-4">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Watermark Configuration */}
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#c4c7c5] flex items-center gap-2">
                    <Type className="w-4 h-4 text-[#8ab4f8]" /> Custom Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="e.g. CONFIDENTIAL or DRAFT"
                    disabled={isProcessing}
                    className="bg-[#131314] border border-white/10 rounded-xl px-4 py-3 text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#c4c7c5] flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-[#8ab4f8]" /> Transparency
                    </label>
                    <span className="text-xs text-[#8e918f]">{Math.round(parseFloat(opacity) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(e.target.value)}
                    disabled={isProcessing}
                    className="w-full accent-[#8ab4f8]"
                  />
                  <div className="flex justify-between text-xs text-[#8e918f]">
                    <span>Faint</span>
                    <span>Solid</span>
                  </div>
                </div>
              </div>

              <button
                onClick={addWatermark}
                disabled={isProcessing || !watermarkText.trim()}
                className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all ${
                  isProcessing || !watermarkText.trim() ? "bg-[#131314] text-[#8e918f] border border-white/5 cursor-not-allowed" : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa]"
                }`}
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Applying Stamp...</> : <><Stamp className="w-5 h-5" /> Stamp & Download PDF</>}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
