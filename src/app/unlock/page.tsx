"use client";

import { useState } from "react";
import { Unlock, LockKeyhole, File as FileIcon, Loader2, X, Download, KeyRound, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

export default function UnlockPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpload = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setErrorMessage("");
      setPassword("");
    }
  };

  const removeFile = () => {
    setFile(null);
    setPassword("");
    setErrorMessage("");
  };

  const unlockPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const response = await fetch("/api/unlock-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Extract the specific error message from the Python backend string
        const cleanError = errorData.error?.replace(/.*Exception: /, '').replace(/["{}]/g, '') || "Failed to unlock document.";
        throw new Error(cleanError);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_unlocked.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Unlock PDF</h1>
        <p className="text-[#c4c7c5]">Remove passwords and restrictions from your PDF documents securely.</p>
      </header>

      {!file ? (
        <FileUploader
          onUpload={handleUpload}
          maxFiles={1}
          title="Select a locked PDF document"
        />
      ) : (
        <div className="w-full mt-4 max-w-2xl mx-auto">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col p-6 bg-[#1e1f20] border border-white/5 rounded-2xl relative overflow-hidden shadow-lg"
            >
              {isProcessing && <div className="absolute top-0 left-0 right-0 h-1 bg-[#8ab4f8] animate-pulse w-full" />}

              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6 z-10 w-full">
                <div className="flex items-center gap-4 overflow-hidden flex-1 min-w-0">
                  <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 shrink-0">
                    <LockKeyhole className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                    <span className="text-[#e3e3e3] font-medium truncate w-full block">{file.name}</span>
                    <span className="text-sm text-red-400">Encrypted Document</span>
                  </div>
                </div>
                <button onClick={removeFile} disabled={isProcessing} className="p-2 text-[#8e918f] hover:text-[#ef4444] rounded-lg hover:bg-white/5 ml-4">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Password Input Area */}
              <div className="flex flex-col gap-4 mb-8">
                <label className="text-sm font-medium text-[#c4c7c5] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#8ab4f8]" /> Enter Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank if unlocking restrictions only..."
                  disabled={isProcessing}
                  className="bg-[#131314] border border-white/10 rounded-xl px-4 py-3 text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && unlockPdf()}
                />

                {/* Error Banner */}
                {errorMessage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-start gap-3 p-3 mt-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{errorMessage}</p>
                  </motion.div>
                )}
              </div>

              <button
                onClick={unlockPdf}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all ${
                  isProcessing ? "bg-[#131314] text-[#8e918f] border border-white/5 cursor-not-allowed" : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa]"
                }`}
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Unlocking...</> : <><Unlock className="w-5 h-5" /> Unlock & Download PDF</>}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
