"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { File as FileIcon, Loader2, X, Download, Wrench, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

export default function RepairPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setSuccess(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setSuccess(false);
  };

  const repairPDF = async () => {
    if (!file) return;
    setIsProcessing(true);
    setSuccess(false);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // By passing ignoreEncryption, pdf-lib attempts a deep parse,
      // often bypassing minor corruptions in the xref tables.
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: true
      });

      // Saving it rebuilds the entire file structure from scratch
      const repairedBytes = await pdfDoc.save({ useObjectStreams: false });

      const blob = new Blob([repairedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `repaired_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (error) {
      console.error("Error repairing PDF:", error);
      alert("This file is too heavily corrupted to be repaired in the browser.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Repair PDF</h1>
        <p className="text-[#c4c7c5]">Fix broken or corrupted PDF files by rebuilding their internal structure.</p>
      </header>

      {!file ? (
        <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a corrupted PDF to repair" />
      ) : (
        <div className="w-full mt-4 max-w-2xl mx-auto">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col p-6 bg-[#1e1f20] border border-white/5 rounded-2xl relative overflow-hidden"
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
                    {success ? (
                      <span className="text-sm text-[#22c55e]">Successfully repaired!</span>
                    ) : isProcessing ? (
                      <span className="text-sm text-[#8ab4f8]">Rebuilding file structure...</span>
                    ) : (
                      <span className="text-sm text-[#8e918f]">Ready to repair</span>
                    )}
                  </div>
                </div>
                <button onClick={removeFile} disabled={isProcessing} className="p-2 text-[#8e918f] hover:text-[#ef4444] rounded-lg hover:bg-white/5 disabled:opacity-50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#131314] border border-white/5 rounded-xl mb-6">
                <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                <p className="text-sm text-[#c4c7c5]">
                  <strong className="text-[#f59e0b] font-medium">How it works:</strong> We will attempt to salvage the data by rewriting the broken cross-reference tables. Severe data corruption cannot always be recovered.
                </p>
              </div>

              <button
                onClick={repairPDF}
                disabled={isProcessing || success}
                className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all ${
                  isProcessing || success
                    ? "bg-[#131314] text-[#8e918f] cursor-not-allowed border border-white/5"
                    : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa]"
                }`}
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin text-[#8ab4f8]" /> Repairing...</>
                ) : success ? (
                  <><Download className="w-5 h-5" /> Download Repaired File</>
                ) : (
                  <><Wrench className="w-5 h-5" /> Repair PDF</>
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
