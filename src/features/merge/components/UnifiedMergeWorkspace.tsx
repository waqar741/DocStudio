import { useState, useMemo, type Dispatch, type SetStateAction } from 'react'
import { UploadZone, Button } from '@/components/ui'
import { FileThumbnail } from '@/components/ui'
import {
  Download,
  Loader2,
  ArrowRight,
  FileImage,
  PlusCircle,
  FileText,
  Trash2,
  GripVertical,
} from 'lucide-react'
import type { MergeSettings } from './MergeProcessor'

export interface UnifiedMergeWorkspaceProps {
  files: File[]
  step: 1 | 2 | 3
  isProcessing: boolean
  processedBlob: Blob | null
  generatedFilename: string

  settings: MergeSettings
  setSettings: Dispatch<SetStateAction<MergeSettings>>
  filename: string
  onFilenameChange: (name: string) => void

  onFilesAdded: (newFiles: File[]) => void
  onFilesReordered: (startIndex: number, endIndex: number) => void
  onFileRemoved: (index: number) => void
  onProceedToReview: () => void
  onProcess: () => void
  onDownload: () => void
  onStartNew: () => void
  onBack: () => void
}

export function UnifiedMergeWorkspace({
  files,
  step,
  isProcessing,
  processedBlob,
  generatedFilename,
  settings,
  setSettings,
  filename,
  onFilenameChange,
  onFilesAdded,
  onFilesReordered,
  onFileRemoved,
  onProceedToReview,
  onProcess,
  onDownload,
  onStartNew,
  onBack,
}: UnifiedMergeWorkspaceProps) {
  const totalSize = useMemo(
    () => files.reduce((acc, f) => acc + f.size, 0),
    [files],
  )
  const processedBlobUrl = useMemo(
    () => (processedBlob ? URL.createObjectURL(processedBlob) : null),
    [processedBlob],
  )
  const allImages = useMemo(
    () => files.length > 0 && files.every((f) => f.type.startsWith('image/')),
    [files],
  )

  // Simple HTML5 Drag and Drop Handlers for Reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => setDraggedIndex(index)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
  }
  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      onFilesReordered(draggedIndex, index)
    }
    setDraggedIndex(null)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--surface-secondary)] overflow-hidden relative">
      {/* Universal Step Indicator Header */}
      <div className="shrink-0 bg-[var(--surface-primary)]/80 backdrop-blur-md border-b border-[var(--border-secondary)] px-4 py-3 lg:px-6 lg:py-2.5 flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] items-center">
        {/* Left: Back Button */}
        <div className="flex w-full justify-start lg:w-auto">
          {step > 1 && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)]"
            >
              <ArrowRight size={16} className="rotate-180" /> Back
            </button>
          )}
        </div>

        {/* Center: Stepper */}
        <div className="flex justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold mt-2 lg:mt-0 flex-nowrap whitespace-nowrap w-full px-2">
          <span
            className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 1 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            1. Selection Page
          </span>
          <ArrowRight size={14} className="text-gray-400 shrink-0" />
          <span
            className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 2 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            2. Processing Page
          </span>
          <ArrowRight size={14} className="text-gray-400 shrink-0" />
          <span
            className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 3 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            3. Final Page
          </span>
        </div>

        {/* Right: Empty for balance */}
        <div className="hidden lg:block"></div>
      </div>

      {/* FIX: Main content area - proper height management */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Step 1: Upload Documents */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 max-w-5xl mx-auto w-full">
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 text-center">
                Merge Documents
              </h1>
              <p className="text-center text-[var(--text-secondary)] mb-10">
                Combine multiple Images and PDFs into a single document
              </p>

              <div className="w-full bg-[var(--surface-primary)] rounded-2xl shadow-sm border border-[var(--border-secondary)] p-8">
                <UploadZone
                  onDropFiles={(dropped) => onFilesAdded(dropped)}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  multiple={true}
                  title="Select Files"
                  description="Drag & drop multiple files, or click to browse"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="primary" size="lg" onClick={onProceedToReview}>
                    Continue to Arrange ({files.length} files){' '}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Arrange & Settings - NO OVERFLOW ON SETTINGS PANEL */}
        {step === 2 && (
          <div className="flex-1 flex flex-col min-h-0 p-4 md:p-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:grid lg:grid-cols-[360px_1fr] gap-6 flex-1 min-h-0">
              {/* FIX: Left Panel - No overflow, fixed height with flex layout */}
              <div className="flex flex-col lg:h-full min-h-0">
                <div className="bg-[var(--surface-primary)] rounded-xl shadow-sm border border-[var(--border-secondary)] flex flex-col lg:h-full">
                  {/* FIX: Settings Content - NO overflow-y-auto, uses flex-shrink */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col min-h-0">
                    {/* Naming Section */}
                    <div className="space-y-2 shrink-0">
                      <h3 className="font-bold text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                        Naming
                      </h3>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                          Filename
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Merged_Document.pdf"
                          value={filename}
                          onChange={(e) => onFilenameChange(e.target.value)}
                          className="w-full p-2 border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-primary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary-500)]/50 focus:border-[var(--color-primary-500)] outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Layout Section */}
                    <div className="space-y-2 shrink-0">
                      <h3 className="font-bold text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                        Page Layout
                      </h3>
                      <div className="space-y-2">
                        {allImages && (
                          <div>
                            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                              Output Format
                            </label>
                            <select
                              value={settings.outputFormat}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  outputFormat: e.target.value as 'pdf' | 'image',
                                }))
                              }
                              className="w-full p-2 border border-[var(--border-subtle)] rounded-lg bg-transparent font-medium text-sm text-[var(--text-primary)]"
                            >
                              <option value="pdf">PDF Document</option>
                              <option value="image">Image (Collage)</option>
                            </select>
                          </div>
                        )}

                        {!allImages || settings.outputFormat === 'pdf' ? (
                          <>
                            <div>
                              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                                Page Size
                              </label>
                              <select
                                value={settings.pageSize}
                                onChange={(e) =>
                                  setSettings((s) => ({
                                    ...s,
                                    pageSize: e.target.value,
                                  }))
                                }
                                className="w-full p-2 border border-[var(--border-subtle)] rounded-lg bg-transparent font-medium text-sm text-[var(--text-primary)]"
                              >
                                <option value="A4">A4</option>
                                <option value="Letter">Letter</option>
                                <option value="Legal">Legal</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                                Orientation
                              </label>
                              <select
                                value={settings.orientation}
                                onChange={(e) =>
                                  setSettings((s) => ({
                                    ...s,
                                    orientation: e.target.value,
                                  }))
                                }
                                className="w-full p-2 border border-[var(--border-subtle)] rounded-lg bg-transparent font-medium text-sm text-[var(--text-primary)]"
                              >
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                              </select>
                            </div>
                          </>
                        ) : (
                          <div>
                            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                              Image Layout
                            </label>
                            <select
                              value={settings.imageLayout}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  imageLayout: e.target.value as
                                    'vertical' | 'horizontal',
                                }))
                              }
                              className="w-full p-2 border border-[var(--border-subtle)] rounded-lg bg-transparent font-medium text-sm text-[var(--text-primary)]"
                            >
                              <option value="vertical">Vertical Stack</option>
                              <option value="horizontal">
                                Horizontal Side-by-Side
                              </option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* FIX: Merge Summary - flex-1 to take remaining space but NO scroll */}
                    <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] flex-1 flex flex-col min-h-0">
                      <h3 className="font-bold text-[11px] uppercase tracking-wider text-[var(--text-secondary)] shrink-0">
                        Merge Summary
                      </h3>

                      <div className="space-y-2 flex-1 flex flex-col justify-start">
                        <div className="bg-[var(--surface-secondary)] p-2 rounded-lg border border-[var(--border-subtle)] shrink-0">
                          <p className="text-[10px] text-[var(--color-primary-600)] font-bold mb-0.5 uppercase tracking-wide">
                            Target Filename
                          </p>
                          <p className="font-mono text-xs text-[var(--text-primary)] break-all leading-tight font-semibold">
                            {generatedFilename || '...'}
                          </p>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-[var(--border-subtle)] shrink-0">
                          <span className="text-xs font-medium text-[var(--text-secondary)]">
                            Total Files
                          </span>
                          <span className="font-bold text-[var(--text-primary)] text-xs">
                            {files.length}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1 shrink-0">
                          <span className="text-xs font-medium text-[var(--text-secondary)]">
                            Total Inputs Size
                          </span>
                          <span className="font-bold text-[var(--color-primary-600)] text-xs">
                            {(totalSize / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Processing Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-[var(--surface-primary)]/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-[var(--color-primary-500)] animate-spin mb-3" />
                        <span className="font-bold text-sm text-[var(--color-primary-600)]">
                          Processing...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action - Always visible at bottom */}
                  <div className="p-4 border-t border-[var(--border-secondary)] bg-[var(--surface-secondary)]/50 shrink-0">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={onProcess}
                      disabled={isProcessing || files.length < 2}
                      className="w-full text-sm font-bold bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white shadow-md shadow-[var(--color-primary-500)]/20 h-auto"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Merge Files <ArrowRight size={16} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Center: File List Workspace - THIS scrolls independently */}
              <div className="flex flex-col bg-[var(--surface-primary)] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden min-h-0">
                <div className="p-5 border-b border-[var(--border-secondary)] bg-[var(--surface-secondary)] flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-base text-[var(--text-primary)]">
                    Arrange Files
                  </h3>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    Drag items to reorder
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[var(--surface-secondary)]/30 custom-scrollbar">
                  {files.map((file, index) => {
                    const isPdf = file.type === 'application/pdf'
                    return (
                      <div
                        key={`${file.name}-${index}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e)}
                        onDrop={() => handleDrop(index)}
                        className={`group flex items-center gap-4 p-4 bg-[var(--surface-primary)] border rounded-xl shadow-sm transition-all cursor-move
                        ${draggedIndex === index ? 'opacity-50 scale-[0.98] border-[var(--color-primary-500)]' : 'hover:border-[var(--color-primary-400)] hover:shadow-md border-[var(--border-subtle)]'}`}
                      >
                        <GripVertical
                          size={24}
                          className="text-[var(--text-secondary)] opacity-50 group-hover:opacity-100 transition-opacity"
                        />

                        <FileThumbnail
                          file={file}
                          className="w-12 h-12 rounded-lg border border-[var(--border-subtle)] shrink-0 bg-white"
                          fallbackSize={24}
                        />

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[var(--text-primary)] truncate mb-0.5">
                            {file.name}
                          </p>
                          <p className="text-xs font-medium text-[var(--text-secondary)]">
                            {isPdf ? 'PDF Document' : 'Image'} •{' '}
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        <button
                          onClick={() => onFileRemoved(index)}
                          className="p-2.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove file"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )
                  })}

                  <div className="pt-2">
                    <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--color-primary-400)] rounded-xl bg-[var(--surface-secondary)]/50 hover:bg-[var(--surface-secondary)] cursor-pointer transition-all text-[var(--text-secondary)] hover:text-[var(--color-primary-600)] font-semibold text-sm group">
                      <div className="flex items-center">
                        <PlusCircle size={20} className="mr-2 text-[var(--color-primary-500)] group-hover:scale-110 transition-transform" />
                        Add More Files
                      </div>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(e) => {
                          if (e.target.files?.length)
                            onFilesAdded(Array.from(e.target.files))
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Download */}
        {step === 3 && processedBlob && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
            <div className="flex flex-col animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto w-full my-auto">
              {/* Top Bar with Download */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-secondary)] shadow-sm">
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Document Ready!
                  </h2>
                  <p className="text-[var(--text-secondary)] text-xs font-medium mt-0.5">
                    Your merged file has been processed successfully.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onDownload}
                  className="w-full sm:w-auto h-10 text-sm font-bold bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white shadow-md px-6 shrink-0"
                >
                  <Download size={18} className="mr-2" /> Download File
                </Button>
              </div>

              {/* Content Split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Left: Preview */}
                <div className="bg-[var(--surface-primary)] rounded-xl border border-[var(--border-secondary)] overflow-hidden shadow-sm flex flex-col h-[280px] lg:h-[320px]">
                  <div className="p-3 border-b border-[var(--border-secondary)] bg-[var(--surface-secondary)]">
                    <h3 className="font-bold text-xs text-[var(--text-primary)] flex items-center">
                      <FileImage className="mr-2 text-[var(--text-secondary)]" size={16} /> Preview
                    </h3>
                  </div>
                  <div className="flex-1 p-3 bg-[var(--surface-secondary)]/30 flex items-center justify-center overflow-hidden">
                    {processedBlobUrl ? (
                      <img
                        src={processedBlobUrl}
                        className="max-w-full max-h-full object-contain rounded shadow-sm border border-[var(--border-subtle)]"
                        alt="Final Result"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileText size={48} className="text-[var(--text-secondary)] mb-2 opacity-50" />
                        <span className="text-xs font-bold text-[var(--text-secondary)] text-center tracking-wide">
                          DOCUMENT PREVIEW
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Info */}
                <div className="bg-[var(--surface-primary)] rounded-xl border border-[var(--border-secondary)] shadow-sm flex flex-col">
                  <div className="p-3 border-b border-[var(--border-secondary)] bg-[var(--surface-secondary)]">
                    <h3 className="font-bold text-xs text-[var(--text-primary)] flex items-center">
                      File Information
                    </h3>
                  </div>

                  <div className="p-4 space-y-4 flex-1">
                    <div className="bg-[var(--surface-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-1">
                        Filename
                      </p>
                      <p className="font-mono text-sm break-all font-bold text-[var(--text-primary)]">
                        {generatedFilename}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[var(--surface-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Page Size
                        </span>
                        <span className="font-bold text-[var(--text-primary)] text-sm">
                          {settings.pageSize}
                        </span>
                      </div>
                      <div className="bg-[var(--surface-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Orientation
                        </span>
                        <span className="font-bold text-[var(--text-primary)] text-sm capitalize">
                          {settings.orientation}
                        </span>
                      </div>
                      <div className="bg-[var(--surface-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Files Merged
                        </span>
                        <span className="font-bold text-[var(--text-primary)] text-sm">
                          {files.length}
                        </span>
                      </div>
                      <div className="bg-[var(--surface-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Total Input Size
                        </span>
                        <span className="font-bold text-[var(--text-primary)] text-sm">
                          {(totalSize / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-row justify-end gap-3 mt-auto">
                <Button variant="outline" onClick={onBack} size="sm" className="bg-[var(--surface-primary)] px-5 font-semibold">
                  Edit Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStartNew}
                  className="text-[var(--text-secondary)] hover:bg-[var(--surface-primary)] px-5 font-semibold"
                >
                  <PlusCircle size={16} className="mr-2" /> Start Over
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}