import { useState, useMemo, type Dispatch, type SetStateAction } from 'react'
import { UploadZone, Button } from '@/components/ui'
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
import type { ConvertSettings } from './ConvertProcessor'

export interface UnifiedConvertWorkspaceProps {
  files: File[]
  step: 1 | 2 | 3
  isProcessing: boolean
  processedBlob: Blob | null
  generatedFilename: string

  settings: ConvertSettings
  setSettings: Dispatch<SetStateAction<ConvertSettings>>

  onFilesAdded: (newFiles: File[]) => void
  onFilesReordered: (startIndex: number, endIndex: number) => void
  onFileRemoved: (index: number) => void
  onProceedToReview: () => void
  onProcess: () => void
  onDownload: () => void
  onStartNew: () => void
  onBack: () => void
}

export function UnifiedConvertWorkspace({
  files,
  step,
  isProcessing,
  processedBlob,
  generatedFilename,
  settings,
  setSettings,
  onFilesAdded,
  onFilesReordered,
  onFileRemoved,
  onProceedToReview,
  onProcess,
  onDownload,
  onStartNew,
  onBack,
}: UnifiedConvertWorkspaceProps) {
  const totalSize = useMemo(
    () => files.reduce((acc, f) => acc + f.size, 0),
    [files],
  )
  // Only create object URL if it's an image
  const isImageBlob = processedBlob && processedBlob.type.startsWith('image/')
  const processedBlobUrl = useMemo(
    () => (isImageBlob ? URL.createObjectURL(processedBlob) : null),
    [processedBlob, isImageBlob],
  )

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => setDraggedIndex(index)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      onFilesReordered(draggedIndex, index)
    }
    setDraggedIndex(null)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] dark:bg-[#111] overflow-hidden relative">
      <div className="shrink-0 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[var(--border-secondary)] px-6 py-2.5 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          {step > 1 && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)]"
            >
              <ArrowRight size={16} className="rotate-180" /> Back
            </button>
          )}
        </div>

        <div className="flex justify-center items-center gap-2 text-sm font-semibold">
          <span
            className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 1 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            1. Upload
          </span>
          <ArrowRight size={14} className="text-gray-400 shrink-0" />
          <span
            className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 2 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            2. Settings
          </span>
          <ArrowRight size={14} className="text-gray-400 shrink-0" />
          <span
            className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 3 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            3. Review
          </span>
        </div>
        <div></div>
      </div>

      <div
        className={`mx-auto w-full flex flex-col flex-1 min-h-0 ${step === 2 ? 'p-4 md:p-6 max-w-7xl' : 'p-6 md:p-8 max-w-5xl overflow-y-auto custom-scrollbar'}`}
      >
        {step === 1 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 text-center">
              Format Converter
            </h1>
            <p className="text-center text-[var(--text-secondary)] mb-10">
              Convert images to PDF, or PDF to images
            </p>

            <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[var(--border-secondary)] p-8">
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
                  Continue to Settings ({files.length} files){' '}
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 grid grid-cols-[260px_1fr_260px] xl:grid-cols-[300px_1fr_300px] gap-4 md:gap-6 animate-in fade-in duration-500 min-h-0">
            {/* Left Panel */}
            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-6">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden p-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                  Conversion Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                      Target Format
                    </label>
                    <select
                      value={settings.targetFormat}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          targetFormat: e.target.value as any,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent font-medium text-sm"
                    >
                      <option value="pdf">PDF Document (.pdf)</option>
                      <option value="jpg">JPEG Image (.jpg)</option>
                      <option value="png">PNG Image (.png)</option>
                      <option value="webp">WEBP Image (.webp)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Panel */}
            <div className="flex flex-col bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden min-w-[400px]">
              <div className="p-4 border-b border-[var(--border-secondary)] bg-gray-50 dark:bg-[#151515] flex justify-between items-center">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Files to Convert
                </h3>
                <span className="text-xs text-[var(--text-secondary)]">
                  Drag items to reorder
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50 dark:bg-[#151515]/50">
                {files.map((file, index) => {
                  const isPdf = file.type === 'application/pdf'
                  return (
                    <div
                      key={`${file.name}-${index}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e)}
                      onDrop={() => handleDrop(index)}
                      className={`group flex items-center gap-3 p-3 bg-white dark:bg-[#222] border rounded-lg shadow-sm transition-all cursor-move
                        ${draggedIndex === index ? 'opacity-50 scale-[0.98]' : 'hover:border-blue-400 hover:shadow-md border-gray-200 dark:border-gray-700'}`}
                    >
                      <GripVertical
                        size={20}
                        className="text-gray-400 group-hover:text-gray-600"
                      />
                      <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                        {isPdf ? (
                          <FileText size={20} className="text-red-500" />
                        ) : (
                          <FileImage size={20} className="text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {isPdf ? 'PDF Document' : 'Image'} •{' '}
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => onFileRemoved(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Remove file"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )
                })}

                <div className="mt-4 pt-4 border-t border-dashed">
                  <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors text-blue-600 font-semibold text-sm">
                    <PlusCircle size={18} className="mr-2" /> Add More Files
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

            {/* Right Panel */}
            <div className="flex flex-col overflow-y-auto custom-scrollbar pb-6 pr-2">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] p-4 flex flex-col flex-1 relative overflow-hidden">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                  Conversion Summary
                </h3>

                {isProcessing && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-[var(--color-primary-500)] animate-spin mb-2" />
                      <span className="font-bold text-sm text-[var(--color-primary-600)]">
                        Processing...
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3 text-xs mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mb-1 uppercase tracking-wide">
                      Target Format
                    </p>
                    <p className="font-mono text-gray-800 dark:text-gray-200 break-all leading-tight uppercase">
                      {settings.targetFormat}
                    </p>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[var(--text-secondary)]">
                      Total Files
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                      {files.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[var(--text-secondary)]">
                      Total Inputs Size
                    </span>
                    <span className="font-bold text-[var(--color-primary-600)]">
                      {(totalSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={onProcess}
                    disabled={isProcessing || files.length === 0}
                    className="w-full shadow-sm"
                  >
                    Convert Files <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && processedBlob && (
          <div className="flex flex-col items-center justify-center pt-8 animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">
              Review Final Document
            </h2>

            <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden">
              <div className="p-6 border-b border-[var(--border-secondary)] bg-gray-50/50 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-48 h-48 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white flex items-center justify-center p-2 shadow-sm shrink-0">
                  {processedBlobUrl && (
                    <img
                      src={processedBlobUrl}
                      className="max-w-full max-h-full object-contain"
                      alt="Final Result"
                    />
                  )}
                  {!processedBlobUrl && (
                    <div className="flex flex-col items-center">
                      <FileText size={48} className="text-green-600 mb-2" />
                      <span className="text-xs font-bold text-gray-500 text-center uppercase">
                        {settings.targetFormat === 'pdf'
                          ? 'PDF DOCUMENT'
                          : processedBlob.type === 'application/zip'
                            ? 'ZIP ARCHIVE'
                            : 'DOCUMENT'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded border border-blue-100 dark:border-blue-800/30">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-0.5">
                      Filename
                    </p>
                    <p className="font-mono text-sm break-all">
                      {generatedFilename}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
                    <div className="flex flex-col">
                      <span className="text-[var(--text-secondary)] text-xs">
                        Target Format
                      </span>
                      <span className="font-semibold text-[var(--text-primary)] uppercase">
                        {settings.targetFormat}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[var(--text-secondary)] text-xs">
                        Files Converted
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {files.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 flex flex-col items-center gap-4 bg-gray-50 dark:bg-[#1a1a1a]">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onDownload}
                  className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-xl"
                >
                  <Download size={28} className="mr-3" /> Download Result
                </Button>
                <div className="flex gap-4 mt-2 w-full">
                  <Button variant="outline" onClick={onBack} className="flex-1">
                    Edit Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onStartNew}
                    className="text-[var(--text-secondary)] flex-1"
                  >
                    <PlusCircle size={18} className="mr-2" /> Start Over
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
