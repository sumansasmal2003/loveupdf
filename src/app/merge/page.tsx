"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Trash2, File as FileIcon, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) return;

    setIsProcessing(true);
    try {
      // Create a new empty PDF
      const mergedPdf = await PDFDocument.create();

      // Loop through uploaded files and append them
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // Serialize the PDFDocument to bytes
      const mergedPdfBytes = await mergedPdf.save();

      // Trigger browser download
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "merged_document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("An error occurred while merging the files.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">
          Merge PDF Files
        </h1>
        <p className="text-[#c4c7c5]">
          Combine multiple PDFs into a single document in seconds.
        </p>
      </header>

      <FileUploader onUpload={handleUpload} />

      {files.length > 0 && (
        <div className="w-full mt-10">
          <h2 className="text-[#e3e3e3] font-medium mb-4 flex items-center gap-2">
            Files to merge ({files.length})
          </h2>

          <ul className="flex flex-col gap-3 mb-8">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.li
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="flex items-center justify-between p-4 bg-[#1e1f20] border border-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileIcon className="w-5 h-5 text-[#8ab4f8] shrink-0" />
                    <span className="text-[#c4c7c5] text-sm truncate">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-[#8e918f] hover:text-[#ef4444] transition-colors rounded-lg hover:bg-white/5"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <button
            onClick={mergePDFs}
            disabled={files.length < 2 || isProcessing}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${
              files.length < 2 || isProcessing
                ? "bg-[#1e1f20] text-[#8e918f] cursor-not-allowed border border-white/5"
                : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] hover:scale-105"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Merge files <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
