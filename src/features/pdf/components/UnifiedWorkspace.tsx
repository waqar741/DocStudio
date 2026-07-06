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
import type { PdfTool } from './LeftSidebar'
import {
  CheckCircle2,
  Download,
  Loader2,
  ArrowRight,
  RotateCw,
  File as FileIcon,
  X,
  PlusCircle,
} from 'lucide-react'

// Utilities for Range string <-> Set<number> two-way binding
export function parsePageRanges(
  rangesStr: string,
  maxPages: number,
): Set<number> {
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

function SortableThumbnail({
  id,
  pageIndex,
  isSelected,
  rotation,
  activeTool,
  onToggleSelect,
  onRotate,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id.toString() })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

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
      className={`relative rounded-xl shadow-sm transition-all group select-none flex flex-col items-center justify-center p-2 bg-white ${
        isRearrange ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${
        isSelected
          ? 'border-2 border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] ring-4 ring-[var(--color-primary-500)]/10'
          : 'border border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="w-[120px] flex items-center justify-center overflow-hidden pointer-events-none">
        <Page
          pageNumber={pageIndex + 1}
          width={120}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          rotate={rotation}
          className="shadow-sm"
        />
      </div>
      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
        {pageIndex + 1}
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 text-white bg-[var(--color-primary-500)] rounded-full shadow-sm">
          <CheckCircle2 size={16} />
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRotate()
        }}
        className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
        title="Rotate"
      >
        <RotateCw size={14} />
      </button>
    </div>
  )
}

export interface UnifiedWorkspaceProps {
  file: File | null
  activeTool: PdfTool
  step: 1 | 2 | 3
  isProcessing: boolean
  processedBlob: Blob | null
  processingStats: {
    originalSize: number
    finalSize: number
    timeMs: number
  } | null

  onFileUpload: (file: File) => void
  onFileReplace: () => void
  onProceedToReview: () => void
  onProcess: (config: any) => void
  onDownload: () => void
  onStartNew: () => void
}

export function UnifiedWorkspace({
  file,
  activeTool,
  step,
  isProcessing,
  processingStats,
  onFileUpload,
  onFileReplace,
  onProceedToReview,
  onProcess,
  onDownload,
  onStartNew,
}: UnifiedWorkspaceProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const fileUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  )

  // Tool Configurations
  const [compressionLevel, setCompressionLevel] = useState('balanced')
  const [pageRangeStr, setPageRangeStr] = useState('')
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [lastSelected, setLastSelected] = useState<number | null>(null)

  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [rotations, setRotations] = useState<Record<number, number>>({})

  // Optional Output Processing
  const [doCompressOutput, setDoCompressOutput] = useState(false)
  const [outputCompressionLevel, setOutputCompressionLevel] =
    useState('balanced')

  const toolName = ((activeTool as string) || 'compress').replace('_', ' ')
  const isPageTool = [
    'split',
    'extract',
    'delete',
    'rotate',
    'rearrange',
  ].includes((activeTool as string) || '')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  // Sync Input String <-> Thumbnails Grid
  const handleRangeInputChange = (val: string) => {
    setPageRangeStr(val)
    if (activeTool !== 'rearrange') {
      setSelectedPages(parsePageRanges(val, numPages || 1000))
    }
  }

  const handleThumbnailClick = (pageIndex: number, e: React.MouseEvent) => {
    let newSel = new Set(selectedPages)

    if (e.shiftKey && lastSelected !== null) {
      const start = Math.min(pageIndex, lastSelected)
      const end = Math.max(pageIndex, lastSelected)
      for (let i = start; i <= end; i++) newSel.add(i)
    } else {
      // Default to toggling selection without requiring Ctrl/Cmd
      if (newSel.has(pageIndex)) newSel.delete(pageIndex)
      else newSel.add(pageIndex)
    }

    setSelectedPages(newSel)
    setLastSelected(pageIndex)
    if (activeTool !== 'rearrange') {
      setPageRangeStr(stringifyPageRanges(newSel))
    }
  }

  const handleRotateThumbnail = (pageIndex: number) => {
    setRotations((prev) => ({
      ...prev,
      [pageIndex]: ((prev[pageIndex] || 0) + 90) % 360,
    }))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = pageOrder.findIndex((p) => p.toString() === active.id)
      const newIndex = pageOrder.findIndex((p) => p.toString() === over.id)
      const newOrder = arrayMove(pageOrder, oldIndex, newIndex)
      setPageOrder(newOrder)
      // Update string representation for rearrange
      setPageRangeStr(newOrder.map((n) => n + 1).join(', '))
    }
  }

  // Effect to reset config when file or tool changes
  useEffect(() => {
    if (file && numPages > 0) {
      setSelectedPages(new Set())
      setLastSelected(null)
      setDoCompressOutput(false)
      setRotations({})

      const initialOrder = Array.from({ length: numPages }, (_, i) => i)
      setPageOrder(initialOrder)

      if (activeTool === 'rearrange') {
        setPageRangeStr(initialOrder.map((n) => n + 1).join(', '))
      } else {
        setPageRangeStr('')
      }
    }
  }, [file, activeTool, numPages])

  // If user types in rearrange box, parse comma list to update grid order
  useEffect(() => {
    if (activeTool === 'rearrange' && pageRangeStr) {
      const parts = pageRangeStr
        .split(',')
        .map((s) => parseInt(s.trim()) - 1)
        .filter((n) => !isNaN(n) && n >= 0 && n < numPages)
      // Only update if length matches (prevent partial states wiping out pages)
      if (parts.length === numPages && new Set(parts).size === numPages) {
        setPageOrder(parts)
      }
    }
  }, [pageRangeStr, activeTool, numPages])

  const handleGoToProcess = () => {
    const config: any = {
      doCompressOutput,
      outputCompressionLevel,
      rotations, // pass manual rotations
    }
    if (activeTool === 'compress') {
      config.compressionLevel = compressionLevel
    } else if (isPageTool) {
      config.selectedPages = Array.from(selectedPages).sort((a, b) => a - b)
      config.pageRangeStr = pageRangeStr
      config.pageOrder = pageOrder
    }
    onProcess(config)
  }

  const formatSize = (bytes: number) =>
    (bytes / (1024 * 1024)).toFixed(2) + ' MB'

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] dark:bg-[#111] overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto w-full p-6 md:p-8 flex flex-col gap-8">
        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center pt-12">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6 capitalize">
              {toolName}
            </h1>
            <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] p-8">
              <UploadZone
                onDropFiles={(files) => {
                  if (files[0]) onFileUpload(files[0])
                }}
                accept="application/pdf"
                title="Select PDF file"
                description="Drag and drop your PDF here"
              />
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && file && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* File Info Bar */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                  <FileIcon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] truncate max-w-[300px]">
                    {file.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {formatSize(file.size)} • {numPages} Pages
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onFileReplace}>
                <X size={16} className="mr-2" /> Replace File
              </Button>
            </div>

            {/* Tool Configuration Panel */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden">
              <div className="p-6 border-b border-[var(--border-secondary)] bg-gray-50/50 dark:bg-gray-800/20">
                <h2 className="text-xl font-bold text-[var(--text-primary)] capitalize mb-4">
                  Configure {toolName}
                </h2>

                {activeTool === 'compress' && (
                  <div className="flex gap-6">
                    {['high_quality', 'balanced', 'maximum'].map((lvl) => (
                      <label
                        key={lvl}
                        className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${compressionLevel === lvl ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <input
                          type="radio"
                          name="compression"
                          value={lvl}
                          checked={compressionLevel === lvl}
                          onChange={() => setCompressionLevel(lvl)}
                          className="sr-only"
                        />
                        <span className="font-bold capitalize mb-1">
                          {lvl.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-center text-gray-500">
                          {lvl === 'high_quality'
                            ? 'Less compression, highest quality'
                            : lvl === 'balanced'
                              ? 'Good compression and good quality'
                              : 'High compression, lower quality'}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {isPageTool && (
                  <div className="flex flex-col gap-4">
                    <label className="text-sm font-semibold text-[var(--text-primary)]">
                      {activeTool === 'rearrange'
                        ? 'Page Order'
                        : `Pages to ${activeTool}`}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        activeTool === 'rearrange'
                          ? 'e.g. 3, 1, 2, 4'
                          : 'e.g. 1-5, 8, 11-13'
                      }
                      value={pageRangeStr}
                      onChange={(e) => handleRangeInputChange(e.target.value)}
                      className="w-full bg-white dark:bg-[#222] border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-lg focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--color-primary-500)]/10 transition-all outline-none"
                    />
                    <div className="flex justify-between items-center text-sm text-[var(--text-secondary)] mt-1">
                      <span>
                        {activeTool === 'rearrange'
                          ? 'Comma separated page order.'
                          : 'Separate page numbers with commas. Indicate a range with a dash.'}
                      </span>
                      {activeTool !== 'rearrange' && (
                        <span className="font-bold text-[var(--color-primary-600)]">
                          {selectedPages.size} pages selected
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Grid for Page Selection / Rearrangement */}
              {isPageTool && (
                <div className="p-6 bg-gray-50 dark:bg-[#151515] max-h-[500px] overflow-y-auto custom-scrollbar">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={pageOrder.map(String)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
                        <Document
                          file={fileUrl}
                          onLoadSuccess={({ numPages }) =>
                            setNumPages(numPages)
                          }
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
                              onToggleSelect={(e: React.MouseEvent) =>
                                handleThumbnailClick(pageIndex, e)
                              }
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

            {/* Optional Processing (Hidden if activeTool is compress) */}
            {activeTool !== 'compress' && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] p-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doCompressOutput}
                    onChange={(e) => setDoCompressOutput(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                  />
                  <span className="font-bold text-[var(--text-primary)]">
                    Compress Output PDF (Optional)
                  </span>
                </label>

                {doCompressOutput && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-secondary)] flex gap-4">
                    {['high_quality', 'balanced', 'maximum'].map((lvl) => (
                      <label
                        key={lvl}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="opt_compression"
                          value={lvl}
                          checked={outputCompressionLevel === lvl}
                          onChange={() => setOutputCompressionLevel(lvl)}
                        />
                        <span className="text-sm capitalize">
                          {lvl.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2 Bottom Actions */}
            <div className="flex justify-end pt-4 pb-12">
              <Button
                variant="primary"
                size="lg"
                onClick={onProceedToReview}
                disabled={
                  isPageTool &&
                  activeTool !== 'rearrange' &&
                  selectedPages.size === 0
                }
                className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white px-10 shadow-lg text-lg"
              >
                Proceed to Review <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Download */}
        {step === 3 && file && (
          <div className="flex flex-col items-center justify-center pt-8 animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">
              Review & Process
            </h2>

            <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-[var(--border-secondary)] overflow-hidden">
              <div className="p-6 border-b border-[var(--border-secondary)] bg-gray-50/50">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                    <FileIcon size={32} />
                  </div>
                  <h3 className="text-xl font-bold truncate max-w-md mx-auto">
                    {file.name}
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {formatSize(file.size)} • {numPages} Pages
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-t border-gray-100">
                    <span className="font-semibold text-[var(--text-secondary)]">
                      Operation
                    </span>
                    <span className="font-bold text-[var(--text-primary)] capitalize">
                      {toolName}
                    </span>
                  </div>
                  {isPageTool && activeTool !== 'rearrange' && (
                    <div className="flex justify-between items-center py-3 border-t border-gray-100">
                      <span className="font-semibold text-[var(--text-secondary)]">
                        Pages Targeted
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {selectedPages.size} pages
                      </span>
                    </div>
                  )}
                  {activeTool === 'rearrange' && (
                    <div className="flex justify-between items-center py-3 border-t border-gray-100">
                      <span className="font-semibold text-[var(--text-secondary)]">
                        Pages Targeted
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {numPages} pages
                      </span>
                    </div>
                  )}
                  {doCompressOutput && activeTool !== 'compress' && (
                    <div className="flex justify-between items-center py-3 border-t border-gray-100">
                      <span className="font-semibold text-[var(--text-secondary)]">
                        Optional Processing
                      </span>
                      <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        Compress ({outputCompressionLevel.replace('_', ' ')})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {processingStats && (
                <div className="p-6 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 border-b border-[var(--border-secondary)]">
                  <h4 className="text-sm font-bold text-[var(--color-primary-700)] uppercase tracking-wider mb-4">
                    Results
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">
                        Original Size
                      </p>
                      <p className="font-bold">
                        {formatSize(processingStats.originalSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">
                        Final Size
                      </p>
                      <p className="font-bold text-[var(--color-primary-600)]">
                        {formatSize(processingStats.finalSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">
                        Reduction
                      </p>
                      <p className="font-bold text-green-600">
                        {Math.max(
                          0,
                          Math.round(
                            (1 -
                              processingStats.finalSize /
                                processingStats.originalSize) *
                              100,
                          ),
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-8 flex flex-col items-center gap-4 bg-gray-50 dark:bg-[#1a1a1a]">
                {!processingStats ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleGoToProcess}
                    disabled={isProcessing}
                    className="w-full h-16 text-lg font-bold bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white shadow-xl"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin mr-3" size={24} />{' '}
                        Processing Document...
                      </>
                    ) : (
                      'Confirm & Process'
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={onDownload}
                      className="w-full h-16 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-xl"
                    >
                      <Download size={24} className="mr-3" /> Download Result
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={onStartNew}
                      className="text-[var(--text-secondary)] mt-2"
                    >
                      <PlusCircle size={18} className="mr-2" /> Start New
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
