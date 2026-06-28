import type { Area, OutputSettings, NamingSettings } from '../components/ImageProcessor'

export async function processImageBackend(
  file: File,
  cropArea: Area | null,
  outputSettings: OutputSettings,
  namingSettings: NamingSettings,
  selectedType: string
): Promise<{ blob: Blob; filename: string }> {
  
  const formData = new FormData()
  formData.append('image', file)

  // Crop
  if (cropArea) {
    formData.append('crop_x', Math.round(cropArea.x).toString())
    formData.append('crop_y', Math.round(cropArea.y).toString())
    formData.append('crop_width', Math.round(cropArea.width).toString())
    formData.append('crop_height', Math.round(cropArea.height).toString())
    formData.append('rotate', (cropArea.rotate || 0).toString())
  }

  // Settings
  formData.append('resolution', outputSettings.resolution)
  if (outputSettings.customWidth) formData.append('custom_width', outputSettings.customWidth.toString())
  if (outputSettings.customHeight) formData.append('custom_height', outputSettings.customHeight.toString())
  
  formData.append('target_kb', outputSettings.targetKB)
  if (outputSettings.customKB) formData.append('custom_kb', outputSettings.customKB.toString())
  
  formData.append('format', outputSettings.format)

  // Naming
  formData.append('relationship', namingSettings.relationship)
  formData.append('document_type', selectedType)
  formData.append('suffix', namingSettings.suffix)

  const baseUrl = import.meta.env.VITE_API_URL || ''
  const response = await fetch(`${baseUrl}/api/process-image`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Backend Error: ${errorText}`)
  }

  const blob = await response.blob()
  
  // Extract filename from Content-Disposition header
  let filename = 'processed_image'
  const disposition = response.headers.get('Content-Disposition')
  if (disposition && disposition.includes('filename="')) {
    const match = disposition.match(/filename="?([^"]+)"?/)
    if (match && match.length === 2 && match[1]) {
      filename = match[1]
    }
  } else if (disposition && disposition.includes('filename=')) {
      const parts = disposition.split('filename=')
      if (parts.length > 1 && parts[1]) {
        filename = parts[1].replace(/"/g, '')
      }
  }

  return { blob, filename }
}
