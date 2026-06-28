import { useState, useRef, useEffect, useMemo } from 'react'
import Cropper, { type ReactCropperElement } from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import { Button } from '@/components/ui'
import { RotateCw, ZoomIn, ZoomOut, RefreshCw, Move } from 'lucide-react'
import type { Area, OutputSettings } from '../ImageProcessor'

export interface CropWorkspaceProps {
  file: File
  outputSettings: OutputSettings
  setPixelCrop: (crop: Area) => void
}

export function CropWorkspace({
  file,
  outputSettings,
  setPixelCrop,
}: CropWorkspaceProps) {
  const [fileUrl, setFileUrl] = useState<string>('')
  const cropperRef = useRef<ReactCropperElement>(null)
  
  // Manage object URL lifecycle safely (Strict Mode compatible)
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setFileUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  // Calculate Aspect Ratio based on output resolution
  const aspectRatio = useMemo(() => {
    if (outputSettings.resolution === 'custom') {
      if (outputSettings.customWidth && outputSettings.customHeight) {
        return outputSettings.customWidth / outputSettings.customHeight
      }
    } else if (outputSettings.resolution !== 'original') {
      const parts = outputSettings.resolution.split('x')
      if (parts.length === 2) {
        return Number(parts[0]) / Number(parts[1])
      }
    }
    return NaN // Free crop
  }, [outputSettings.resolution, outputSettings.customWidth, outputSettings.customHeight])

  // Handle data updates
  const handleCropChange = () => {
    const cropper = cropperRef.current?.cropper
    if (cropper) {
      const data = cropper.getData() // x, y, width, height, rotate, scaleX, scaleY
      setPixelCrop({
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        rotate: data.rotate
      })
    }
  }

  // Toolbar actions
  const handleZoom = (ratio: number) => {
    cropperRef.current?.cropper.zoom(ratio)
  }
  
  const handleRotate = () => {
    cropperRef.current?.cropper.rotate(90)
  }
  
  const handleReset = () => {
    cropperRef.current?.cropper.reset()
  }
  
  const setDragMode = (mode: 'crop' | 'move') => {
    cropperRef.current?.cropper.setDragMode(mode)
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-x border-[var(--border-secondary)] flex-1 min-w-0 shadow-inner">
      
      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4">
        <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-md ring-1 ring-white/5 overflow-hidden">
          {fileUrl && (
            <Cropper
              src={fileUrl}
              style={{ height: '100%', width: '100%' }}
              aspectRatio={aspectRatio}
              guides={true}
              viewMode={1}
              dragMode="crop"
              background={false}
              responsive={true}
              autoCropArea={0.8}
              checkOrientation={false}
              cropend={handleCropChange}
              zoom={handleCropChange}
              ready={handleCropChange}
              ref={cropperRef}
            />
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-12 bg-[#252526] border-t border-[#3e3e42] flex items-center justify-between px-4 shrink-0">
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleZoom(-0.1)}
            className="text-slate-300 hover:text-white hover:bg-white/10 px-2 h-8"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleZoom(0.1)}
            className="text-slate-300 hover:text-white hover:bg-white/10 px-2 h-8"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-4 bg-slate-700 mx-1"></div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDragMode('move')}
            className="text-slate-300 hover:text-white hover:bg-white/10 px-2 h-8"
            title="Pan Mode"
          >
            <Move className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRotate}
            leftIcon={<RotateCw className="w-3 h-3" />}
            className="text-slate-300 hover:text-white hover:bg-white/10 text-xs px-2 h-8"
          >
            Rotate
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleReset}
            leftIcon={<RefreshCw className="w-3 h-3" />}
            className="text-slate-300 hover:text-white hover:bg-white/10 text-xs px-2 h-8"
          >
            Reset
          </Button>
        </div>

      </div>
    </div>
  )
}
