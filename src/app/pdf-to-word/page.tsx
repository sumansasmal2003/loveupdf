"use client";

import { useState } from "react";
import { FileText, File as FileIcon, Loader2, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const convertToWord = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Send the file to our Next.js API bridge
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to convert file");
      }

      const blob = await response.blob();

      // CRITICAL FIX: If the blob is somehow JSON (an error), stop the download
      if (blob.type === "application/json") {
        throw new Error("Server returned an error instead of a document.");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", ".docx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up browser memory
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error converting PDF to Word:", error);
      alert("An error occurred during conversion. Please make sure your Hugging Face space is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">
          PDF to Word
        </h1>
        <p className="text-[#c4c7c5]">
          Convert your PDF to a fully editable Word document. Layouts and formatting are preserved perfectly.
        </p>
      </header>

      {!file ? (
        <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to convert" />
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
                    <span className="text-[#e3e3e3] font-medium truncate w-full block">
                      {file.name}
                    </span>
                    {isProcessing ? (
                      <span className="text-xs text-[#8ab4f8] mt-1 font-medium flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Converting securely...
                      </span>
                    ) : (
                      <span className="text-sm text-[#8e918f]">Ready for premium conversion</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  disabled={isProcessing}
                  className="p-2 text-[#8e918f] hover:text-[#ef4444] transition-colors rounded-lg hover:bg-white/5 shrink-0 ml-4 disabled:opacity-50"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#8ab4f8]/10 border border-[#8ab4f8]/20 rounded-xl mb-6">
                <Sparkles className="w-5 h-5 text-[#8ab4f8] shrink-0 mt-0.5" />
                <p className="text-sm text-[#c4c7c5]">
                  <strong className="text-[#8ab4f8] font-medium">Lossless & Private:</strong> Processed securely on your own custom backend. Zero watermarks, zero cost.
                </p>
              </div>

              <button
                onClick={convertToWord}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all ${
                  isProcessing
                    ? "bg-[#131314] text-[#8e918f] cursor-not-allowed border border-white/5"
                    : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] hover:scale-105"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#8ab4f8]" />
                    Processing Document...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" /> Convert to Word
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
