# AGENTS.md

# AI Development Context

This document provides implementation rules for AI coding agents working on this repository.

Examples include:

* Antigravity
* Claude Code
* Cursor
* Windsurf
* GitHub Copilot
* Other autonomous coding agents

---

# Primary Goal

Build a production-quality browser-based document processing application.

The application must prioritize:

* Code quality
* Maintainability
* Performance
* Accessibility
* User experience

Do not optimize only for speed of implementation.

---

# Source of Truth

Always follow documentation inside:

docs/

If two documents appear to conflict:

1. Architecture
2. Latest documentation
3. Existing implementation

Never invent functionality that contradicts project documentation.

---

# Development Rules

Before writing code:

Understand the existing architecture.

Search for reusable components.

Search for reusable services.

Avoid duplication.

Never rewrite working modules unnecessarily.

---

# Architecture Rules

Follow the architecture defined in:

08_architecture.md

Never bypass shared services.

Never duplicate business logic.

Never hardcode application settings.

---

# UI Rules

Always use shared components.

Never build feature-specific buttons, dialogs, upload areas, preview panels, or settings controls if reusable alternatives already exist.

---

# Processing Rules

All processing must occur locally.

Never upload user files.

Never call external APIs for image or PDF processing.

Do not introduce backend dependencies unless explicitly requested.

---

# State Rules

Global state:

Zustand

Local state:

React hooks

Do not store temporary UI state globally.

---

# Coding Rules

Always:

Use TypeScript.

Avoid any.

Prefer interfaces.

Use descriptive names.

Keep functions small.

Keep components focused.

Avoid large files.

---

# Performance

Prefer lazy loading.

Avoid unnecessary renders.

Avoid blocking the UI.

Use asynchronous processing where appropriate.

Support large files without freezing the interface.

---

# Accessibility

Every new UI must support:

Keyboard navigation

Visible focus

ARIA labels where applicable

Proper color contrast

Responsive layouts

---

# Testing

Before considering work complete:

Run linting.

Run type checking.

Verify responsive layout.

Verify accessibility.

Verify processing.

Verify downloads.

Never assume functionality works without testing.

---

# Documentation

Whenever a significant architectural decision is made:

Update documentation.

If a reusable component is introduced:

Document it.

If a shared service changes:

Document it.

---

# Refactoring

Only refactor when:

Improves maintainability

Reduces duplication

Improves performance

Do not refactor for stylistic preferences alone.

---

# Git

Use descriptive commit messages.

Examples:

feat:

fix:

refactor:

docs:

test:

style:

Avoid generic commit messages.

---

# Definition of Done

A task is complete only if:

✓ Feature works

✓ TypeScript passes

✓ ESLint passes

✓ UI matches design

✓ Responsive

✓ Accessible

✓ No duplicated logic

✓ Uses shared components

✓ Uses shared services

✓ Documentation updated where required

---

# Forbidden

Do NOT:

Introduce unnecessary dependencies.

Use inline styles.

Duplicate components.

Duplicate services.

Hardcode settings.

Ignore TypeScript errors.

Disable ESLint rules to bypass issues.

Break existing features.

Upload user files.

Store sensitive user data.

---

# Preferred Development Workflow

1. Read documentation.

2. Review existing code.

3. Plan implementation.

4. Build reusable components first.

5. Implement feature.

6. Test feature.

7. Refactor if needed.

8. Update documentation.

9. Verify Definition of Done.

Only then move to the next task.

---

# Project Vision

DocStudio should feel like a polished commercial desktop-quality web application.

Every implementation should prioritize long-term maintainability over short-term speed.

When in doubt, choose the solution that is cleaner, more reusable, and easier to extend.
