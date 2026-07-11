import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { FileText, FileImage } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

interface FileThumbnailProps {
  file: File | Blob
  className?: string
  fallbackSize?: number
}

export function FileThumbnail({ file, className = "", fallbackSize = 20 }: FileThumbnailProps) {
  const [url, setUrl] = useState<string>('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (file.type === 'application/pdf') {
    return (
      <div className={`overflow-hidden bg-white flex items-center justify-center ${className}`}>
        {url && !error ? (
          <Document
            file={url}
            onLoadError={() => setError(true)}
            loading={
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                <FileText size={fallbackSize} />
              </div>
            }
          >
            <Page
              pageNumber={1}
              width={150} // Rough width, container will crop/scale it
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="max-w-full"
            />
          </Document>
        ) : (
          <FileText size={fallbackSize} className="text-red-500" />
        )}
      </div>
    )
  }

  if (file.type.startsWith('image/')) {
    return (
      <div className={`overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
        {url && !error ? (
          <img
            src={url}
            alt={'name' in file ? file.name : 'Image'}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
          />
        ) : (
          <FileImage size={fallbackSize} className="text-blue-500" />
        )}
      </div>
    )
  }

  // Fallback for unknown types
  return (
    <div className={`overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
      <FileText size={fallbackSize} className="text-gray-500" />
    </div>
  )
}
