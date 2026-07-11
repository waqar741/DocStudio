import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { UnifiedConvertWorkspace } from './UnifiedConvertWorkspace'
import { convertDocumentsBackend } from '../api/convertApi'
import { DownloadService } from '@/services/DownloadService'
import { useNotificationStore } from '@/store/notificationStore'
import { useSettingsStore } from '@/store/settingsStore'

export interface ConvertSettings {
  targetFormat: 'pdf' | 'jpg' | 'png' | 'webp'
}

export interface ConvertNamingSettings {
  filename: string
}

export function ConvertProcessor() {
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

  const { defaultImageFormat } = useSettingsStore()

  const [settings, setSettings] = useState<ConvertSettings>({
    targetFormat: defaultImageFormat,
  })

  const [namingSettings, setNamingSettings] = useState<ConvertNamingSettings>({
    filename: '',
  })

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
      const { blob } = await convertDocumentsBackend(
        files,
        settings.targetFormat,
      )

      let finalName = namingSettings.filename?.trim()
      if (!finalName) {
        const firstFile = files[0]?.name || 'document'
        const nameWithoutExt = firstFile.substring(0, firstFile.lastIndexOf('.')) || firstFile
        const ext = blob.type === 'application/zip' || blob.type === 'application/x-zip-compressed' 
          ? 'zip' 
          : settings.targetFormat
        finalName = `${nameWithoutExt}_converted.${ext}`
      } else {
        const ext = blob.type === 'application/zip' || blob.type === 'application/x-zip-compressed' ? 'zip' : settings.targetFormat
        if (!finalName.toLowerCase().endsWith('.' + ext)) {
          finalName += '.' + ext
        }
      }

      setProcessedBlob(blob)
      setGeneratedFilename(finalName)
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
    setSearchParams({}, { replace: true })
    setProcessedBlob(null)
  }

  const handleBack = () => {
    navigate(-1)
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
        namingSettings={namingSettings}
        setNamingSettings={setNamingSettings}
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
