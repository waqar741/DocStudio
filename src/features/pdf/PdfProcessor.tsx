import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UnifiedWorkspace, type PdfTool } from './components/UnifiedWorkspace'
import { LeftSidebar } from './components/LeftSidebar'
import { DownloadService } from '@/services/DownloadService'
import * as pdfApi from './api/pdfApi'
import { useNotificationStore } from '@/store/notificationStore'
import { useRecentFiles } from '@/hooks/useRecentFiles'

export interface PdfNamingSettings {
  filename: string
  useCustomNaming: boolean
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export function PdfProcessor() {
  const [file, setFile] = useState<File | null>(null)
  const [activeTool, setActiveTool] = useState<PdfTool>('compress')

  const [searchParams, setSearchParams] = useSearchParams()

  const stepParam = searchParams.get('step')
  const step = stepParam ? (parseInt(stepParam) as 1 | 2 | 3) : 1

  const setStep = useCallback((newStep: 1 | 2 | 3, replace = false) => {
    setSearchParams({ step: newStep.toString() }, { replace })
  }, [setSearchParams])

  // Reset step if file is removed
  useEffect(() => {
    if (step > 1 && !file) {
      setStep(1, true)
    }
  }, [step, file, setStep])

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false)
  const [, setProcessingMessage] = useState('')
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [processedFilename, setProcessedFilename] = useState<string>('')

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [namingSettings, setNamingSettings] = useState<PdfNamingSettings>({
    filename: '',
    useCustomNaming: false,
  })

  const [processingStats, setProcessingStats] = useState<{
    originalSize: number
    finalSize: number
    timeMs: number
    compressionRatio?: number
    pagesProcessed?: number
  } | null>(null)

  const [, setError] = useState<string | null>(null)
  const [, setRetryCount] = useState(0)

  const addToast = useNotificationStore((state) => state.addNotification)
  const { addFile } = useRecentFiles()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  const validateFile = (uploadedFile: File): boolean => {
    const validTypes = ['application/pdf']
    const validExtensions = ['.pdf']
    const fileName = uploadedFile.name.toLowerCase()

    if (!validTypes.includes(uploadedFile.type) &&
      !validExtensions.some(ext => fileName.endsWith(ext))) {
      addToast('Invalid File', 'Please select a valid PDF document.', 'error')
      return false
    }

    if (uploadedFile.size > MAX_FILE_SIZE) {
      addToast('File Too Large', `Please select a PDF under ${formatBytes(MAX_FILE_SIZE)}.`, 'warning')
      return false
    }

    if (uploadedFile.size === 0) {
      addToast('Empty File', 'The selected file is empty.', 'error')
      return false
    }

    return true
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const generateDefaultFilename = (tool: PdfTool, originalName: string, useCustom: boolean, customName: string): string => {
    if (useCustom && customName.trim()) {
      let name = customName.trim()
      // Ensure proper extension based on tool
      if (tool === 'split') {
        if (!name.toLowerCase().endsWith('.zip') && !name.toLowerCase().endsWith('.pdf')) {
          name += '.zip'
        }
      } else {
        if (!name.toLowerCase().endsWith('.pdf')) {
          name += '.pdf'
        }
      }
      return name
    }

    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName

    const toolSuffixes: Record<string, string> = {
      compress: '_compressed',
      split: '_split',
      extract: '_extracted',
      rotate: '_rotated',
      delete: '_deleted',
      rearrange: '_rearranged',
      insert_blank: '_blank_added',
    }

    const suffix = toolSuffixes[tool || ''] || '_processed'
    const extension = tool === 'split' ? '.zip' : '.pdf'

    return `${nameWithoutExt}${suffix}${extension}`
  }

  const handleFileUpload = useCallback((uploadedFile: File) => {
    setError(null)
    setRetryCount(0)
    if (!validateFile(uploadedFile)) return

    setFile(uploadedFile)
    setProcessedBlob(null)
    setProcessingStats(null)

    // Auto-generate default filename
    const defaultName = generateDefaultFilename(activeTool, uploadedFile.name, false, '')
    setNamingSettings(prev => ({
      ...prev,
      filename: defaultName,
    }))

    setStep(2)
  }, [activeTool, setStep])

  const handleFileReplace = useCallback(() => {
    setFile(null)
    setSearchParams({}, { replace: true })
    setProcessedBlob(null)
    setProcessingStats(null)
    setRetryCount(0)
    setNamingSettings({
      filename: '',
      useCustomNaming: false,
    })
  }, [setSearchParams])

  const handleStartNew = useCallback(() => {
    setFile(null)
    setSearchParams({}, { replace: true })
    setProcessedBlob(null)
    setProcessingStats(null)
    setRetryCount(0)
    setNamingSettings({
      filename: '',
      useCustomNaming: false,
    })
  }, [setSearchParams])

  const handleToolSelect = useCallback((tool: PdfTool) => {
    setActiveTool(tool)
    setRetryCount(0)

    if (file) {
      // Regenerate filename for new tool
      const newName = generateDefaultFilename(
        tool,
        file.name,
        namingSettings.useCustomNaming,
        namingSettings.filename
      )
      setNamingSettings(prev => ({
        ...prev,
        filename: prev.useCustomNaming ? prev.filename : newName,
      }))
    }

    if (file && step === 3) {
      setStep(2)
      setProcessedBlob(null)
      setProcessingStats(null)
    }
  }, [file, step, namingSettings.useCustomNaming, namingSettings.filename, setStep])

  const handleProcess = useCallback(async (config: any) => {
    if (!file || !activeTool) {
      addToast('Error', 'Please select a file and tool first.', 'error')
      return
    }

    setIsProcessing(true)
    const startTime = Date.now()

    try {
      let finalBlob: Blob | null = null

      // Generate output filename
      let outName = generateDefaultFilename(
        activeTool,
        file.name,
        namingSettings.useCustomNaming,
        namingSettings.filename
      )

      // Execute primary tool
      switch (activeTool) {
        case 'compress':
          finalBlob = await pdfApi.compressPdf(
            file,
            config.compressionLevel || 'balanced',
            outName,
            config.targetKB || 0,
          )
          break

        case 'split': {
          const splitRes = await pdfApi.splitPdf(file, config.splitMode || 'every_page', config.splitValue || '', outName)
          finalBlob = splitRes.blob
          // Respect user's custom naming even for split results
          if (namingSettings.useCustomNaming && namingSettings.filename.trim()) {
            outName = namingSettings.filename.trim()
            if (!outName.toLowerCase().endsWith('.zip') && !outName.toLowerCase().endsWith('.pdf')) {
              outName += splitRes.filename?.endsWith('.zip') ? '.zip' : '.pdf'
            }
          } else {
            outName = splitRes.filename || outName
          }
          break
        }

        case 'extract': {
          const extractRes = await pdfApi.extractPages(
            file,
            config.pageRangeStr || '',
            outName,
          )
          finalBlob = extractRes.blob
          outName = namingSettings.useCustomNaming ? outName : (extractRes.filename || outName)
          break
        }

        case 'rotate': {
          const rotationsObj = config.rotations || {}

          if (
            Object.keys(rotationsObj).length === 0 &&
            config.selectedPages &&
            Array.isArray(config.selectedPages)
          ) {
            config.selectedPages.forEach((p: number) => (rotationsObj[p] = 90))
          }

          if (Object.keys(rotationsObj).length === 0) {
            throw new Error('Please select pages to rotate and specify rotation angles.')
          }

          finalBlob = await pdfApi.rotatePdf(file, rotationsObj, outName)
          break
        }

        case 'delete':
          if (!config.selectedPages || config.selectedPages.length === 0) {
            throw new Error('Please select pages to delete.')
          }
          finalBlob = await pdfApi.deletePages(
            file,
            config.selectedPages || [],
            outName,
          )
          break

        case 'rearrange':
          if (!config.pageOrder || config.pageOrder.length === 0) {
            throw new Error('Please specify the new page order.')
          }
          finalBlob = await pdfApi.rearrangePdf(
            file,
            config.pageOrder || [],
            outName,
          )
          break

        case 'insert_blank':
          finalBlob = await pdfApi.addBlankPage(
            file,
            config.position ?? 0,
            config.size || 'A4',
            outName,
          )
          break

        default:
          // Fallback: copy file as-is
          finalBlob = new Blob([await file.arrayBuffer()], {
            type: 'application/pdf',
          })
          outName = generateDefaultFilename(activeTool, file.name, false, '')
      }

      if (!finalBlob || finalBlob.size === 0) {
        throw new Error('Processing resulted in an empty file. Please try different settings.')
      }

      // Execute optional secondary compression pipeline
      if (config.doCompressOutput && finalBlob) {
        setProcessingMessage('Applying output compression...')
        const tempFile = new File([finalBlob], outName, {
          type: 'application/pdf',
        })
        finalBlob = await pdfApi.compressPdf(
          tempFile,
          config.outputCompressionLevel || 'balanced',
          outName,
          0,
        )
      }

      const timeMs = Date.now() - startTime
      const compressionRatio = finalBlob
        ? ((1 - finalBlob.size / file.size) * 100)
        : 0

      setProcessedBlob(finalBlob)
      setProcessedFilename(outName)
      setProcessingStats({
        originalSize: file.size,
        finalSize: finalBlob.size,
        timeMs,
        compressionRatio: activeTool === 'compress' ? Math.max(0, compressionRatio) : undefined,
      })

      setRetryCount(0)
      addToast('Success', 'Document processed successfully!', 'success')
      setStep(3)
    } catch (error) {
      console.error('Processing error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process document'
      setError(errorMessage)
      addToast('Processing Failed', errorMessage, 'error')

      // Do nothing on progress for now
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      progressIntervalRef.current = null

      setIsProcessing(false)
    }
  }, [file, activeTool, namingSettings, addToast, setStep])

  const handleDownload = useCallback(async () => {
    if (!processedBlob || !processedFilename) {
      addToast('Error', 'No processed file available for download.', 'error')
      return
    }

    try {
      DownloadService.download(processedBlob, processedFilename)

      // Save to recent files
      await addFile({
        type: 'pdf',
        filename: processedFilename,
        data: processedBlob,
        size: processedBlob.size,
      })

      addToast('Downloaded', 'File saved and added to recent files.', 'success')
    } catch (err) {
      console.error('Failed to save to local DB:', err)
      // Still download even if saving fails
      DownloadService.download(processedBlob, processedFilename)
      addToast('Downloaded', 'File downloaded but could not be saved to history.', 'warning')
    }
  }, [processedBlob, processedFilename, addFile, addToast])

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[var(--surface-secondary)] dark:bg-[var(--surface-secondary)] relative overflow-hidden">

      <LeftSidebar
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <UnifiedWorkspace
          file={file}
          activeTool={activeTool}
          step={step}
          isProcessing={isProcessing}
          processingStats={processingStats}
          namingSettings={namingSettings}
          setNamingSettings={setNamingSettings}
          onFileUpload={handleFileUpload}
          onFileReplace={handleFileReplace}
          onProceedToReview={() => setStep(3)}
          onProcess={handleProcess}
          onDownload={handleDownload}
          onStartNew={handleStartNew}
          onToolSelect={handleToolSelect}
        />
      </div>
    </div>
  )
}