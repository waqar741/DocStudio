# 06 - Format Converter Module

# Objective

Build a flexible file conversion module for DocStudio.

The module should allow users to convert supported image and document formats while maintaining image quality, applying resizing/compression settings when requested, and generating standardized filenames.

All processing must happen locally in the browser.

No files should ever leave the user's device.

---

# Supported Conversions

## Images

JPG ↔ JPEG

JPG ↔ PNG

JPG ↔ WEBP

PNG ↔ WEBP

PNG ↔ JPEG

WEBP ↔ JPG

WEBP ↔ PNG

---

## Documents

Images → PDF

PDF → Images

(These tools should reuse the PDF module internally.)

---

# Workflow

1. Upload File(s)

↓

2. Detect Input Format

↓

3. Select Output Format

↓

4. Configure Output

↓

5. Preview

↓

6. Convert

↓

7. Download

---

# Upload

Support:

* Drag & Drop
* Click to Upload
* Multiple File Selection

Accepted formats:

JPG

JPEG

PNG

WEBP

PDF

Display:

Thumbnail (images)

PDF icon (documents)

File Name

File Size

Dimensions (images)

Page Count (PDF)

---

# Automatic Format Detection

The application should automatically identify the uploaded format.

Display:

Input Format

Output Format

Example:

Input:

PNG

↓

Output:

JPG

Users should not manually specify the input format.

---

# Output Settings

Allow users to configure:

Output Format

Image Quality

Resolution

Width

Height

Target File Size (KB)

Maintain Aspect Ratio

Background Color (when converting transparent images)

Compression Level

Default values should come from the Settings module.

---

# Transparency Handling

When converting formats that support transparency (PNG/WEBP) to JPG:

Allow users to choose a background:

* White
* Black
* Custom Color

Preview the result before conversion.

---

# Batch Conversion

Support converting multiple files at once.

Users can:

Convert all files to the same format

Apply identical settings to all

Download results as a ZIP archive

---

# Preview

Display:

Original File

↓

Converted Preview

Users can zoom the preview.

For batch conversions, show previews for the selected file.

---

# Smart Naming

Reuse the application's naming system.

Relationship

Name

Document Type

Optional Custom Suffix

Examples:

Self_Waqar_PAN.jpg

Mother_Fatima_Aadhaar.webp

Brother_Ali_Photo.png

---

# Processing

The conversion pipeline should perform:

Read File

↓

Resize (optional)

↓

Compress (optional)

↓

Convert Format

↓

Apply Smart Filename

↓

Generate Preview

↓

Download

Each stage should report progress.

---

# Validation

Prevent:

Unsupported formats

Empty uploads

Invalid dimensions

Invalid target file size

Zero-byte files

Provide user-friendly error messages.

---

# Progress

Display:

Reading File

Converting

Compressing

Preparing Download

Completed

Users should always know the current stage.

---

# Download

Single File:

Download immediately.

Multiple Files:

Package all converted files into a ZIP archive and download.

---

# Performance

Target support:

100 Images

20 MB per Image

Batch Conversion

Fast local processing

Use background processing where appropriate to keep the UI responsive.

---

# Shared Components

Reuse existing application components:

Upload Area

Settings Panel

Preview Panel

Progress Dialog

Toast Notifications

Download Manager

Do not create duplicate UI components.

---

# Future Compatibility

The architecture should support future additions:

HEIC Support

TIFF Support

SVG Export

AVIF Support

BMP Support

Animated WEBP

Metadata Editing

Watermarking

AI Enhancement

No major refactoring should be required.

---

# Deliverables

At the end of this module, users should be able to:

✓ Convert between supported image formats

✓ Convert images and PDFs using shared tools

✓ Resize images during conversion

✓ Compress files to target sizes

✓ Preserve or customize transparency handling

✓ Batch convert multiple files

✓ Preview converted results

✓ Generate standardized filenames

✓ Download individual files or ZIP archives

The module should be fully client-side, responsive, reusable, and integrated with the application's shared processing pipeline and settings system.
