# 01 - Project Setup & Design System

## Project Overview

Build a production-quality web application named **DocStudio** (working title).

This is a private document processing tool intended for only 3–4 users. Although the user count is small, the application should be designed as if it were a real SaaS product with clean architecture, reusable components, excellent UX, and maintainable code.

There will be **no backend** in the initial version. All image and PDF processing must happen locally in the browser.

---

# Primary Goal

Create only the project foundation.

Do **NOT** implement document processing features yet.

The objective of this phase is to build a scalable architecture that will make future development easier.

---

# Tech Stack

Use:

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Zustand
* React Hook Form
* Framer Motion
* Lucide React

Use the latest stable versions.

---

# Code Quality

The project should follow production-level standards.

Requirements:

* Type-safe code
* Modular architecture
* Reusable components
* Clean folder structure
* No duplicated code
* Strict TypeScript
* ESLint
* Prettier
* Path aliases
* Meaningful file names

---

# Folder Structure

Create a scalable folder structure.

Example:

src/

assets/

components/

common/

layout/

ui/

features/

image/

pdf/

merge/

converter/

settings/

pages/

hooks/

lib/

services/

store/

styles/

types/

utils/

App.tsx

main.tsx

The structure may be improved if a better organization is appropriate.

---

# Routing

Prepare routing for future modules.

Routes:

/

Dashboard

/image

Image Processor

/pdf

PDF Tools

/merge

Merge Documents

/converter

Format Converter

/settings

Settings

Each page should initially contain a clean placeholder.

---

# Global Layout

Create one reusable application layout.

It should include:

* Left Sidebar
* Top Navigation
* Main Content Area

The layout should automatically work with all future pages.

---

# Sidebar

Sidebar should include:

Dashboard

Image Processor

PDF Tools

Merge

Converter

Settings

Icons should come from Lucide.

Active page should be highlighted.

Sidebar should be collapsible.

---

# Top Navigation

Include:

Application Logo

Current Page Title

Theme Toggle (prepare only)

User Menu placeholder

---

# Design Language

Avoid generic AI-generated dashboard styles.

The UI should feel similar to modern productivity software.

Requirements:

* Professional
* Clean
* Spacious
* Minimal
* Elegant
* Easy to scan

No excessive gradients.

No glassmorphism.

No flashy colors.

---

# Color Palette

Primary

Blue

Success

Green

Warning

Orange

Danger

Red

Background

Very Light Gray

Surface

White

Border

Light Gray

Text

Dark Gray

Maintain accessibility and good contrast.

---

# Typography

Create reusable typography styles.

Heading XL

Heading L

Heading M

Heading S

Body

Small

Caption

Use consistent font weights and spacing.

---

# Spacing System

Create a consistent spacing scale.

Small

Medium

Large

Extra Large

Avoid arbitrary spacing values.

---

# Shadows

Create reusable elevation styles.

Small

Medium

Large

Keep shadows subtle.

---

# Border Radius

Use a consistent radius system.

Small

Medium

Large

Avoid random radius values.

---

# Reusable Components

Build reusable UI components.

Buttons

* Primary
* Secondary
* Outline
* Ghost
* Danger

Inputs

* Text
* Number
* Search

Select

Textarea

Checkbox

Radio Button

Toggle Switch

Slider

Badge

Alert

Toast

Card

Dialog

Modal

Progress Bar

Loading Spinner

Tooltip

Dropdown Menu

Tabs

Breadcrumb

Pagination

Every component should be reusable.

---

# Responsiveness

Support:

Desktop

Laptop

Tablet

Mobile

Sidebar should collapse on smaller screens.

---

# State Management

Configure Zustand.

Create a placeholder global store.

Future modules will use this store.

---

# Theme

Prepare dark mode architecture.

Implementation can remain basic.

---

# Error Handling

Create:

404 Page

Error Boundary

Loading Screen

---

# Assets

Create folders for:

Icons

Images

Logos

Fonts

---

# Utilities

Prepare utility functions folder.

Future helper functions will live here.

---

# Constants

Create a constants directory for:

Routes

Application Names

Sidebar Navigation

Default Settings

---

# Future Modules

This architecture must support future implementation of:

* Automatic document detection
* Manual crop
* Image resize
* Image compression
* Image conversion
* JPG to PDF
* PDF to Image
* Merge PDFs
* Merge Images
* Smart file naming
* User settings
* Batch processing

No future module should require restructuring the project.

---

# Deliverables

At the end of this phase the application should provide:

✓ Clean project architecture

✓ Fully working routing

✓ Responsive layout

✓ Sidebar

✓ Top Navigation

✓ Design system

✓ Reusable UI components

✓ Type-safe codebase

✓ Production-ready foundation

No document processing functionality should be implemented in this phase.
