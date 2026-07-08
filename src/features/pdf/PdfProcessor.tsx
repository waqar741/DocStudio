import { useState } from 'react'
import { LeftSidebar, type PdfTool } from './components/LeftSidebar'
import { UnifiedWorkspace } from './components/UnifiedWorkspace'
import { DownloadService } from '@/services/DownloadService'
import * as pdfApi from './api/pdfApi'
import { useNotificationStore } from '@/store/notificationStore'
import { useRecentFiles } from '@/hooks/useRecentFiles'

export function PdfProcessor() {
  const [file, setFile] = useState<File | null>(null)
  const [activeTool, setActiveTool] = useState<PdfTool>('compress')
  
  // State Machine
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [processedFilename, setProcessedFilename] = useState<string>('')
  const [processingStats, setProcessingStats] = useState<{
    originalSize: number
    finalSize: number
    timeMs: number
  } | null>(null)

  const addToast = useNotificationStore((state) => state.addNotification)
  const { addFile } = useRecentFiles()

  const handleFileUpload = (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      addToast('Error', 'Please select a valid PDF document.', 'error')
      return
    }
    setFile(uploadedFile)
    setStep(2)
  }

  const handleFileReplace = () => {
    setFile(null)
    setStep(1)
    setProcessedBlob(null)
    setProcessingStats(null)
  }

  const handleStartNew = () => {
    setFile(null)
    setStep(1)
    setProcessedBlob(null)
    setProcessingStats(null)
  }

  const handleToolSelect = (tool: PdfTool) => {
    setActiveTool(tool)
    if (file && step === 3) {
      // If they finished processing and switch tools, put them back into configure mode
      setStep(2)
      setProcessedBlob(null)
      setProcessingStats(null)
    }
  }

  const handleProcess = async (config: any) => {
    if (!file || !activeTool) return
    setIsProcessing(true)
    const startTime = Date.now()

    try {
      let finalBlob: Blob | null = null
      let outName = ''

      // Execute primary tool
      if (activeTool === 'compress') {
        outName = file.name.replace('.pdf', '_compressed.pdf')
        finalBlob = await pdfApi.compressPdf(
          file,
          config.compressionLevel || 'balanced',
          outName,
          config.targetKB || 0,
        )
      } else if (activeTool === 'split') {
        outName = file.name.replace('.pdf', '_split.pdf')
        const res = await pdfApi.splitPdf(file, 'every_page', '', outName)
        finalBlob = res.blob
        outName = res.filename || outName
      } else if (activeTool === 'extract') {
        outName = file.name.replace('.pdf', '_extracted.pdf')
        const res = await pdfApi.extractPages(
          file,
          config.pageRangeStr || '',
          outName,
        )
        finalBlob = res.blob
        outName = res.filename || outName
      } else if (activeTool === 'rotate') {
        outName = file.name.replace('.pdf', '_rotated.pdf')
        const rotationsObj = config.rotations || {}

        if (
          Object.keys(rotationsObj).length === 0 &&
          config.selectedPages &&
          Array.isArray(config.selectedPages)
        ) {
          config.selectedPages.forEach((p: number) => (rotationsObj[p] = 90))
        }

        finalBlob = await pdfApi.rotatePdf(file, rotationsObj, outName)
      } else if (activeTool === 'delete') {
        outName = file.name.replace('.pdf', '_deleted.pdf')
        finalBlob = await pdfApi.deletePages(
          file,
          config.selectedPages || [],
          outName,
        )
      } else if (activeTool === 'rearrange') {
        outName = file.name.replace('.pdf', '_rearranged.pdf')
        finalBlob = await pdfApi.rearrangePdf(
          file,
          config.pageOrder || [],
          outName,
        )
      } else {
        // Fallback for missing implementations just copies the file
        finalBlob = new Blob([await file.arrayBuffer()], {
          type: 'application/pdf',
        })
        outName = file.name.replace('.pdf', '_processed.pdf')
      }

      // Execute optional secondary pipeline (Compress Output)
      if (config.doCompressOutput && finalBlob) {
        // Convert Blob back to File for API
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

      setProcessedBlob(finalBlob)
      setProcessedFilename(outName)
      setProcessingStats({
        originalSize: file.size,
        finalSize: finalBlob.size,
        timeMs,
      })

      addToast('Success', 'Document processed successfully!', 'success')
    } catch (error) {
      console.error(error)
      addToast('Error', 'Failed to process document', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (processedBlob && processedFilename) {
      DownloadService.download(processedBlob, processedFilename)
      
      try {
        await addFile({
          type: 'pdf',
          filename: processedFilename,
          data: processedBlob,
          size: processedBlob.size,
        })
      } catch (err) {
        console.error('Failed to save to local DB:', err)
      }
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[var(--surface-secondary)] relative overflow-hidden">
      
      <LeftSidebar 
        activeTool={activeTool} 
        onToolSelect={handleToolSelect}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar">
        <UnifiedWorkspace
          file={file}
          activeTool={activeTool}
          step={step}
          isProcessing={isProcessing}
          processingStats={processingStats}
          onFileUpload={handleFileUpload}
          onFileReplace={handleFileReplace}
          onProceedToReview={() => setStep(3)}
          onProcess={handleProcess}
          onDownload={handleDownload}
          onStartNew={handleStartNew}
        />
      </div>
    </div>
  )
}
