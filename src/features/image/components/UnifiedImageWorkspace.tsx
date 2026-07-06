import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { UploadZone, Button, Select, TextInput } from '@/components/ui'
import { Download, Loader2, ArrowRight } from 'lucide-react'
import { CropWorkspace } from './editor/CropWorkspace'
import type { Area, OutputSettings, NamingSettings, ProcessingStats } from './ImageProcessor'

const DOCUMENT_TYPE_OPTIONS = [
  { label: 'No document type', value: '' },
  { label: 'Aadhar', value: 'Aadhar' },
  { label: 'PAN', value: 'PAN' },
  { label: 'Ration Card', value: 'Ration Card' },
  { label: 'Light Bill', value: 'Light Bill' },
  { label: 'Rent Agreement', value: 'Rent Agreement' },
  { label: 'Deed', value: 'Deed' },
  { label: 'Self Declaration', value: 'Self Declaration' },
  { label: 'Passport', value: 'Passport' },
]

export interface UnifiedImageWorkspaceProps {
  file: File | null
  step: 1 | 2
  isProcessing: boolean
  isLiveUpdating: boolean
  processedBlob: Blob | null
  generatedFilename: string
  processingStats: ProcessingStats | null
  
  outputSettings: OutputSettings
  setOutputSettings: Dispatch<SetStateAction<OutputSettings>>
  namingSettings: NamingSettings
  setNamingSettings: Dispatch<SetStateAction<NamingSettings>>
  setPixelCrop: (crop: Area) => void

  onFileUpload: (file: File) => void
  onDownload: () => void
  onBack: () => void
}

export function UnifiedImageWorkspace({
  file,
  step,
  isLiveUpdating,
  processedBlob,
  generatedFilename,
  processingStats,
  outputSettings,
  setOutputSettings,
  namingSettings,
  setNamingSettings,
  setPixelCrop,
  onFileUpload,
  onDownload,
  onBack
}: UnifiedImageWorkspaceProps) {
  
  const formatSize = (bytes: number) => (bytes / 1024).toFixed(1) + ' KB'
  const processedBlobUrl = useMemo(() => processedBlob ? URL.createObjectURL(processedBlob) : null, [processedBlob])

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-[var(--surface-bg)]">
      
      {/* Universal Step Indicator Header */}
      <div className="shrink-0 border-b border-[var(--border-secondary)] bg-[var(--surface-primary)]/90 px-4 py-3 backdrop-blur-md lg:grid lg:grid-cols-3 lg:items-center lg:px-6 lg:py-2.5">
        
        {/* Left: Back Button */}
        <div className="flex justify-start lg:justify-start">
          {step > 1 && (
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              <ArrowRight size={16} className="rotate-180" /> Back
            </button>
          )}
        </div>

        {/* Center: Stepper */}
        <div className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold lg:mt-0">
          <span className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 1 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}>1. Upload</span>
          <ArrowRight size={14} className="text-gray-400 shrink-0" />
          <span className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 2 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}>2. Edit</span>
        </div>

        {/* Right: Empty for balance */}
        <div className="hidden lg:block"></div>
      </div>

      <div className={`mx-auto flex w-full flex-1 min-h-0 flex-col ${step === 2 ? 'max-w-[1920px] p-3 sm:p-4 md:p-6' : 'max-w-5xl overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar'}`}>
        
        {/* Step 1: Upload Image */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">Upload Image</h1>
                <p className="text-[var(--text-secondary)]">Select an image to process</p>
              </div>
            </div>
            
            <div className="w-full rounded-2xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-8">
              <UploadZone
                onDropFiles={(files) => { if (files[0]) onFileUpload(files[0]) }}
                accept="image/jpeg,image/png,image/webp,image/bmp"
                title="Select Image file"
                description="Drag & drop, browse, or paste from clipboard"
              />
            </div>
          </div>
        )}

        {/* Step 2: Configure & Crop (3 Pane Layout) */}
        {step === 2 && file && (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4 animate-in fade-in duration-500 lg:hidden custom-scrollbar">
              <div className="relative overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Naming</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--text-primary)]">Custom Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Andy"
                      value={namingSettings.filename}
                      onChange={(e) => setNamingSettings(s => ({ ...s, filename: e.target.value }))}
                      className="h-11 w-full rounded-md border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                    />
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">Leave blank to keep the uploaded file name.</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--text-primary)]">Document Type</label>
                    <select
                      value={namingSettings.documentType}
                      onChange={(e) => setNamingSettings(s => ({ ...s, documentType: e.target.value }))}
                      className="h-11 w-full rounded-md border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
                    >
                      {DOCUMENT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Output Format</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['jpg', 'png', 'webp'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setOutputSettings(s => ({ ...s, format: fmt as 'jpg' | 'png' | 'webp' }))}
                      className={`h-11 rounded-lg border text-xs font-bold uppercase transition-all ${
                        outputSettings.format === fmt
                        ? 'bg-[var(--color-primary-500)] text-white border-[var(--color-primary-500)] shadow-sm'
                        : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-secondary)]'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Resolution</h3>
                <select
                  value={outputSettings.resolution}
                  onChange={(e) => setOutputSettings(s => ({ ...s, resolution: e.target.value }))}
                  className="h-11 w-full rounded-md border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
                >
                  <option value="original">Original</option>
                  <option value="160x200">160 × 200</option>
                  <option value="256x64">256 × 64 (Signature)</option>
                  <option value="276x354">276 × 354 (Passport Photo)</option>
                  <option value="300x300">300 × 300</option>
                  <option value="300x400">300 × 400</option>
                  <option value="600x600">600 × 600</option>
                  <option value="1200x1200">1200 × 1200</option>
                  <option value="custom">Custom Size</option>
                </select>
                {outputSettings.resolution === 'custom' && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Width"
                      value={outputSettings.customWidth || ''}
                      onChange={(e) => setOutputSettings(s => ({ ...s, customWidth: parseInt(e.target.value) }))}
                      className="h-11 w-full rounded-md border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                    />
                    <input
                      type="number"
                      placeholder="Height"
                      value={outputSettings.customHeight || ''}
                      onChange={(e) => setOutputSettings(s => ({ ...s, customHeight: parseInt(e.target.value) }))}
                      className="h-11 w-full rounded-md border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                    />
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Target File Size</h3>
                <select
                  value={outputSettings.targetKB}
                  onChange={(e) => setOutputSettings(s => ({ ...s, targetKB: e.target.value }))}
                  className="h-11 w-full rounded-md border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
                >
                  <option value="none">No Limit</option>
                  <option value="19">Under 19 KB</option>
                  <option value="20">Under 20 KB</option>
                  <option value="50">Under 50 KB</option>
                  <option value="100">Under 100 KB</option>
                  <option value="200">Under 200 KB</option>
                  <option value="custom">Custom Size</option>
                </select>
                {outputSettings.targetKB === 'custom' && (
                  <input
                    type="number"
                    placeholder="e.g. 150 KB"
                    value={outputSettings.customKB || ''}
                    onChange={(e) => setOutputSettings(s => ({ ...s, customKB: parseInt(e.target.value) }))}
                    className="mt-3 h-11 w-full rounded-md border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                  />
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] shadow-sm">
                <CropWorkspace file={file} setPixelCrop={setPixelCrop} />
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Live Preview</h3>
                {isLiveUpdating && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--surface-primary)]/60 backdrop-blur-[1px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary-500)]" />
                  </div>
                )}
                <div className="mb-4 flex min-h-[200px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--border-secondary)] bg-[var(--surface-secondary)] p-2">
                  {processedBlobUrl ? (
                    <img src={processedBlobUrl} alt="Live Preview" className="max-h-full max-w-full object-contain drop-shadow-md" />
                  ) : (
                    <span className="text-xs text-[var(--text-tertiary)]">Generating...</span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-lg border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] p-2.5 dark:border-[var(--color-primary-800)] dark:bg-[var(--color-primary-900)]/30">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Filename</p>
                    <p className="break-all font-mono leading-tight text-[var(--text-primary)]">{generatedFilename || '...'}</p>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--border-secondary)] py-1.5">
                    <span className="text-[var(--text-secondary)]">Original</span>
                    <span className="font-bold text-[var(--text-primary)]">{processingStats ? formatSize(processingStats.originalSize) : '...'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--border-secondary)] py-1.5">
                    <span className="text-[var(--text-secondary)]">Estimated</span>
                    <span className="font-bold text-[var(--color-primary-600)]">{processingStats ? formatSize(processingStats.finalSize) : '...'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--border-secondary)] py-1.5">
                    <span className="text-[var(--text-secondary)]">Compression</span>
                    <span className="font-bold text-[var(--color-success-600)]">
                      {processingStats ? `${Math.max(0, Math.round((1 - processingStats.finalSize / processingStats.originalSize) * 100))}%` : '...'}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={onDownload}
                  disabled={!processingStats}
                  className="mt-4 w-full bg-green-600 text-white shadow-sm hover:bg-green-700"
                >
                  <Download size={16} className="mr-2" /> Download Result
                </Button>
              </div>
            </div>

            <div className="hidden min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[260px_1fr_240px] lg:gap-6 xl:grid-cols-[300px_1fr_260px]">
            
            {/* Left Panel: Settings */}
            <div className="order-1 flex flex-col gap-3 overflow-y-auto pb-2 lg:order-none lg:pr-2 lg:pb-6 custom-scrollbar">
              <div className="overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Naming</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <TextInput
                    label="Custom Name (Optional)"
                    placeholder="e.g. Andy"
                    value={namingSettings.filename}
                    onChange={(e) => setNamingSettings(s => ({ ...s, filename: e.target.value }))}
                    description="Leave blank to keep the uploaded file name."
                  />
                  <Select
                    label="Document Type"
                    value={namingSettings.documentType}
                    onChange={(e) => setNamingSettings(s => ({ ...s, documentType: e.target.value }))}
                    options={DOCUMENT_TYPE_OPTIONS}
                    description="Used in the exported filename."
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Output Format</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['jpg', 'png', 'webp'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setOutputSettings(s => ({ ...s, format: fmt as 'jpg' | 'png' | 'webp' }))}
                      className={`py-1.5 rounded-lg border text-xs font-bold uppercase transition-all ${
                        outputSettings.format === fmt 
                        ? 'bg-[var(--color-primary-500)] text-white border-[var(--color-primary-500)] shadow-sm'
                        : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-secondary)] hover:border-gray-400'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Resolution</h3>
                <select 
                  value={outputSettings.resolution}
                  onChange={(e) => setOutputSettings(s => ({ ...s, resolution: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent font-medium text-sm mb-2"
                >
                  <option value="original">Original</option>
                  <option value="160x200">160 × 200</option>
                  <option value="256x64">256 × 64 (Signature)</option>
                  <option value="276x354">276 × 354 (Passport Photo)</option>
                  <option value="300x300">300 × 300</option>
                  <option value="300x400">300 × 400</option>
                  <option value="600x600">600 × 600</option>
                  <option value="1200x1200">1200 × 1200</option>
                  <option value="custom">Custom Size</option>
                </select>
                {outputSettings.resolution === 'custom' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Width"
                      value={outputSettings.customWidth || ''}
                      onChange={(e) => setOutputSettings(s => ({ ...s, customWidth: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Height"
                      value={outputSettings.customHeight || ''}
                      onChange={(e) => setOutputSettings(s => ({ ...s, customHeight: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Target File Size</h3>
                <select 
                  value={outputSettings.targetKB}
                  onChange={(e) => setOutputSettings(s => ({ ...s, targetKB: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent font-medium text-sm"
                >
                  <option value="none">No Limit</option>
                  <option value="19">Under 19 KB</option>
                  <option value="20">Under 20 KB</option>
                  <option value="50">Under 50 KB</option>
                  <option value="100">Under 100 KB</option>
                  <option value="200">Under 200 KB</option>
                  <option value="custom">Custom Size</option>
                </select>
                {outputSettings.targetKB === 'custom' && (
                  <input
                    type="number"
                    placeholder="e.g. 150 KB"
                    value={outputSettings.customKB || ''}
                    onChange={(e) => setOutputSettings(s => ({ ...s, customKB: parseInt(e.target.value) }))}
                    className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-sm"
                  />
                )}
              </div>
            </div>

            {/* Center: Crop Workspace */}
            <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] shadow-sm lg:min-w-[500px]">
              <CropWorkspace 
                file={file}
                setPixelCrop={setPixelCrop}
              />
            </div>

            {/* Right Panel: Live Information */}
            <div className="flex flex-col overflow-y-auto pb-2 lg:pr-2 lg:pb-6 custom-scrollbar">
              <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] p-4 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Live Preview</h3>
                
                {isLiveUpdating && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--surface-primary)]/60 backdrop-blur-[1px]">
                    <Loader2 className="w-8 h-8 text-[var(--color-primary-500)] animate-spin" />
                  </div>
                )}
                
                <div className="mb-4 flex min-h-[160px] flex-1 items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--border-secondary)] bg-[var(--surface-secondary)] p-2">
                  {processedBlobUrl ? (
                    <img src={processedBlobUrl} alt="Live Preview" className="max-w-full max-h-full object-contain drop-shadow-md" />
                  ) : (
                    <span className="text-xs text-[var(--text-tertiary)]">Generating...</span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-lg border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] p-2.5 dark:border-[var(--color-primary-800)] dark:bg-[var(--color-primary-900)]/30">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mb-1 uppercase tracking-wide">Filename</p>
                    <p className="break-all font-mono leading-tight text-[var(--text-primary)]">{generatedFilename || '...'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-[var(--border-secondary)] py-1.5">
                    <span className="text-[var(--text-secondary)]">Original</span>
                    <span className="font-bold text-[var(--text-primary)]">{processingStats ? formatSize(processingStats.originalSize) : '...'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-[var(--border-secondary)] py-1.5">
                    <span className="text-[var(--text-secondary)]">Estimated</span>
                    <span className="font-bold text-[var(--color-primary-600)]">{processingStats ? formatSize(processingStats.finalSize) : '...'}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[var(--border-secondary)] py-1.5">
                    <span className="text-[var(--text-secondary)]">Compression</span>
                    <span className="font-bold text-[var(--color-success-600)]">
                      {processingStats ? `${Math.max(0, Math.round((1 - processingStats.finalSize / processingStats.originalSize) * 100))}%` : '...'}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  size="md"
                  onClick={onDownload}
                  disabled={!processingStats}
                  className="w-full mt-4 shadow-sm bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download size={16} className="mr-2" /> Download Result
                </Button>
              </div>
            </div>

          </div>
          </>
        )}
      </div>
    </div>
  )
}
