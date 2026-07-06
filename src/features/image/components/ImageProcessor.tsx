import { useState, useEffect, useRef, useMemo } from 'react'
import { DownloadService } from '../../../services/DownloadService'
import { buildImageFilename, processImageBackend } from '../api/imageApi'
import { UnifiedImageWorkspace } from './UnifiedImageWorkspace'
import { useNotificationStore } from '@/store/notificationStore'
import { useDebounce } from '../../../hooks/useDebounce'

export type Area = { x: number; y: number; width: number; height: number; rotate?: number }

export interface OutputSettings {
  resolution: string
  customWidth?: number
  customHeight?: number
  targetKB: string
  customKB?: number
  format: 'jpg' | 'png' | 'webp'
}

export interface NamingSettings {
  filename: string
  documentType: string
}

export interface ProcessingStats {
  originalSize: number
  finalSize: number
  timeMs: number
}

export function ImageProcessor() {
  // State Machine
  const [step, setStep] = useState<1 | 2>(1)
  
  // Shared state
  const [file, setFile] = useState<File | null>(null)
  
  // Crop state
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null)

  // Settings State
  const [outputSettings, setOutputSettings] = useState<OutputSettings>({
    resolution: 'original',
    targetKB: 'none',
    format: 'jpg'
  })

  const [namingSettings, setNamingSettings] = useState<NamingSettings>({
    filename: '',
    documentType: ''
  })

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [generatedFilename, setGeneratedFilename] = useState<string>('')
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null)
  const [isLiveUpdating, setIsLiveUpdating] = useState(false)

  const addToast = useNotificationStore(state => state.addNotification)
  const isFirstRender = useRef(true)

  // Handlers for Step Transitions
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile)
    setStep(2)
  }

  const handleFileReplace = () => {
    setFile(null)
    setStep(1)
    setProcessedBlob(null)
    setProcessingStats(null)
  }

  const handleBack = () => {
    if (step === 2) {
      handleFileReplace()
    }
  }

  // Memoize dependencies for Live Preview
  const processDependencies = useMemo(() => ({
    file,
    pixelCrop,
    outputSettings,
  }), [file, pixelCrop, outputSettings])

  const autoProcessTrigger = useDebounce(processDependencies, 800)

  // The actual processing function (used for both live preview and final commit)
  const executeProcessing = async (isLive: boolean = false) => {
    if (!file) return
    
    const currentCropArea = pixelCrop || { x: 0, y: 0, width: 0, height: 0 }
    
    if (isLive) setIsLiveUpdating(true)
    else setIsProcessing(true)
    
    const startTime = Date.now()
    
    try {
      const { blob, filename } = await processImageBackend(
        file,
        currentCropArea.width > 0 ? currentCropArea : null,
        outputSettings,
        namingSettings
      )
      
      setProcessedBlob(blob)
      setGeneratedFilename(filename)
      
      setProcessingStats({
        originalSize: file.size,
        finalSize: blob.size,
        timeMs: Date.now() - startTime
      })
      
      if (!isLive) {
        addToast('Success', 'Image processed successfully!', 'success')
      }
    } catch (err) {
      console.error(err)
      if (!isLive) addToast('Error', 'Failed to process image', 'error')
    } finally {
      if (isLive) setIsLiveUpdating(false)
      else setIsProcessing(false)
    }
  }

  // Watch Debounced Trigger for Live Preview
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    if (step === 2 && file) {
      executeProcessing(true) // trigger live update silently
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoProcessTrigger, step])

  useEffect(() => {
    if (!file) return
    setGeneratedFilename(buildImageFilename(file, namingSettings, outputSettings.format))
  }, [file, namingSettings, outputSettings.format])

  const handleDownload = () => {
    if (!processedBlob || !generatedFilename) return
    DownloadService.download(processedBlob, generatedFilename)
  }

  return (
    <div className="flex flex-1 w-full min-h-0 bg-[var(--surface-primary)] overflow-hidden">
      <UnifiedImageWorkspace 
        file={file}
        step={step}
        isProcessing={isProcessing}
        isLiveUpdating={isLiveUpdating}
        processedBlob={processedBlob}
        generatedFilename={generatedFilename}
        processingStats={processingStats}
        
        outputSettings={outputSettings}
        setOutputSettings={setOutputSettings}
        namingSettings={namingSettings}
        setNamingSettings={setNamingSettings}
        setPixelCrop={setPixelCrop}
        
        onFileUpload={handleFileUpload}
        onDownload={handleDownload}
        onBack={handleBack}
      />
    </div>
  )
}
