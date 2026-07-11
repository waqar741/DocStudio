import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { DownloadService } from '../../../services/DownloadService'
import { buildImageFilename, processImageBackend } from '../api/imageApi'
import { UnifiedImageWorkspace } from './UnifiedImageWorkspace'
import { useNotificationStore } from '@/store/notificationStore'
import { useDebounce } from '../../../hooks/useDebounce'
import { useRecentFiles } from '../../../hooks/useRecentFiles'
import { useSettingsStore } from '@/store/settingsStore'

export type Area = {
  x: number
  y: number
  width: number
  height: number
  rotate?: number
}

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
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const stepParam = searchParams.get('step')
  const step = stepParam ? (parseInt(stepParam) as 1 | 2) : 1
  
  const setStep = (newStep: 1 | 2, replace = false) => {
    setSearchParams({ step: newStep.toString() }, { replace })
  }

  // Shared state
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (step > 1 && !file) {
      setStep(1, true)
    }
  }, [step, file])

  // Crop state
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null)

  const { defaultImageFormat } = useSettingsStore()

  // Settings State
  const [outputSettings, setOutputSettings] = useState<OutputSettings>({
    resolution: 'original',
    targetKB: 'none',
    format: defaultImageFormat === 'pdf' ? 'jpg' : defaultImageFormat,
  })

  const [namingSettings, setNamingSettings] = useState<NamingSettings>({
    filename: '',
    documentType: '',
  })

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [generatedFilename, setGeneratedFilename] = useState<string>('')
  const [processingStats, setProcessingStats] =
    useState<ProcessingStats | null>(null)
  const [isLiveUpdating, setIsLiveUpdating] = useState(false)

  const addToast = useNotificationStore((state) => state.addNotification)
  const isFirstRender = useRef(true)
  const { addFile } = useRecentFiles()

  // Handlers for Step Transitions
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile)
    setStep(2)
  }

  const handleBack = () => {
    navigate(-1)
  }

  // Memoize dependencies for Live Preview
  const processDependencies = useMemo(
    () => ({
      file,
      pixelCrop,
      outputSettings,
    }),
    [file, pixelCrop, outputSettings],
  )

  const autoProcessTrigger = useDebounce(processDependencies, 800)

  // The actual processing function (used for both live preview and final commit)
  const executeProcessing = async (isLive: boolean = false) => {
    if (!file) return

    // Don't send request immediately if custom is selected but no values entered
    if (
      outputSettings.resolution === 'custom' &&
      !outputSettings.customWidth &&
      !outputSettings.customHeight
    ) {
      return
    }

    if (outputSettings.targetKB === 'custom' && !outputSettings.customKB) {
      return
    }

    // Don't send request if crop is cleared (0x0 area) - wait for user to draw new crop
    if (pixelCrop && pixelCrop.width === 0 && pixelCrop.height === 0) {
      return
    }

    const currentCropArea = pixelCrop || { x: 0, y: 0, width: 0, height: 0 }

    if (isLive) setIsLiveUpdating(true)
    else setIsProcessing(true)

    const startTime = Date.now()

    try {
      const { blob } = await processImageBackend(
        file,
        currentCropArea.width > 0 ? currentCropArea : null,
        outputSettings,
        namingSettings,
      )

      let finalName = namingSettings.filename?.trim()
      if (!finalName) {
        const firstFile = file.name
        const nameWithoutExt = firstFile.substring(0, firstFile.lastIndexOf('.')) || firstFile
        const ext = outputSettings.format || 'jpg'
        let suffix = '_processed'
        if (namingSettings.documentType && namingSettings.documentType !== 'Document') {
           suffix = `_${namingSettings.documentType.toLowerCase().replace(/\s+/g, '_')}`
        }
        finalName = `${nameWithoutExt}${suffix}.${ext}`
      } else {
        const ext = outputSettings.format || 'jpg'
        if (!finalName.toLowerCase().endsWith('.' + ext)) {
          finalName += '.' + ext
        }
      }

      setProcessedBlob(blob)
      setGeneratedFilename(finalName)

      setProcessingStats({
        originalSize: file.size,
        finalSize: blob.size,
        timeMs: Date.now() - startTime,
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
    setGeneratedFilename(
      buildImageFilename(file, namingSettings, outputSettings.format),
    )
  }, [file, namingSettings, outputSettings.format])

  const handleDownload = async () => {
    if (!processedBlob || !generatedFilename) return
    DownloadService.download(processedBlob, generatedFilename)
    
    try {
      await addFile({
        type: 'image',
        filename: generatedFilename,
        data: processedBlob,
        size: processedBlob.size,
      })
    } catch (err) {
      console.error('Failed to save to local DB:', err)
    }
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
