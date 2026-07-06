import { forwardRef, useCallback, useState, useEffect } from 'react'
import type { HTMLAttributes } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface UploadZoneProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  onDropFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  title?: string
  description?: string
  disabled?: boolean
  error?: string
}

export const UploadZone = forwardRef<HTMLDivElement, UploadZoneProps>(
  (
    {
      className,
      onDropFiles,
      accept = 'image/*,application/pdf',
      multiple = true,
      title = 'Drag & drop files here',
      description = 'Or click to select files from your computer',
      disabled = false,
      error,
      ...props
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) setIsDragging(true)
      },
      [disabled],
    )

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }, [])

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled) return

        const files = Array.from(e.dataTransfer.files).filter((file): file is File => file instanceof File)
        if (files.length > 0 && files[0]) {
          onDropFiles(multiple ? files : [files[0]])
        }
      },
      [disabled, multiple, onDropFiles],
    )

    const handleFileInput = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          const files = Array.from(e.target.files).filter((file): file is File => file instanceof File)
          if (files.length > 0 && files[0]) {
            onDropFiles(multiple ? files : [files[0]])
          }
        }
      },
      [multiple, onDropFiles],
    )

    const handlePaste = useCallback(
      (e: ClipboardEvent) => {
        if (disabled) return
        
        // Ignore paste if user is typing in an input field
        const target = e.target as HTMLElement
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target.getAttribute('type') !== 'file') {
          return
        }

        if (e.clipboardData && e.clipboardData.files.length > 0) {
          e.preventDefault()
          const files = Array.from(e.clipboardData.files).filter((file): file is File => file instanceof File)
          if (files.length > 0 && files[0]) {
            onDropFiles(multiple ? files : [files[0]])
          }
        }
      },
      [disabled, multiple, onDropFiles],
    )

    useEffect(() => {
      document.addEventListener('paste', handlePaste)
      return () => {
        document.removeEventListener('paste', handlePaste)
      }
    }, [handlePaste])

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div
          ref={ref}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-10',
            disabled && 'cursor-not-allowed opacity-50',
            !disabled && isDragging && 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]',
            !disabled && !isDragging && !error && 'border-[var(--border-secondary)] bg-[var(--surface-primary)] hover:border-[var(--color-primary-400)] hover:bg-[var(--surface-hover)]',
            error && 'border-[var(--color-danger-500)] bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-900)]'
          )}
          {...props}
        >
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleFileInput}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            aria-label="Upload files"
          />
          <div className={cn(
            "mb-4 rounded-full p-3 transition-colors sm:p-4",
            isDragging ? "bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-800)] text-[var(--color-primary-600)]" : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] group-hover:text-[var(--color-primary-600)]"
          )}>
            <UploadCloud className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
        {error && (
          <p className="text-sm font-medium text-[var(--color-danger-600)] dark:text-[var(--color-danger-500)]">
            {error}
          </p>
        )}
      </div>
    )
  },
)

UploadZone.displayName = 'UploadZone'
