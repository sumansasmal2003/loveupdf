"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Image as ImageIcon, Loader2, X, Download,
  Trash2, ArrowLeft, ArrowRight, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

export default function JpgToPdfPage() {
  const [images, setImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (files: File[]) => {
    setImages((prev) => [...prev, ...files]);
  };

  // Add more images via the grid button
  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setImages([]);
  };

  // Move images left or right in the array
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images];
    if (direction === 'left' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === 'right' && index < newImages.length - 1) {
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    }
    setImages(newImages);
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const image of images) {
        const imageBytes = await image.arrayBuffer();

        let embeddedImage;
        if (image.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        }

        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `images_converted.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while converting the images.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-6xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">JPG to PDF</h1>
        <p className="text-[#c4c7c5]">Convert, reorder, and merge your JPG or PNG images into a single PDF.</p>
      </header>

      {!images.length ? (
        <div className="w-full max-w-4xl mx-auto mb-8">
          <FileUploader
            onUpload={handleUpload}
            title="Select images to convert"
            accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
            acceptText="Only JPG and PNG images are supported"
          />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-6">
          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-[#1e1f20] border border-white/5 rounded-2xl sticky top-24 z-40 shadow-lg gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-[#131314] rounded-xl border border-white/5 shrink-0">
                <ImageIcon className="w-6 h-6 text-[#8ab4f8]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[#e3e3e3] font-medium block truncate">Ready to Convert</span>
                <span className="text-sm text-[#8e918f]">{images.length} images selected</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={generatePDF}
                disabled={isProcessing}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-medium transition-all bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] disabled:opacity-50"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Download className="w-5 h-5" /> Save PDF</>}
              </button>
              <button
                onClick={clearAll}
                disabled={isProcessing}
                className="p-3 text-[#8e918f] hover:text-[#ef4444] transition-colors rounded-xl bg-[#131314] border border-white/5 disabled:opacity-50 shrink-0"
                title="Clear all images"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Visual Grid */}
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {images.map((img, index) => (
                <motion.div
                  layout
                  key={`${img.name}-${index}-${img.lastModified}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="relative aspect-[3/4] bg-[#131314] rounded-xl overflow-hidden border border-white/5 group shadow-sm hover:border-white/20 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(img)} alt={`Upload ${index}`} className="w-full h-full object-cover" />

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeImage(index)}
                        className="p-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] shadow-lg transition-transform hover:scale-110"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between gap-2">
                      <button
                        onClick={() => moveImage(index, 'left')}
                        disabled={index === 0}
                        className="p-2 bg-[#1e1f20] text-white rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move left"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <span className="flex items-center text-xs font-medium text-white/80 bg-black/40 px-2 rounded-md">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => moveImage(index, 'right')}
                        disabled={index === images.length - 1}
                        className="p-2 bg-[#1e1f20] text-white rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move right"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* "Add More" Button Card */}
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 hover:border-[#8ab4f8] hover:bg-[#8ab4f8]/5 transition-colors"
              >
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-[#8e918f] hover:text-[#8ab4f8] transition-colors p-4 text-center">
                  <div className="p-3 bg-[#131314] rounded-full mb-3 border border-white/5">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Add more images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg, image/png"
                    className="hidden"
                    onChange={handleAddMore}
                    ref={fileInputRef}
                  />
                </label>
              </motion.div>

            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
}
