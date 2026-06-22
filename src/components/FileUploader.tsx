"use client";

import { useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  title?: string;
  accept?: Accept; // Allow custom file types
  acceptText?: string; // Text to show under the title
}

export default function FileUploader({
  onUpload,
  maxFiles = 0,
  title = "Drag & drop files here, or click to select",
  accept = { "application/pdf": [".pdf"] },
  acceptText = "Only PDF files are supported"
}: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles > 0 ? maxFiles : undefined,
    accept,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      {...getRootProps()}
      className={`flex flex-col items-center justify-center w-full h-64 p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 ${
        isDragActive
          ? "border-[#8ab4f8] bg-[#8ab4f8]/10"
          : "border-white/10 bg-[#1e1f20] hover:bg-[#282a2c] hover:border-white/20"
      }`}
    >
      <input {...getInputProps()} />
      <div className="p-4 mb-4 rounded-full bg-[#131314] border border-white/5">
        <UploadCloud className={`w-8 h-8 ${isDragActive ? "text-[#8ab4f8]" : "text-[#8ab4f8]"}`} />
      </div>
      <p className="text-lg font-medium text-[#e3e3e3] mb-2 text-center">
        {title}
      </p>
      <p className="text-sm text-[#8e918f] text-center">
        {acceptText}
      </p>
    </motion.div>
  );
}
