# 09 - Component Library Architecture

# Objective

This document defines the requirements for DocStudio's reusable UI components.

Before implementing any feature, the required UI components must be built and placed in the shared component library. Features should only contain business logic and layout, never raw UI elements like `<button>` or `<input>`.

---

# Design System Rules

1. **No Inline Styles:** Use Tailwind classes.
2. **Variants:** Components must support variants (e.g., primary, secondary, danger) via a variant prop.
3. **Accessibility:** Every component must support keyboard navigation, ARIA labels, and focus states.
4. **Icons:** Use `lucide-react` for all icons. Pass them as props where needed.
5. **Responsiveness:** Components must adapt to mobile and desktop screens automatically.

---

# Core Components Needed

## 1. Buttons

`Button.tsx`

**Props:**
* `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
* `size`: 'sm' | 'md' | 'lg'
* `icon`: LucideIcon (optional, left or right)
* `isLoading`: boolean
* `disabled`: boolean

**Behavior:**
* Show a spinner when `isLoading` is true.
* Prevent clicks when `disabled` or `isLoading`.

---

## 2. Inputs

`TextInput.tsx` / `NumberInput.tsx`

**Props:**
* `label`: string
* `description`: string (optional)
* `error`: string (optional)
* `icon`: LucideIcon (optional)

**Behavior:**
* Show red border and error text when `error` is provided.
* Must integrate cleanly with `react-hook-form`.

---

## 3. Select / Dropdown

`Select.tsx`

**Props:**
* `options`: Array of { value, label }
* `label`: string
* `error`: string (optional)

**Behavior:**
* Native `<select>` on mobile for better UX.
* Custom styled dropdown on desktop.

---

## 4. Cards

`Card.tsx`

**Props:**
* `title`: string (optional)
* `description`: string (optional)
* `footer`: ReactNode (optional)
* `noPadding`: boolean (optional)

**Behavior:**
* Standard white background with soft shadow.
* Border radius matching the design system.

---

## 5. File Upload Area

`UploadZone.tsx`

**Props:**
* `accept`: string (e.g., "image/*, .pdf")
* `multiple`: boolean
* `onUpload`: (files: File[]) => void
* `maxSize`: number (in bytes)

**Behavior:**
* Highlight when dragging files over it.
* Show error if file type or size is invalid.

---

## 6. Dialogs (Modals)

`Dialog.tsx`

**Props:**
* `isOpen`: boolean
* `title`: string
* `onClose`: () => void
* `footer`: ReactNode (optional)

**Behavior:**
* Trap focus inside the dialog when open.
* Close on ESC key.
* Close on backdrop click.

---

## 7. Notifications (Toasts)

`Toast.tsx` / `ToastContainer.tsx`

**Props:**
* `title`: string
* `message`: string
* `type`: 'success' | 'error' | 'warning' | 'info'
* `duration`: number (default 5000ms)

**Behavior:**
* Slide in from the top right.
* Auto-dismiss after `duration`.
* Pause timer on hover.

---

## 8. Progress Indicators

`ProgressBar.tsx`

**Props:**
* `progress`: number (0-100)
* `label`: string (optional)

`Spinner.tsx`

**Props:**
* `size`: 'sm' | 'md' | 'lg'
* `color`: 'primary' | 'white' | 'gray'

---

## 9. Badges

`Badge.tsx`

**Props:**
* `children`: ReactNode
* `variant`: 'default' | 'success' | 'warning' | 'error' | 'info'

---

## 10. Preview Panel

`PreviewPanel.tsx`

**Props:**
* `originalUrl`: string
* `processedUrl`: string
* `originalSize`: number
* `processedSize`: number

**Behavior:**
* Allow side-by-side comparison.
* Show before/after file sizes.

---

# Component Integration Rule

When building a feature (e.g., the Image Processor), you **must** use these components.

**Incorrect:**
```jsx
<button className="bg-blue-500 text-white rounded p-2" onClick={handleSave}>
  Save
</button>
```

**Correct:**
```jsx
<Button variant="primary" onClick={handleSave}>
  Save
</Button>
```

If a required component does not exist in the library, **build it first**, place it in `src/components/common`, and then use it in your feature.
