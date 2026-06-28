# TASKS.md

# DocStudio Development Tracker

> This file tracks the current progress of the project.
>
> Update this file whenever a task starts, completes, is blocked, or new work is added.
>
> Do not remove completed tasks. Move them to the Completed section.

---

# Project Status

Current Version:

v0.1.0

Current Phase:

Phase 2 — Design System & Component Library ✅

Overall Progress:

45%

Status:

🟢 Active Development

---

# Current Milestone

**Milestone 1**

Production Foundation

Target Goals

* ~~Complete project setup~~ ✅
* ~~Build design system (Phase 2)~~ ✅
* ~~Create reusable components (Phase 2)~~ ✅
* ~~Prepare architecture~~ ✅
* ~~Verify development environment~~ ✅

---

# Backlog

## PDF Tools (Phase 4)

* [ ] Image → PDF
* [ ] PDF → Images
* [ ] Compress PDF
* [ ] Rotate Pages
* [ ] Delete Pages
* [ ] Preview

---

## Merge (Phase 5)

* [ ] Merge Images
* [ ] Merge PDFs
* [ ] Mixed Merge
* [ ] Page Ordering
* [ ] Download

---

## Converter (Phase 6)

* [ ] JPG
* [ ] JPEG
* [ ] PNG
* [ ] WEBP
* [ ] Batch Conversion
* [ ] ZIP Download

---

## Settings (Phase 7)

* [ ] Image Settings
* [ ] PDF Settings
* [ ] Naming Rules
* [ ] Download Preferences
* [ ] Theme (full implementation)
* [ ] Import Settings
* [ ] Export Settings

---

# In Progress

No active tasks. Phase 3 is complete. Next: Phase 4 — PDF Tools.

---

# Blocked

None.

---

# Completed

## Phase 3 Architecture Overhaul (2026-06-28)

* [x] Python FastAPI backend initialized.
* [x] Client-side image processing (OpenCV, Canvas) deleted.
* [x] Auto-crop and AI document detection removed completely.
* [x] "Name" field removed from smart naming generation.
* [x] Unified "Upload -> Setup -> Process -> Download" UI.
* [x] Pillow-based cropping, resizing, and iterative compression implemented on backend.

---

## Phase 3 Bug Fixes & Refactoring (2026-06-27)

* [x] Download filename fixed: Generated blob is strictly converted to a `File` object to ensure OS-level filename assignment during browser download.
* [x] Refactored isolated Stepper into a Real-Time Editor Layout.
* [x] Implemented `useImagePipeline.ts` hook for unified, debounced background processing.
* [x] Preview is now live and explicitly tied to all crop/resize/settings changes.
* [x] Removed placeholder dummy variables and "fake" progress states.
* [x] Added `DebugPanel` strictly for development mode to track true output size and processing time.

---

## Phase 3 — Image Processor Module (2026-06-27)

* [x] UI & Workflow (Stepper, Selection, Mockups)
* [x] Upload Engine (File validation, object URL generation)
* [x] Crop Engine (`react-easy-crop` integration, manual rotation/zoom)
* [x] Auto Crop (`@techstark/opencv-js` running in a Web Worker for unblocking edge detection)
* [x] Resize (HTML5 Canvas scaling)
* [x] Compression Engine (Binary search algorithm for Target KB matching)
* [x] Format Conversion (JPG, PNG, WEBP)
* [x] Smart Naming (Dynamic filename generation)
* [x] Live Preview & Download (Blob extraction and `<a>` tag downloading)

### Verification Results (2026-06-27)

* [x] TypeScript passes (zero errors)
* [x] ESLint passes (zero errors)
* [x] OpenCV loads correctly in background worker
* [x] Pipeline generates exact target sizes
* [x] Production build succeeds

---

## Phase 2 — Design System & Component Library (2026-06-27)

* [x] Buttons (Primary, Secondary, Outline, Ghost, Danger)
* [x] Cards (Card, CardHeader, CardContent, etc.)
* [x] Upload Area (UploadZone)
* [x] Dialogs (Modal, ConfirmationDialog)
* [x] Notifications (ToastContainer)
* [x] Progress Indicators (ProgressBar)
* [x] Form Controls (TextInput, NumberInput, Select, Checkbox, RadioGroup, ToggleSwitch, Slider)
* [x] Navigation Components (Tabs, Breadcrumb)
* [x] Empty State Component
* [x] Alert Component
* [x] Badge Component
* [x] Build `/components` showcase page
* [x] Verify responsiveness, dark mode, accessibility

### Verification Results (2026-06-27)

* [x] TypeScript passes (zero errors)
* [x] ESLint passes (zero errors)
* [x] Production build succeeds (zero warnings)
* [x] Components rendered perfectly in browser without errors
* [x] Showcase layout works on Desktop/Mobile

---

## Phase 1 — Project Foundation (2026-06-27)

* [x] Initialize React + TypeScript + Vite project
* [x] Configure TypeScript (strict mode, path aliases)
* [x] Configure Tailwind CSS v4 with design tokens
* [x] Configure ESLint (TypeScript strict rules, no-any enforcement)
* [x] Configure Prettier
* [x] Configure Path Aliases (@/ → src/)
* [x] Create scalable folder structure (per 08_architecture.md)
* [x] Configure React Router (6 routes + 404)
* [x] Build AppLayout (Sidebar + TopNav + Content)
* [x] Build Sidebar (collapsible, active highlight, mobile drawer, animations)
* [x] Build TopNavigation (page title, theme toggle, mobile menu)
* [x] Build Dashboard with action cards
* [x] Configure Zustand stores (theme, UI, notifications)
* [x] Build theme system (light/dark/system, CSS custom properties, localStorage persistence)
* [x] Build ErrorBoundary component
* [x] Build LoadingScreen component
* [x] Build NotFoundPage (404)
* [x] Create placeholder pages (Image, PDF, Merge, Converter, Settings)
* [x] Create constants (routes, navigation, app config)
* [x] Create shared TypeScript types
* [x] Lazy-load all page components
* [x] Update index.html (title, meta description)

### Verification Results (2026-06-27)

* [x] TypeScript passes (zero errors)
* [x] ESLint passes (zero errors)
* [x] Production build succeeds (zero warnings)
* [x] All routes navigate correctly
* [x] Sidebar highlights active route
* [x] Sidebar collapses/expands with animation
* [x] Theme toggle cycles light → dark → system
* [x] 404 page renders for unknown routes
* [x] Back to Dashboard button works from 404
* [x] Responsive layout verified

---

# Bugs

## Critical

None

---

## Major

None

---

## Minor

None

---

# Technical Debt

None

---

# Documentation

Documentation Status

* [x] README
* [x] AGENTS
* [x] Project Setup
* [x] UI Design
* [x] Image Module
* [x] PDF Module
* [x] Merge Module
* [x] Converter Module
* [x] Settings
* [x] Architecture
* [x] Development Rules
* [x] Component Library
* [x] Master Plan
* [x] Quality Assurance

Update whenever documentation changes.

---

# Release Checklist

Before release verify:

* [x] TypeScript passes
* [x] ESLint passes
* [x] Build succeeds
* [ ] No console errors (verified for Phase 1)
* [ ] Responsive layout (verified for Phase 1)
* [ ] Accessibility review
* [ ] Performance review
* [ ] Browser testing
* [ ] Documentation updated

---

# Future Features

Keep ideas here until they become active work.

Examples

* OCR
* AI document classification
* Background removal
* Digital signatures
* Watermarking
* QR code detection
* Barcode detection
* Batch automation
* Cloud sync
* User accounts
* Plugin system

Do not move these into the backlog until they are approved.

---

# Notes

Use this section for project-wide reminders.

Examples

* All processing must remain client-side.
* Never upload user files.
* Reuse shared components before creating new ones.
* Follow the documentation in the docs folder.
* Keep the application production-ready at all times.

---

# AI Agent Instructions

Whenever starting a new session:

1. Read AGENTS.md.
2. Read the relevant documentation in the docs folder.
3. Review this TASKS.md file.
4. Continue the highest-priority unfinished task.
5. Update this file before ending the session.
6. Do not mark tasks complete without verification.
