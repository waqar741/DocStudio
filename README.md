# README.md

# DocStudio

A production-quality browser-based document processing application built with modern web technologies.

---

## Overview

DocStudio is a private document utility designed for a small team (3–4 users). It provides fast, secure, client-side document processing without requiring a backend.

All processing occurs locally in the user's browser. No uploaded files are transmitted to external servers.

---

## Features

### Image Processing

* Automatic document detection
* Automatic crop
* Manual crop
* Resize images
* Compress to target file size
* Image format conversion
* Smart file naming
* Live preview

### PDF Tools

* Image → PDF
* PDF → Images
* Compress PDF
* Rotate Pages
* Delete Pages
* Preview PDF

### Merge

* Merge Images
* Merge PDFs
* Mixed Image + PDF Merge
* Drag-and-drop page ordering

### Converter

* JPG
* JPEG
* PNG
* WEBP
* Batch conversion
* ZIP download

### Settings

* Global defaults
* Smart naming rules
* Download preferences
* Theme
* Import/Export settings

---

## Tech Stack

Frontend

* React
* TypeScript
* Vite

Styling

* Tailwind CSS

State Management

* Zustand

Forms

* React Hook Form

Animation

* Framer Motion

Icons

* Lucide React

Image Processing

* OpenCV.js
* Cropper.js
* Canvas API

PDF

* pdf-lib
* jsPDF

Utilities

* JSZip

---

## Project Structure

src/

components/

features/

hooks/

services/

store/

types/

utils/

pages/

assets/

styles/

---

## Documentation

Project documentation is located inside:

docs/

01_project_setup.md

02_ui_design_system.md

03_image_processor.md

04_pdf_tools.md

05_merge_module.md

06_converter_module.md

07_settings.md

08_architecture.md

09_development_rules.md

10_component_library.md

11_master_implementation_plan.md

12_quality_assurance.md

These documents are the source of truth.

---

## Development

Install

```bash
npm install
```

Run

```bash
npm run dev
```

Build

```bash
npm run build
```

Preview

```bash
npm run preview
```

---

## Principles

* Client-side first
* Modular architecture
* Type-safe
* Accessible
* Responsive
* Reusable components
* No unnecessary dependencies
* Production-quality code

---

## Future Roadmap

* OCR
* AI-assisted document detection
* Background removal
* Batch automation
* Watermarks
* Digital signatures
* QR code detection
* Cloud synchronization

---

## License

Private project.
