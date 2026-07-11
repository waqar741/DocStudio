import { useState, useMemo, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { UploadZone, Button } from '@/components/ui'
import {
  CheckCircle2,
  Download,
  Loader2,
  ArrowRight,
  RotateCw,
  File as FileIcon,
  X,
  PlusCircle,
  Settings2,
} from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'

export type PdfTool =
  | 'compress'
  | 'split'
  | 'rotate'
  | 'rearrange'
  | 'delete'
  | 'extract'
  | 'insert_blank'
  | null

export const PDF_TOOLS = [
  { id: 'compress', label: 'Compress PDF' },
  { id: 'split', label: 'Split PDF' },
  { id: 'rotate', label: 'Rotate Pages' },
  { id: 'rearrange', label: 'Rearrange Pages' },
  { id: 'delete', label: 'Delete Pages' },
  { id: 'extract', label: 'Extract Pages' },
  { id: 'insert_blank', label: 'Insert Blank' },
] as const

// --- Utility Functions ---
export function parsePageRanges(rangesStr: string, maxPages: number): Set<number> {
  const pages = new Set<number>()
  if (!rangesStr.trim()) return pages
  const parts = rangesStr.split(',')
  parts.forEach((part) => {
    const r = part.trim()
    if (!r) return
    if (r.includes('-')) {
      const [start, end] = r.split('-')
      const s = Math.max(0, parseInt(start || '') - 1)
      const e = Math.min(maxPages - 1, parseInt(end || '') - 1)
      if (!isNaN(s) && !isNaN(e)) {
        for (let i = s; i <= e; i++) pages.add(i)
      }
    } else {
      const p = parseInt(r) - 1
      if (!isNaN(p) && p >= 0 && p < maxPages) pages.add(p)
    }
  })
  return pages
}

export function stringifyPageRanges(pagesSet: Set<number>): string {
  if (pagesSet.size === 0) return ''
  const sorted = Array.from(pagesSet).sort((a, b) => a - b)
  const ranges: string[] = []
  let rangeStart = sorted[0] as number
  let rangeEnd = sorted[0] as number
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === rangeEnd + 1) {
      rangeEnd = sorted[i] as number
    } else {
      if (rangeStart === rangeEnd) ranges.push(`${rangeStart + 1}`)
      else ranges.push(`${rangeStart + 1}-${rangeEnd + 1}`)
      rangeStart = sorted[i] as number
      rangeEnd = sorted[i] as number
    }
  }
  if (rangeStart === rangeEnd) ranges.push(`${rangeStart + 1}`)
  else ranges.push(`${rangeStart + 1}-${rangeEnd + 1}`)
  return ranges.join(', ')
}

// --- Thumbnail Component ---
function SortableThumbnail({ id, pageIndex, isSelected, rotation, activeTool, onToggleSelect, onRotate }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id.toString() })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 }
  const isRearrange = activeTool === 'rearrange'

  return (
    <div
      ref={isRearrange ? setNodeRef : null}
      style={style}
      {...(isRearrange ? attributes : {})}
      {...(isRearrange ? listeners : {})}
      onClick={(e) => {
        if (!isRearrange) onToggleSelect(e)
      }}
      className={`relative rounded-xl shadow-sm transition-all group select-none flex flex-col items-center justify-center p-2 bg-[var(--surface-primary)] ${
        isRearrange ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${
        isSelected
          ? 'border-2 border-[var(--color-primary-500)] bg-[var(--color-primary-50)] ring-4 ring-[var(--color-primary-500)]/10'
          : 'border border-[var(--border-subtle)] hover:border-[var(--color-primary-300)]'
      }`}
    >
      <div className="w-full aspect-[1/1.4] flex items-center justify-center overflow-hidden pointer-events-none rounded-lg bg-[var(--surface-secondary)]">
        <Page
          pageNumber={pageIndex + 1}
          width={140}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          rotate={rotation}
          className="shadow-sm"
        />
      </div>
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
        {pageIndex + 1}
      </div>
      {isSelected && (
        <div className="absolute top-3 right-3 text-white bg-[var(--color-primary-500)] rounded-full shadow-sm">
          <CheckCircle2 size={16} />
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRotate()
        }}
        className="absolute bottom-3 right-3 p-1.5 bg-black/60 hover:bg-black text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
        title="Rotate"
      >
        <RotateCw size={14} />
      </button>
    </div>
  )
}

import type { PdfNamingSettings } from '../PdfProcessor'

export interface UnifiedWorkspaceProps {
  file: File | null
  activeTool: PdfTool
  step: 1 | 2 | 3
  isProcessing: boolean
  processingStats: {
    originalSize: number
    finalSize: number
    timeMs: number
  } | null

  namingSettings: PdfNamingSettings
  setNamingSettings: React.Dispatch<React.SetStateAction<PdfNamingSettings>>

  onFileUpload: (file: File) => void
  onFileReplace: () => void
  onProceedToReview: () => void
  onProcess: (config: any) => void
  onDownload: () => void
  onStartNew: () => void
  onToolSelect: (tool: PdfTool) => void
}

export function UnifiedWorkspace({
  file, activeTool, step, isProcessing, processingStats,
  namingSettings, setNamingSettings,
  onFileUpload, onFileReplace, onProceedToReview, onProcess, onDownload, onStartNew
}: UnifiedWorkspaceProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  const { defaultPdfCompression } = useSettingsStore()
  const initialTargetKB = useMemo(() => {
    switch (defaultPdfCompression) {
      case 'Extreme': return '50'
      case 'Recommended': return '200'
      case 'Less': return '500'
      default: return 'none'
    }
  }, [defaultPdfCompression])

  const [compressionLevel, setCompressionLevel] = useState('balanced')
  const [targetKB, setTargetKB] = useState<string>(initialTargetKB)
  const [customKB, setCustomKB] = useState<number>()
  const [pageRangeStr, setPageRangeStr] = useState('')
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [lastSelected, setLastSelected] = useState<number | null>(null)
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [rotations, setRotations] = useState<Record<number, number>>({})

  const toolName = ((activeTool as string) || 'compress').replace('_', ' ')
  const isPageTool = ['split', 'extract', 'delete', 'rotate', 'rearrange'].includes((activeTool as string) || '')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    if (file && numPages > 0) {
      setSelectedPages(new Set())
      setLastSelected(null)
      setRotations({})
      const initialOrder = Array.from({ length: numPages }, (_, i) => i)
      setPageOrder(initialOrder)
      if (activeTool === 'rearrange') setPageRangeStr(initialOrder.map((n) => n + 1).join(', '))
      else setPageRangeStr('')
    }
  }, [file, activeTool, numPages])

  useEffect(() => {
    if (activeTool === 'rearrange' && pageRangeStr) {
      const parts = pageRangeStr.split(',').map((s) => parseInt(s.trim()) - 1).filter((n) => !isNaN(n) && n >= 0 && n < numPages)
      if (parts.length === numPages && new Set(parts).size === numPages) setPageOrder(parts)
    }
  }, [pageRangeStr, activeTool, numPages])

  const handleRangeInputChange = (val: string) => {
    setPageRangeStr(val)
    if (activeTool !== 'rearrange') setSelectedPages(parsePageRanges(val, numPages || 1000))
  }

  const handleThumbnailClick = (pageIndex: number, e: React.MouseEvent) => {
    let newSel = new Set(selectedPages)
    if (e.shiftKey && lastSelected !== null) {
      const start = Math.min(pageIndex, lastSelected)
      const end = Math.max(pageIndex, lastSelected)
      for (let i = start; i <= end; i++) newSel.add(i)
    } else {
      if (newSel.has(pageIndex)) newSel.delete(pageIndex)
      else newSel.add(pageIndex)
    }
    setSelectedPages(newSel)
    setLastSelected(pageIndex)
    if (activeTool !== 'rearrange') setPageRangeStr(stringifyPageRanges(newSel))
  }

  const handleRotateThumbnail = (pageIndex: number) => {
    setRotations((prev) => ({ ...prev, [pageIndex]: ((prev[pageIndex] || 0) + 90) % 360 }))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = pageOrder.findIndex((p) => p.toString() === active.id)
      const newIndex = pageOrder.findIndex((p) => p.toString() === over.id)
      const newOrder = arrayMove(pageOrder, oldIndex, newIndex)
      setPageOrder(newOrder)
      setPageRangeStr(newOrder.map((n) => n + 1).join(', '))
    }
  }

  const handleGoToProcess = () => {
    const config: any = { rotations }
    if (activeTool === 'compress') {
      config.compressionLevel = compressionLevel
      config.targetKB = targetKB === 'custom' ? customKB : (targetKB !== 'none' ? parseInt(targetKB) : 0)
    } else if (isPageTool) {
      config.selectedPages = Array.from(selectedPages).sort((a, b) => a - b)
      config.pageRangeStr = pageRangeStr
      config.pageOrder = pageOrder
    }
    onProcess(config)
  }

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + ' MB'

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[var(--surface-secondary)]">
      <div className={`mx-auto w-full flex flex-col flex-1 min-h-0 ${step === 2 ? 'p-4 md:p-6 max-w-7xl' : 'p-6 md:p-8 max-w-5xl'}`}>
        
        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center pt-8 md:pt-16 animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 capitalize tracking-tight text-center">
              PDF Tools
            </h1>
            <p className="text-[var(--text-secondary)] mb-8 text-center text-sm md:text-base">
              Securely process your documents locally in your browser.
            </p>
            <div className="w-full bg-[var(--surface-primary)] rounded-3xl shadow-sm border border-[var(--border-subtle)] p-2 md:p-4">
              <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-6 md:p-12 hover:bg-[var(--surface-secondary)] transition-colors">
                <UploadZone
                  onDropFiles={(files) => { if (files[0]) onFileUpload(files[0]) }}
                  accept="application/pdf"
                  title="Select PDF file"
                  description="or drop PDFs here"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && file && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            
            {/* File Info Bar */}
            <div className="bg-[var(--surface-primary)] rounded-2xl shadow-sm border border-[var(--border-subtle)] px-[14px] py-[10px] flex items-center gap-3">
              <div className="p-1.5 bg-[var(--color-primary-50)] text-[var(--color-primary-500)] rounded-lg shrink-0 flex items-center justify-center">
                <FileIcon size={18} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
                <h3 className="font-medium text-sm text-[var(--text-primary)] truncate leading-tight">
                  {file.name}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                  {formatSize(file.size)} &middot; {numPages} {numPages === 1 ? 'page' : 'pages'}
                </p>
              </div>
              <button 
                onClick={onFileReplace}
                className="shrink-0 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-md transition-colors flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Config Panel */}
            <div className="bg-[var(--surface-primary)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden">
              <div className="py-2 px-[14px] border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] flex items-center gap-2">
                <Settings2 className="text-[var(--text-secondary)]" size={16} />
                <h2 className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                  Configure {toolName}
                </h2>
              </div>

              <div className="px-[14px] py-[10px] flex flex-col gap-2">
                <div className={`grid grid-cols-1 ${isPageTool ? 'sm:grid-cols-[2fr_1fr]' : ''} gap-2`}>
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-[2px]">
                      Custom Name
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank to use original name"
                      value={namingSettings.filename}
                      onChange={(e) =>
                        setNamingSettings((s) => ({
                          ...s,
                          filename: e.target.value,
                        }))
                      }
                      className="w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] text-[var(--text-primary)] text-sm font-medium placeholder:text-[var(--text-tertiary)]"
                    />
                  </div>

                  {isPageTool && (
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-[2px]">
                        {activeTool === 'rearrange' ? 'Page Order' : 'Selected Pages'}
                      </label>
                      <input
                        type="text"
                        placeholder={activeTool === 'rearrange' ? '1, 2, 3' : '1-5, 8, 11-13'}
                        value={pageRangeStr}
                        onChange={(e) => handleRangeInputChange(e.target.value)}
                        className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] text-[var(--text-primary)] transition-all"
                      />
                      {activeTool !== 'rearrange' && (
                        <div className="flex justify-end items-center text-[11px] text-[var(--text-secondary)] mt-1">
                          <span className="font-semibold text-[var(--color-primary-600)]">
                            {selectedPages.size} selected
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {activeTool === 'compress' && (
                  <div className="flex flex-col gap-2 mt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-[2px]">
                        Compression Quality
                      </label>
                      <div className="flex bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg p-1 relative">
                        {['high_quality', 'balanced', 'maximum'].map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setCompressionLevel(lvl)}
                            className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-md capitalize transition-all duration-200 z-10 ${
                              compressionLevel === lvl 
                                ? 'bg-[var(--color-primary-500)] text-white shadow-sm' 
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-primary)]'
                            }`}
                          >
                            {lvl.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-[2px]">
                        Target File Size
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {['none', '1024', '500', '200', '100', '50', 'custom'].map((size) => (
                          <button
                            key={size}
                            onClick={() => setTargetKB(size)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              targetKB === size 
                                ? 'bg-[var(--color-primary-500)] border-[var(--color-primary-500)] text-white shadow-sm shadow-[var(--color-primary-500)]/20' 
                                : 'bg-[var(--surface-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--color-primary-300)]'
                            }`}
                          >
                            {size === 'none' ? 'None' : size === 'custom' ? 'Custom' : `${size}KB`}
                          </button>
                        ))}
                      </div>
                      
                      {targetKB === 'custom' && (
                        <div className="mt-1.5 animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="150"
                            value={customKB || ''}
                            onChange={(e) => setCustomKB(Number(e.target.value))}
                            className="w-[90px] bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] text-[var(--text-primary)] text-[11px] font-medium"
                            min="1"
                          />
                          <span className="text-[var(--text-secondary)] text-[11px] font-medium">KB</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isPageTool && (
                <div className="p-6 bg-[var(--surface-secondary)] border-t border-[var(--border-subtle)] min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={pageOrder.map(String)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 md:gap-6">
                        <Document
                          file={fileUrl}
                          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                          className="contents"
                        >
                          {pageOrder.map((pageIndex) => (
                            <SortableThumbnail
                              key={pageIndex}
                              id={pageIndex}
                              pageIndex={pageIndex}
                              isSelected={selectedPages.has(pageIndex)}
                              rotation={rotations[pageIndex] || 0}
                              activeTool={activeTool}
                              onToggleSelect={(e: React.MouseEvent) => handleThumbnailClick(pageIndex, e)}
                              onRotate={() => handleRotateThumbnail(pageIndex)}
                            />
                          ))}
                        </Document>
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={onProceedToReview}
                disabled={isPageTool && activeTool !== 'rearrange' && selectedPages.size === 0}
                className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded-xl px-8 shadow-lg shadow-[var(--color-primary-500)]/30"
              >
                Proceed <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Download */}
        {step === 3 && file && (
          <div className="flex flex-col items-center justify-center pt-8 animate-in fade-in zoom-in-95 duration-500 max-w-xl mx-auto w-full">
            
            <div className="w-full bg-[var(--surface-primary)] rounded-3xl shadow-xl shadow-black/5 dark:shadow-none border border-[var(--border-subtle)] overflow-hidden text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-full mb-6">
                <FileIcon size={40} />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] truncate mb-2">
                {file.name}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-8 font-medium">
                {formatSize(file.size)} • Ready to {toolName}
              </p>

              {processingStats && (
                <div className="bg-[var(--surface-secondary)] rounded-2xl p-6 mb-8 flex justify-around">
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Original</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{formatSize(processingStats.originalSize)}</p>
                  </div>
                  <div className="w-px bg-[var(--border-subtle)]"></div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Processed</p>
                    <p className="text-lg font-bold text-[var(--color-primary-500)]">{formatSize(processingStats.finalSize)}</p>
                  </div>
                  {activeTool === 'compress' && (
                    <>
                      <div className="w-px bg-[var(--border-subtle)]"></div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Saved</p>
                        <p className="text-lg font-bold text-green-600">
                          {Math.max(0, Math.round((1 - processingStats.finalSize / processingStats.originalSize) * 100))}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {!processingStats ? (
                <Button
                  onClick={handleGoToProcess}
                  disabled={isProcessing}
                  className="w-full h-14 rounded-xl text-lg font-bold bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white shadow-lg shadow-[var(--color-primary-500)]/30"
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin mr-3" size={20} /> Processing...</>
                  ) : (
                    'Process PDF'
                  )}
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={onDownload}
                    className="w-full h-14 rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30"
                  >
                    <Download size={20} className="mr-3" /> Download Result
                  </Button>
                  <Button
                    onClick={onStartNew}
                    className="w-full h-12 rounded-xl text-base font-semibold bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <PlusCircle size={18} className="mr-2" /> Process Another
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
