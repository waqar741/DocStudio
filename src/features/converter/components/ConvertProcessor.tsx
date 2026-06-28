import { useState } from 'react'
import { UnifiedConvertWorkspace } from './UnifiedConvertWorkspace'
import { convertDocumentsBackend } from '../api/convertApi'
import { DownloadService } from '@/services/DownloadService'
import { useNotificationStore } from '@/store/notificationStore'

export interface ConvertSettings {
  targetFormat: 'pdf' | 'jpg' | 'png' | 'webp'
}

export function ConvertProcessor() {
  const [files, setFiles] = useState<File[]>([])
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  const [settings, setSettings] = useState<ConvertSettings>({
    targetFormat: 'pdf'
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [generatedFilename, setGeneratedFilename] = useState<string>('')
  
  const addToast = useNotificationStore(state => state.addNotification)

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(prev => {
      const validFiles = newFiles.filter((f): f is File => f !== undefined && f !== null)
      return [...prev, ...validFiles]
    })
  }

  const handleFilesReordered = (startIndex: number, endIndex: number) => {
    const newFiles = [...files]
    const [removed] = newFiles.splice(startIndex, 1)
    if (removed) {
      newFiles.splice(endIndex, 0, removed)
      setFiles(newFiles)
    }
  }

  const handleFileRemoved = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
    if (newFiles.length === 0) {
      setStep(1)
    }
  }

  const handleProceedToReview = () => {
    if (files.length > 0) {
      setStep(2)
    }
  }

  const handleProcess = async () => {
    if (files.length === 0) return
    setIsProcessing(true)
    
    try {
      const { blob, filename } = await convertDocumentsBackend(files, settings.targetFormat)
      setProcessedBlob(blob)
      setGeneratedFilename(filename)
      setStep(3)
      addToast('Success', 'Files converted successfully!', 'success')
    } catch (error: any) {
      console.error(error)
      addToast('Error', error.message || 'Failed to convert files', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (processedBlob && generatedFilename) {
      DownloadService.download(processedBlob, generatedFilename)
    }
  }

  const handleStartNew = () => {
    setFiles([])
    setStep(1)
    setProcessedBlob(null)
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      setStep(2)
    }
  }

  return (
    <div className="flex flex-1 w-full min-h-0 overflow-hidden bg-[var(--surface-secondary)]">
      <UnifiedConvertWorkspace
        files={files}
        step={step}
        isProcessing={isProcessing}
        processedBlob={processedBlob}
        generatedFilename={generatedFilename}
        settings={settings}
        setSettings={setSettings}
        onFilesAdded={handleFilesAdded}
        onFilesReordered={handleFilesReordered}
        onFileRemoved={handleFileRemoved}
        onProceedToReview={handleProceedToReview}
        onProcess={handleProcess}
        onDownload={handleDownload}
        onStartNew={handleStartNew}
        onBack={handleBack}
      />
    </div>
  )
}
