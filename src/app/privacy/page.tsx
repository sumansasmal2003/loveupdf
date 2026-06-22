"use client";

import { Shield, FileText, Server, Lock, Cookie, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 22, 2026";

  const sections = [
    {
      icon: <FileText className="w-6 h-6 text-[#8ab4f8]" />,
      title: "1. How We Handle Your Files",
      content: (
        <div className="flex flex-col gap-3">
          <p>At LoveUPDF, your privacy is our absolute priority. We operate on a hybrid processing model to ensure maximum security:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2 mt-2">
            <li><strong className="text-[#e3e3e3]">Local Processing:</strong> Many of our tools (such as PDF editing, rotating, and cropping) run entirely within your web browser. For these tools, your files never leave your device and are never uploaded to any server.</li>
            <li><strong className="text-[#e3e3e3]">Cloud Processing:</strong> Tools requiring heavy computation (such as converting Word to PDF, True Redaction, and AES-256 Encryption) utilize our secure backend servers.</li>
            <li><strong className="text-red-400">Strict Deletion Policy:</strong> When a file is uploaded to our secure servers for processing, it is held in temporary memory just long enough to complete the task. <strong>Once the conversion or modification is complete, your original file and the processed output are immediately and permanently deleted from our servers.</strong> We do not keep backups, logs, or copies of your documents.</li>
          </ul>
        </div>
      )
    },
    {
      icon: <Server className="w-6 h-6 text-[#8ab4f8]" />,
      title: "2. Information We Collect",
      content: (
        <p>
          We believe in data minimization. LoveUPDF does not require you to create an account, log in, or provide personal information to use our standard suite of tools. We do not collect your name, email address, or payment details unless you explicitly contact us for support or business inquiries. We may collect anonymous, non-identifying usage analytics (such as which tools are most popular) to help us improve the platform.
        </p>
      )
    },
    {
      icon: <Lock className="w-6 h-6 text-[#8ab4f8]" />,
      title: "3. Data Security",
      content: (
        <p>
          All data transfers between your browser and our servers are secured using industry-standard TLS/HTTPS encryption. This ensures that your files cannot be intercepted while in transit. Furthermore, our "Protect PDF" feature utilizes military-grade AES-256 encryption to ensure your documents remain completely secure even after they leave our platform.
        </p>
      )
    },
    {
      icon: <Cookie className="w-6 h-6 text-[#8ab4f8]" />,
      title: "4. Cookies and Local Storage",
      content: (
        <p>
          LoveUPDF uses essential local storage to save your UI preferences (such as dark mode settings or recently used tool shortcuts) directly on your device. We do not use invasive tracking cookies or sell your browsing data to third-party advertising networks.
        </p>
      )
    },
    {
      icon: <Mail className="w-6 h-6 text-[#8ab4f8]" />,
      title: "5. Contact Us",
      content: (
        <div className="flex flex-col gap-3">
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us at our primary office:</p>
          <address className="not-italic bg-[#131314] p-4 rounded-xl border border-white/5 mt-2 text-[#e3e3e3]">
            <strong>LoveUPDF</strong><br />
            Sijgeria, Debra<br />
            Paschim Medinipur<br />
            West Bengal, 721139<br />
            India<br /><br />
            <span className="text-[#8ab4f8]">Phone:</span> +91 99330 12328
          </address>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-16 w-full mt-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#8ab4f8]/10 rounded-2xl border border-[#8ab4f8]/20">
            <Shield className="w-12 h-12 text-[#8ab4f8]" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#e3e3e3] mb-6">
          Privacy Policy
        </h1>
        <div className="flex items-center justify-center gap-2 text-[#8e918f]">
          <Clock className="w-4 h-4" />
          <span>Last updated: {lastUpdated}</span>
        </div>
        <p className="text-lg text-[#c4c7c5] max-w-2xl mx-auto mt-6 leading-relaxed">
          At LoveUPDF, we believe your files are your business. This policy outlines how we protect your data while you use our tools.
        </p>
      </header>

      <div className="w-full flex flex-col gap-8">
        {sections.map((section, index) => (
          <motion.section
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col md:flex-row gap-6 p-6 sm:p-8 bg-[#1e1f20] border border-white/5 rounded-2xl shadow-lg"
          >
            <div className="shrink-0">
              <div className="p-3 bg-[#131314] rounded-xl border border-white/5">
                {section.icon}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-medium text-[#e3e3e3]">{section.title}</h2>
              <div className="text-[#8e918f] leading-relaxed text-sm sm:text-base">
                {section.content}
              </div>
            </div>
          </motion.section>
        ))}
      </div>

      <div className="mt-16 text-center text-[#8e918f] text-sm max-w-2xl">
        <p>
          By continuing to use LoveUPDF, you agree to the practices described in this Privacy Policy. We reserve the right to update this policy as we add new features and tools to our platform.
        </p>
      </div>
    </div>
  );
}
