import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { UnifiedMergeWorkspace } from './UnifiedMergeWorkspace'
import { mergeDocumentsBackend } from '../api/mergeApi'
import { DownloadService } from '@/services/DownloadService'
import { useNotificationStore } from '@/store/notificationStore'

export interface MergeSettings {
  pageSize: string
  orientation: string
  margin: string
  outputFormat: 'pdf' | 'image'
  imageLayout: 'vertical' | 'horizontal'
}

export interface MergeNamingSettings {
  filename: string
}

export function MergeProcessor() {
  const [files, setFiles] = useState<File[]>([])
  
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const stepParam = searchParams.get('step')
  const step = stepParam ? (parseInt(stepParam) as 1 | 2 | 3) : 1
  
  const setStep = (newStep: 1 | 2 | 3, replace = false) => {
    setSearchParams({ step: newStep.toString() }, { replace })
  }

  useEffect(() => {
    if (step > 1 && files.length === 0) {
      setStep(1, true)
    }
  }, [step, files.length])

  const [settings, setSettings] = useState<MergeSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 'none',
    outputFormat: 'pdf',
    imageLayout: 'vertical',
  })

  const [namingSettings, setNamingSettings] = useState<MergeNamingSettings>({
    filename: '',
  })

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [generatedFilename, setGeneratedFilename] = useState<string>('')

  const addToast = useNotificationStore((state) => state.addNotification)

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prev) => {
      const validFiles = newFiles.filter(
        (f): f is File => f !== undefined && f !== null,
      )
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
      const { blob } = await mergeDocumentsBackend(
        files,
        settings
      )
      
      let finalName = namingSettings.filename?.trim()
      if (!finalName) {
        const firstFile = files[0]?.name || 'document'
        const nameWithoutExt = firstFile.substring(0, firstFile.lastIndexOf('.')) || firstFile
        const ext = settings.outputFormat === 'image' ? 'jpg' : 'pdf'
        finalName = `${nameWithoutExt}_merged.${ext}`
      } else {
        const ext = settings.outputFormat === 'image' ? '.jpg' : '.pdf'
        if (!finalName.toLowerCase().endsWith(ext)) {
          finalName += ext
        }
      }

      setProcessedBlob(blob)
      setGeneratedFilename(finalName)
      setStep(3)
      addToast('Success', 'Documents merged successfully!', 'success')
    } catch (error: any) {
      console.error(error)
      addToast(
        'Error',
        error.response?.data?.detail || 'Failed to merge documents',
        'error',
      )
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
    setSearchParams({}, { replace: true })
    setProcessedBlob(null)
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex flex-1 w-full min-h-0 overflow-hidden bg-[var(--surface-secondary)]">
      <UnifiedMergeWorkspace
        files={files}
        step={step}
        isProcessing={isProcessing}
        processedBlob={processedBlob}
        generatedFilename={generatedFilename}
        settings={settings}
        setSettings={setSettings}
        filename={namingSettings.filename}
        onFilenameChange={(name: string) => setNamingSettings({ filename: name })}
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
