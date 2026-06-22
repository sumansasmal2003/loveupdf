<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/layers.svg" width="80" height="80" alt="LoveUPDF Logo">
  <h1>LoveUPDF</h1>
  <p><strong>A blazing-fast, secure, and comprehensive hybrid PDF manipulation suite.</strong></p>
</div>

---

## 🚀 Overview

LoveUPDF is a modern, enterprise-grade web application built to handle all your PDF needs. Designed with privacy and performance in mind, it utilizes a **Hybrid Processing Architecture**:

* **Browser-First (Local Processing):** Whenever possible (e.g., editing, cropping, rotating, watermarking, signing), operations are executed 100% locally in the browser using WebAssembly and `pdf-lib`. Your files never leave your device.
* **Server-Assisted (Cloud Processing):** For heavy computational tasks (e.g., converting PDF to Word/Excel, True Redaction, AES-256 encryption), the app securely interfaces with a FastAPI Python backend. Files are processed in memory and immediately destroyed.

---

## ✨ Features

LoveUPDF features a comprehensive suite of tools divided into four core categories:

### 🛠️ Edit & Organize
* **Edit PDF:** Pro-level overlay editor with Text, Whiteout, and Undo/Redo history.
* **Compare PDF:** Git-style unified diff viewer to highlight text additions and deletions.
* **Organize Pages:** Visually reorder, extract, or delete pages.
* **Rotate & Crop:** Spin individual pages or visually drag to crop document margins.
* **Add Watermarks & Page Numbers:** Highly customizable stamping tools.

### 🔄 Convert TO PDF
* **Word to PDF:** Perfectly preserve DOCX formatting.
* **HTML / JPG to PDF:** Instantly package web pages and images into documents.
* **Scan to PDF:** Digitize physical documents securely.

### 📤 Convert FROM PDF
* **PDF to Word (.docx):** Extract text and layouts into editable Word documents.
* **PDF to Excel (.xlsx):** Geometrically map and extract PDF tables into spreadsheets.
* **PDF to PowerPoint (.pptx):** Convert presentations accurately.
* **OCR PDF:** Extract readable text from flat images.

### 🔒 Security
* **Protect PDF:** Lock documents using military-grade AES-256 encryption.
* **Unlock PDF:** Strip passwords and owner restrictions from secured files.
* **Sign PDF:** Draw, type, or upload a custom e-signature and stamp it.
* **True Redact PDF:** *Permanently* shred and blackout underlying binary text data.

---

## 💻 Tech Stack

### Frontend (Next.js)
* **Framework:** Next.js 15 (App Router), React
* **Styling & Animation:** Tailwind CSS, Framer Motion
* **Icons:** Lucide React
* **PDF Engine (Local):** `pdf-lib` (Manipulation), `pdfjs-dist` (Rendering/Extraction)
* **Text Comparison:** `diff`

### Backend (Python / FastAPI)
* **Framework:** FastAPI, Uvicorn
* **PDF Engine (Cloud):** PyMuPDF (`fitz`)
* **Conversion Engines:** `pdf2docx`, `python-pptx`, `pdfplumber`, `pandas`, `openpyxl`
* **Hosting:** Hugging Face Spaces

---

## ⚙️ Getting Started

### Prerequisites
* Node.js 18+
* Python 3.9+

### 1. Setup the Frontend
Clone the repository and install the Next.js dependencies:
```bash
git clone [https://github.com/suman2003/loveupdf.git](https://github.com/suman2003/loveupdf.git)
cd loveupdf
npm install
