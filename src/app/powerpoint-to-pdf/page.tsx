"use client";

import { useState } from "react";
import { Presentation, Loader2, X, Download, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

export default function PowerPointToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const convertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/powerpoint-to-pdf", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Conversion failed");

      const blob = await response.blob();
      if (blob.type === "application/json") throw new Error("Server error");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.pptx?$/, ".pdf");
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error during conversion. Ensure server is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">PowerPoint to PDF</h1>
        <p className="text-[#c4c7c5]">Turn your PPT and PPTX slideshows into easy-to-share PDF documents.</p>
      </header>

      {!file ? (
        <FileUploader
          onUpload={(f) => setFile(f[0])}
          maxFiles={1}
          title="Select a PowerPoint presentation"
          accept={{ "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"], "application/vnd.ms-powerpoint": [".ppt"] }}
          acceptText="Supports .pptx and .ppt files"
        />
      ) : (
        <div className="w-full mt-4 max-w-2xl mx-auto">
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col p-6 bg-[#1e1f20] border border-white/5 rounded-2xl relative overflow-hidden">
              {isProcessing && <div className="absolute top-0 left-0 right-0 h-1 bg-[#8ab4f8] animate-pulse" />}

              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6 z-10">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 bg-[#131314] rounded-xl border border-white/5 shrink-0"><Presentation className="w-6 h-6 text-[#8ab4f8]" /></div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[#e3e3e3] font-medium truncate">{file.name}</span>
                    <span className="text-sm text-[#8e918f]">{isProcessing ? "Converting slides..." : "Ready for conversion"}</span>
                  </div>
                </div>
                <button onClick={() => setFile(null)} disabled={isProcessing} className="p-2 text-[#8e918f] hover:text-[#ef4444] rounded-lg hover:bg-white/5 ml-4"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#8ab4f8]/10 border border-[#8ab4f8]/20 rounded-xl mb-6">
                <Sparkles className="w-5 h-5 text-[#8ab4f8] shrink-0 mt-0.5" />
                <p className="text-sm text-[#c4c7c5]">Layouts, fonts, and slide dimensions will be preserved exactly as they appear.</p>
              </div>

              <button onClick={convertToPdf} disabled={isProcessing} className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all ${isProcessing ? "bg-[#131314] text-[#8e918f]" : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa]"}`}>
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Download className="w-5 h-5" /> Convert to PDF</>}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
