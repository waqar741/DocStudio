# 10 - Development Rules & Best Practices

# Objective

This document outlines the strict coding standards and rules that all developers (and AI agents) must follow when contributing to DocStudio.

Consistency is critical for long-term maintainability.

---

# 1. Type Safety (TypeScript)

* **No `any`:** Never use `any`. Define proper interfaces or use `unknown` if the type is truly dynamic.
* **Strict Mode:** The project runs with TypeScript `strict: true`. Do not bypass it.
* **Interfaces over Types:** Prefer `interface` for object shapes, use `type` for unions or intersections.
* **Return Types:** Explicitly define return types for complex functions and custom hooks.

---

# 2. React Best Practices

* **Functional Components:** Only use functional components. No class components.
* **Hooks:** Follow the Rules of Hooks. Keep hooks small and focused.
* **Memoization:** Use `useMemo` and `useCallback` only when necessary (e.g., passing props to heavy child components or dependency arrays). Do not over-memoize simple values.
* **State Management:**
  * Local state: `useState`, `useReducer`
  * Global state: `Zustand`
  * Form state: `react-hook-form`
  * Do not put temporary UI state (like dropdown open/closed) in global state.

---

# 3. Styling & Tailwind

* **No Inline Styles:** Use Tailwind classes instead of `style={{ ... }}` unless dealing with dynamic calculated values (e.g., `width: ${progress}%`).
* **Design Tokens:** Always use the defined Tailwind configuration (colors, spacing, typography). Do not use arbitrary values like `text-[#123456]` unless it is a specific brand requirement that cannot be tokenized.
* **Class Organization:** Group classes logically (e.g., layout, spacing, typography, colors, interactions).

---

# 4. File & Folder Organization

* **Colocation:** Keep files close to where they are used. If a component is only used by the Image Processor, put it in `features/image/components/`, not in the global `components/common/`.
* **Barrel Exports:** Use `index.ts` files to export public APIs from a folder.
* **Naming:**
  * Components: `PascalCase.tsx`
  * Hooks: `camelCase.ts` (must start with "use")
  * Utilities: `camelCase.ts`
  * Constants: `UPPER_SNAKE_CASE`

---

# 5. Error Handling

* **Graceful Degradation:** The app should not crash if an image cannot be processed. Catch the error, show a toast notification, and allow the user to try again.
* **User-Friendly Messages:** Do not show raw error strings like `TypeError: Cannot read properties of undefined`. Show "We couldn't process this image. Please try another format."

---

# 6. Performance

* **Lazy Loading:** Use `React.lazy` and `Suspense` for route-level code splitting.
* **Large Files:** When processing large images or PDFs, do not block the main thread. Use `requestAnimationFrame`, `setTimeout`, or Web Workers if necessary to keep the UI responsive.
* **Memory Leaks:** Always clean up object URLs (`URL.revokeObjectURL`) and event listeners in `useEffect` cleanup functions.

---

# 7. Git Workflow

* **Commit Messages:** Use conventional commits:
  * `feat:` New feature
  * `fix:` Bug fix
  * `refactor:` Code change that neither fixes a bug nor adds a feature
  * `style:` Formatting, missing semi-colons, etc.
  * `docs:` Documentation only changes
* **Atomic Commits:** Keep commits small and focused on a single change.

---

# 8. AI Agent Specific Rules

If you are an AI agent working on this codebase:
1. **Read First:** Always check existing code and documentation before creating something new.
2. **Don't Duplicate:** If a button component exists, use it. Do not create a new one.
3. **Ask for Clarification:** If the requirements are ambiguous, list the options and ask the user how to proceed rather than making assumptions.
4. **Follow the Plan:** Stick to the implementation plan agreed upon for the current task. Do not refactor unrelated code unless explicitly asked.
