import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { UploadZone, Button } from '@/components/ui'
import { Download, Loader2, ArrowRight, FileImage, PlusCircle, CreditCard, User, FileText, Camera } from 'lucide-react'
import { CropWorkspace } from './editor/CropWorkspace'
import type { Area, OutputSettings, NamingSettings, ProcessingStats } from './ImageProcessor'

const DOCUMENT_CARDS = [
  { id: 'Aadhaar Card', icon: <CreditCard className="w-8 h-8 mb-3 text-blue-500" /> },
  { id: 'PAN Card', icon: <CreditCard className="w-8 h-8 mb-3 text-orange-500" /> },
  { id: 'Passport', icon: <User className="w-8 h-8 mb-3 text-indigo-500" /> },
  { id: 'Driving Licence', icon: <CreditCard className="w-8 h-8 mb-3 text-red-500" /> },
  { id: 'Voter ID', icon: <User className="w-8 h-8 mb-3 text-green-500" /> },
  { id: 'Marksheet', icon: <FileText className="w-8 h-8 mb-3 text-yellow-500" /> },
  { id: 'Passport Photo', icon: <Camera className="w-8 h-8 mb-3 text-purple-500" /> },
  { id: 'Other', icon: <FileImage className="w-8 h-8 mb-3 text-gray-500" /> }
]

export interface UnifiedImageWorkspaceProps {
  file: File | null
  step: 1 | 2 | 3 | 4
  isProcessing: boolean
  isLiveUpdating: boolean
  processedBlob: Blob | null
  generatedFilename: string
  processingStats: ProcessingStats | null
  
  selectedType: string | null
  outputSettings: OutputSettings
  setOutputSettings: Dispatch<SetStateAction<OutputSettings>>
  namingSettings: NamingSettings
  setNamingSettings: Dispatch<SetStateAction<NamingSettings>>
  setPixelCrop: (crop: Area) => void

  onTypeSelect: (type: string) => void
  onFileUpload: (file: File) => void
  onFileReplace: () => void
  onProceedToReview: () => void
  onDownload: () => void
  onStartNew: () => void
  onBack: () => void
}

export function UnifiedImageWorkspace({
  file,
  step,
  isLiveUpdating,
  processedBlob,
  generatedFilename,
  processingStats,
  selectedType,
  outputSettings,
  setOutputSettings,
  namingSettings,
  setNamingSettings,
  setPixelCrop,
  onTypeSelect,
  onFileUpload,
  onFileReplace,
  onProceedToReview,
  onDownload,
  onStartNew,
  onBack
}: UnifiedImageWorkspaceProps) {
  
  const formatSize = (bytes: number) => (bytes / 1024).toFixed(1) + ' KB'
  const processedBlobUrl = useMemo(() => processedBlob ? URL.createObjectURL(processedBlob) : null, [processedBlob])

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] dark:bg-[#111] overflow-hidden relative">
      
      {/* Universal Step Indicator Header */}
      <div className="shrink-0 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[var(--border-secondary)] px-6 py-2.5 grid grid-cols-3 items-center">
        
        {/* Left: Back Button */}
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

        {/* Center: Stepper */}
        <div className="flex justify-center items-center gap-2 text-sm font-semibold">
          <span className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 1 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}>1. Document</span>
          <ArrowRight size={14} className="text-gray-400 shrink-0" />
          <span className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 2 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}>2. Upload</span>
          <ArrowRight size={14} className="text-gray-400 shrink-0" />
          <span className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 3 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}>3. Edit</span>
          <ArrowRight size={14} className="text-gray-400 shrink-0" />
          <span className={`px-3 py-1 rounded-full whitespace-nowrap ${step >= 4 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-gray-200 text-gray-500'}`}>4. Review</span>
        </div>

        {/* Right: Empty for balance */}
        <div></div>
      </div>

      <div className={`mx-auto w-full flex flex-col flex-1 min-h-0 ${step === 3 ? 'p-4 md:p-6 max-w-[1920px]' : 'p-6 md:p-8 max-w-5xl overflow-y-auto custom-scrollbar'}`}>
        
        {/* Step 1: Document Type */}
        {step === 1 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 text-center">What are you preparing?</h1>
            <p className="text-center text-[var(--text-secondary)] mb-10">Select a document type to begin</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {DOCUMENT_CARDS.map(card => (
                <button
                  key={card.id}
                  onClick={() => onTypeSelect(card.id)}
                  className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm hover:shadow-md border border-[var(--border-secondary)] hover:border-[var(--color-primary-500)] p-8 flex flex-col items-center justify-center transition-all cursor-pointer group"
                >
                  <div className="transform group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <span className="font-bold text-[var(--text-primary)]">{card.id}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Upload Image */}
        {step === 2 && selectedType && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Upload Image</h1>
                <p className="text-[var(--text-secondary)]">Preparing: <span className="font-bold text-[var(--color-primary-600)]">{selectedType}</span></p>
              </div>
              <Button variant="ghost" onClick={onStartNew}>Change Document Type</Button>
            </div>
            
            <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[var(--border-secondary)] p-8">
              <UploadZone
                onDropFiles={(files) => { if (files[0]) onFileUpload(files[0]) }}
                accept="image/jpeg,image/png,image/webp,image/bmp"
                title="Select Image file"
                description="Drag & drop, browse, or paste from clipboard"
              />
            </div>
          </div>
        )}

        {/* Step 3: Configure & Crop (3 Pane Layout) */}
        {step === 3 && file && (
          <div className="flex-1 grid grid-cols-[260px_1fr_240px] xl:grid-cols-[300px_1fr_260px] gap-4 md:gap-6 animate-in fade-in duration-500 min-h-0">
            
            {/* Left Panel: Settings */}
            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-6">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden p-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Naming</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Relationship</label>
                    <select 
                      value={namingSettings.relationship}
                      onChange={(e) => setNamingSettings(s => ({ ...s, relationship: e.target.value }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent font-medium text-sm"
                    >
                      {['Self', 'Mother', 'Father', 'Brother', 'Sister', 'Wife', 'Son', 'Daughter', 'Other'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Optional Suffix</label>
                    <input 
                      type="text"
                      placeholder="e.g. front, back, scan"
                      value={namingSettings.suffix}
                      onChange={(e) => setNamingSettings(s => ({ ...s, suffix: e.target.value }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden p-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Output Format</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['jpg', 'png', 'webp'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setOutputSettings(s => ({ ...s, format: fmt as any }))}
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

              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden p-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Resolution</h3>
                <select 
                  value={outputSettings.resolution}
                  onChange={(e) => setOutputSettings(s => ({ ...s, resolution: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent font-medium text-sm mb-2"
                >
                  <option value="original">Original</option>
                  <option value="160x200">160 × 200</option>
                  <option value="300x300">300 × 300</option>
                  <option value="600x600">600 × 600</option>
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

              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden p-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Target File Size</h3>
                <select 
                  value={outputSettings.targetKB}
                  onChange={(e) => setOutputSettings(s => ({ ...s, targetKB: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent font-medium text-sm"
                >
                  <option value="none">No Limit</option>
                  <option value="19">Under 19 KB</option>
                  <option value="50">Under 50 KB</option>
                  <option value="100">Under 100 KB</option>
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
            <div className="flex flex-col bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden min-w-[500px]">
              <CropWorkspace 
                file={file}
                outputSettings={outputSettings}
                setPixelCrop={setPixelCrop}
              />
            </div>

            {/* Right Panel: Live Information */}
            <div className="flex flex-col overflow-y-auto custom-scrollbar pb-6 pr-2">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] p-4 flex flex-col flex-1 relative overflow-hidden">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Live Preview</h3>
                
                {isLiveUpdating && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-[var(--color-primary-500)] animate-spin" />
                  </div>
                )}
                
                <div className="flex-1 min-h-[160px] border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#151515] flex items-center justify-center overflow-hidden mb-4 p-2">
                  {processedBlobUrl ? (
                    <img src={processedBlobUrl} alt="Live Preview" className="max-w-full max-h-full object-contain drop-shadow-md" />
                  ) : (
                    <span className="text-gray-400 text-xs">Generating...</span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mb-1 uppercase tracking-wide">Filename</p>
                    <p className="font-mono text-gray-800 dark:text-gray-200 break-all leading-tight">{generatedFilename || '...'}</p>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[var(--text-secondary)]">Original</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{processingStats ? formatSize(processingStats.originalSize) : '...'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[var(--text-secondary)]">Estimated</span>
                    <span className="font-bold text-[var(--color-primary-600)]">{processingStats ? formatSize(processingStats.finalSize) : '...'}</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[var(--text-secondary)]">Compression</span>
                    <span className="font-bold text-green-600">
                      {processingStats ? `${Math.max(0, Math.round((1 - processingStats.finalSize / processingStats.originalSize) * 100))}%` : '...'}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  size="md"
                  onClick={onProceedToReview}
                  disabled={!processingStats}
                  className="w-full mt-4 shadow-sm"
                >
                  Finish & Review <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>

          </div>
        )}

        {/* Step 4: Review & Download */}
        {step === 4 && file && (
          <div className="flex flex-col items-center justify-center pt-8 animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">Review Final Document</h2>
            
            <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden">
              <div className="p-6 border-b border-[var(--border-secondary)] bg-gray-50/50 flex flex-col md:flex-row gap-6 items-center">
                
                <div className="w-48 h-48 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white flex items-center justify-center p-2 shadow-sm shrink-0">
                  {processedBlobUrl && <img src={processedBlobUrl} className="max-w-full max-h-full object-contain" alt="Final Result" />}
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded border border-blue-100 dark:border-blue-800/30">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-0.5">Filename</p>
                    <p className="font-mono text-sm break-all">{generatedFilename}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
                    <div className="flex flex-col">
                      <span className="text-[var(--text-secondary)] text-xs">Document Type</span>
                      <span className="font-semibold text-[var(--text-primary)]">{selectedType}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[var(--text-secondary)] text-xs">Relationship</span>
                      <span className="font-semibold text-[var(--text-primary)]">{namingSettings.relationship}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[var(--text-secondary)] text-xs">Format</span>
                      <span className="font-semibold text-[var(--text-primary)] uppercase">{outputSettings.format}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[var(--text-secondary)] text-xs">Target Size</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {outputSettings.targetKB === 'none' ? 'No Limit' : `${outputSettings.targetKB} KB`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {processingStats && (
                <div className="p-6 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 border-b border-[var(--border-secondary)]">
                  <h4 className="text-sm font-bold text-[var(--color-primary-700)] uppercase tracking-wider mb-4">Final Compression Results</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">Original Size</p>
                      <p className="font-bold text-lg">{formatSize(processingStats.originalSize)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">Actual Final Size</p>
                      <p className="font-bold text-lg text-[var(--color-primary-600)]">{formatSize(processingStats.finalSize)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">Total Saved</p>
                      <p className="font-bold text-lg text-green-600">
                        {formatSize(processingStats.originalSize - processingStats.finalSize)} 
                        <span className="text-sm ml-1">({Math.max(0, Math.round((1 - processingStats.finalSize / processingStats.originalSize) * 100))}%)</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                  <Button variant="outline" onClick={onFileReplace} className="flex-1">
                    Process Another Image
                  </Button>
                  <Button variant="ghost" onClick={onStartNew} className="text-[var(--text-secondary)] flex-1">
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
