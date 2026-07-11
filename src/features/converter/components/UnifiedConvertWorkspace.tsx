import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { UploadZone, Button } from '@/components/ui'
import { FileThumbnail } from '@/components/ui'
import {
  Download,
  Loader2,
  ArrowRight,
  PlusCircle,
  FileText,
  FileImage,
  Trash2,
} from 'lucide-react'
import type { ConvertSettings, ConvertNamingSettings } from './ConvertProcessor'

export interface UnifiedConvertWorkspaceProps {
  files: File[]
  step: 1 | 2 | 3
  isProcessing: boolean
  processedBlob: Blob | null
  generatedFilename: string

  settings: ConvertSettings
  setSettings: Dispatch<SetStateAction<ConvertSettings>>

  namingSettings: ConvertNamingSettings
  setNamingSettings: Dispatch<SetStateAction<ConvertNamingSettings>>

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
  namingSettings,
  setNamingSettings,
  onFilesAdded,
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--surface-secondary)] overflow-hidden relative">
      <div className="shrink-0 bg-[var(--surface-primary)]/80 backdrop-blur-md border-b border-[var(--border-secondary)] px-4 py-3 lg:px-6 lg:py-2.5 flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] items-center">
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

        <div className="flex justify-center items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-semibold mt-2 lg:mt-0 flex-nowrap whitespace-nowrap w-full px-2">
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
        <div className="hidden lg:block"></div>
      </div>

      {/* FIX: Main content area - proper height management */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {step === 1 && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 max-w-5xl mx-auto w-full">
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 text-center">
                Format Converter
              </h1>
              <p className="text-center text-[var(--text-secondary)] mb-10">
                Convert images to PDF, or PDF to images
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
                    Continue to Settings ({files.length} files){' '}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Settings - NO OVERFLOW ON SETTINGS PANEL */}
        {step === 2 && (
          <div className="flex-1 flex flex-col min-h-0 p-4 md:p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-4 md:gap-6 flex-1 min-h-0">
              {/* FIX: Left Panel - No overflow, fixed height with flex layout */}
              <div className="flex flex-col lg:h-full min-h-0 gap-3">
                <div className="bg-[var(--surface-primary)] rounded-xl shadow-sm border border-[var(--border-secondary)] p-4 shrink-0">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Conversion Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                        Custom Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. My Document"
                        value={namingSettings.filename}
                        onChange={(e) =>
                          setNamingSettings((s) => ({
                            ...s,
                            filename: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-[var(--border-subtle)] rounded-lg bg-transparent font-medium text-sm placeholder:text-[var(--text-tertiary)]"
                      />
                      <p className="mt-1 text-[10px] text-[var(--text-secondary)]">
                        Leave blank to use original name
                      </p>
                    </div>

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
                        className="w-full p-2 border border-[var(--border-subtle)] rounded-lg bg-transparent font-medium text-sm"
                      >
                        <option value="pdf">PDF Document (.pdf)</option>
                        <option value="jpg">JPEG Image (.jpg)</option>
                        <option value="png">PNG Image (.png)</option>
                        <option value="webp">WEBP Image (.webp)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Conversion Summary moved to Left Panel */}
                <div className="bg-[var(--surface-primary)] rounded-xl shadow-sm border border-[var(--border-secondary)] p-4 flex flex-col flex-1 relative overflow-hidden">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3 shrink-0">
                    Conversion Summary
                  </h3>

                  {isProcessing && (
                    <div className="absolute inset-0 bg-[var(--surface-primary)]/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-[var(--color-primary-500)] animate-spin mb-2" />
                        <span className="font-bold text-sm text-[var(--color-primary-600)]">
                          Processing...
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-xs mb-4 flex-1 flex flex-col min-h-0 justify-start">
                    <div className="bg-[var(--surface-secondary)] p-2.5 rounded-lg border border-[var(--border-subtle)] shrink-0">
                      <p className="text-[10px] text-[var(--color-primary-600)] font-bold mb-1 uppercase tracking-wide">
                        Target Format
                      </p>
                      <p className="font-mono text-[var(--text-primary)] break-all leading-tight uppercase">
                        {settings.targetFormat}
                      </p>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)] shrink-0">
                      <span className="text-[var(--text-secondary)]">
                        Total Files
                      </span>
                      <span className="font-bold text-[var(--text-primary)] text-sm">
                        {files.length}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)] shrink-0">
                      <span className="text-[var(--text-secondary)]">
                        Total Inputs Size
                      </span>
                      <span className="font-bold text-[var(--color-primary-600)]">
                        {(totalSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 shrink-0">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={onProcess}
                      disabled={isProcessing || files.length === 0}
                      className="w-full bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white shadow-md shadow-[var(--color-primary-500)]/20"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Convert Files <ArrowRight size={16} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Center Panel */}
              <div className="flex flex-col bg-[var(--surface-primary)] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden min-h-[400px] lg:min-h-0 flex-1">
                <div className="p-4 border-b border-[var(--border-secondary)] bg-[var(--surface-secondary)] flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">
                    Files to Convert
                  </h3>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {files.length} files
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--surface-secondary)]/30 custom-scrollbar">
                  {files.map((file, index) => {
                    const isPdf = file.type === 'application/pdf'
                    return (
                      <div
                        key={`${file.name}-${index}`}
                        className="bg-[var(--surface-primary)] rounded-lg p-3 flex items-center shadow-sm border border-[var(--border-secondary)] transition-all hover:border-[var(--color-primary-300)] group"
                      >
                        <FileThumbnail 
                          file={file} 
                          className="w-10 h-10 rounded border border-[var(--border-subtle)] shrink-0 bg-white"
                          fallbackSize={20}
                        />
                        <div className="flex-1 min-w-0 ml-3">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center text-xs text-[var(--text-secondary)] mt-0.5 space-x-3">
                            <span className="flex items-center">
                              {isPdf ? (
                                <FileText size={12} className="mr-1" />
                              ) : (
                                <FileImage size={12} className="mr-1" />
                              )}
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onFileRemoved(index)}
                          className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  })}

                  <div className="pt-2">
                    <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--color-primary-400)] rounded-xl bg-[var(--surface-secondary)]/50 hover:bg-[var(--surface-secondary)] cursor-pointer transition-all text-[var(--text-secondary)] hover:text-[var(--color-primary-600)] font-semibold text-sm group">
                      <div className="flex items-center">
                        <PlusCircle size={18} className="mr-2" /> Add More Files
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
                    Your converted file has been processed successfully.
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
                          Target Format
                        </span>
                        <span className="font-bold text-[var(--text-primary)] text-sm uppercase">
                          {settings.targetFormat}
                        </span>
                      </div>
                      <div className="bg-[var(--surface-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Files Converted
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
                      <div className="bg-[var(--surface-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Output Size
                        </span>
                        <span className="font-bold text-[var(--color-primary-600)] text-sm">
                          {(processedBlob.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-row justify-end gap-3 mt-auto">
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
