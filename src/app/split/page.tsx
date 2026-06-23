"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Scissors, File as FileIcon, Loader2, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // When a file is uploaded, we quickly read it to get the total page count
  const handleUpload = async (files: File[]) => {
    if (files.length > 0) {
      const uploadedFile = files[0];
      setFile(uploadedFile);

      try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setTotalPages(pdf.getPageCount());
        // Default to extracting all pages as a starting string
        setPageRange(`1-${pdf.getPageCount()}`);
      } catch (error) {
        console.error("Error reading PDF:", error);
        alert("Could not read the PDF file. It might be corrupted or password protected.");
        setFile(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setTotalPages(0);
    setPageRange("");
  };

  // Helper function to turn strings like "1, 3-5" into an array of 0-based indices [0, 2, 3, 4]
  const parsePageRangeInput = (input: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(",").map((p) => p.trim());

    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-");
        const start = parseInt(startStr);
        const end = parseInt(endStr);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= maxPages) pages.add(i - 1);
          }
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && num >= 1 && num <= maxPages) pages.add(num - 1);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const splitPDF = async () => {
    if (!file || !pageRange) return;

    const pagesToExtract = parsePageRangeInput(pageRange, totalPages);

    if (pagesToExtract.length === 0) {
      alert("Please enter a valid page range.");
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);

      // Create a brand new PDF
      const newPdf = await PDFDocument.create();

      // Copy only the requested pages
      const copiedPages = await newPdf.copyPages(originalPdf, pagesToExtract);
      copiedPages.forEach((page) => newPdf.addPage(page));

      // Save and trigger download
      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `extracted_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("An error occurred while splitting the file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">
          Split & Extract PDF
        </h1>
        <p className="text-[#c4c7c5]">
          Extract specific pages from your PDF to create a new document.
        </p>
      </header>

      {!file ? (
        <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to split" />
      ) : (
        <div className="w-full mt-4">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col p-6 bg-[#1e1f20] border border-white/5 rounded-2xl"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3 bg-[#131314] rounded-xl border border-white/5 shrink-0">
                    <FileIcon className="w-6 h-6 text-[#8ab4f8]" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[#e3e3e3] font-medium truncate">
                      {file.name}
                    </span>
                    <span className="text-sm text-[#8e918f]">
                      {totalPages} pages total
                    </span>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 text-[#8e918f] hover:text-[#ef4444] transition-colors rounded-lg hover:bg-white/5 shrink-0"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                <label htmlFor="pageRange" className="text-sm font-medium text-[#c4c7c5]">
                  Pages to extract
                </label>
                <input
                  id="pageRange"
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g. 1, 3-5, 8"
                  className="w-full px-4 py-3 bg-[#131314] border border-white/10 rounded-xl text-[#e3e3e3] placeholder-[#8e918f] focus:outline-none focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] transition-all"
                />
                <p className="text-xs text-[#8e918f]">
                  Example: <span className="text-[#8ab4f8]">1, 3-5, 8</span> will extract pages 1, 3, 4, 5, and 8.
                </p>
              </div>

              <button
                onClick={splitPDF}
                disabled={!pageRange || isProcessing}
                className={`w-full sm:w-auto self-end flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${
                  !pageRange || isProcessing
                    ? "bg-[#131314] text-[#8e918f] cursor-not-allowed border border-white/5"
                    : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] hover:scale-105"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Scissors className="w-5 h-5" /> Extract Pages
                  </>
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
