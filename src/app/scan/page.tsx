"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Camera, Download, X, Trash2, SwitchCamera, Loader2, ScanLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");

  // Start the camera using the native WebRTC API
  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access the camera. Please ensure you have granted permissions.");
    }
  }, [facingMode]); // Removed stream from dependency array to prevent infinite loops

  // Clean up the camera when the user leaves the page
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const toggleCameraFacingMode = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
    startCamera();
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match the high-res video feed
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply a "Scan Filter" (increased contrast, slight grayscale for document readability)
    context.filter = "contrast(1.2) grayscale(0.3)";
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to a JPEG data URL
    const imageUrl = canvas.toDataURL("image/jpeg", 0.9);
    setImages(prev => [...prev, imageUrl]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const imageUrl of images) {
        // Embed the base64 JPEG directly into the PDF
        const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
        const jpgImage = await pdfDoc.embedJpg(imageBytes);

        // Create a new page matching the dimensions of the photo
        const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
        page.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: jpgImage.width,
          height: jpgImage.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `scanned_document_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate the PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-6xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">
          Scan to PDF
        </h1>
        <p className="text-[#c4c7c5]">
          Use your camera to scan physical documents directly into a PDF file.
        </p>
      </header>

      <div className="w-full flex flex-col lg:flex-row gap-8">

        {/* Left Side: Camera Interface */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative bg-[#1e1f20] border border-white/5 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center shadow-lg">
            {!stream ? (
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="p-4 bg-[#131314] rounded-full">
                  <Camera className="w-10 h-10 text-[#8ab4f8]" />
                </div>
                <div>
                  <p className="text-[#e3e3e3] font-medium mb-1">Camera Access Required</p>
                  <p className="text-sm text-[#8e918f] mb-4">We need permission to use your camera to scan documents.</p>
                  {cameraError && <p className="text-sm text-[#ef4444] mb-4">{cameraError}</p>}
                </div>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-[#8ab4f8] text-[#131314] rounded-xl font-medium hover:bg-[#a8c7fa] transition-colors"
                >
                  Enable Camera
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Visual Scanning Guide Line */}
                <div className="absolute inset-4 border-2 border-[#8ab4f8]/50 rounded-xl pointer-events-none z-10 hidden sm:block">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#8ab4f8]/30 shadow-[0_0_8px_rgba(138,180,248,0.5)] animate-[scan_3s_ease-in-out_infinite]" />
                </div>

                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-20">
                  <button
                    onClick={toggleCameraFacingMode}
                    className="p-3 bg-[#131314]/80 backdrop-blur-md text-[#e3e3e3] rounded-full hover:bg-white/20 transition-colors border border-white/10"
                    title="Switch Camera"
                  >
                    <SwitchCamera className="w-6 h-6" />
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-[#8ab4f8] rounded-full border-4 border-[#131314] shadow-[0_0_0_2px_#8ab4f8] hover:scale-105 transition-transform flex items-center justify-center"
                    title="Take Photo"
                  >
                    <Camera className="w-6 h-6 text-[#131314]" />
                  </button>
                </div>
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Right Side: Captured Images & Export */}
        <div className="flex-1 flex flex-col bg-[#1e1f20] border border-white/5 rounded-2xl p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
            <h2 className="text-xl font-medium text-[#e3e3e3] flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-[#8ab4f8]" /> Scanned Pages ({images.length})
            </h2>
            <button
              onClick={generatePDF}
              disabled={images.length === 0 || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#8ab4f8] text-[#131314] rounded-xl font-medium hover:bg-[#a8c7fa] transition-colors disabled:opacity-50"
            >
              {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Download className="w-4 h-4" /> Save PDF</>}
            </button>
          </div>

          {images.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#8e918f] text-center">
              <ScanLine className="w-12 h-12 mb-3 opacity-20" />
              <p>No pages scanned yet.</p>
              <p className="text-sm mt-1">Take a photo to add it to your document.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {images.map((imgUrl, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-[3/4] bg-[#131314] rounded-xl overflow-hidden border border-white/5 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Scanned page ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeImage(index)}
                        className="p-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center">
                      <span className="text-xs font-medium text-[#e3e3e3]">Page {index + 1}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Required for the scanning animation effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(300px); }
        }
      `}} />
    </div>
  );
}
