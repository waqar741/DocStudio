import { ArrowLeftRight } from 'lucide-react'

export function ConverterPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-50)]">
          <ArrowLeftRight size={32} className="text-[var(--color-primary-600)]" aria-hidden="true" />
        </div>
        <h2
          className="text-xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Format Converter
        </h2>
        <p
          className="mt-2 max-w-md text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Convert between image and document formats. This module will be available in a future update.
        </p>
      </div>
    </div>
  )
}
