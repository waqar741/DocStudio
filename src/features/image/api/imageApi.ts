import type { Area, OutputSettings, NamingSettings } from '../components/ImageProcessor'

export function buildImageFilename(
  file: File | null,
  namingSettings: NamingSettings,
  format: OutputSettings['format'],
): string {
  const baseName = file?.name ? file.name.split('.').slice(0, -1).join('.') : 'image'
  const customName = namingSettings.filename.trim() || baseName
  const documentType = namingSettings.documentType.trim()
  const combined = `${customName}${documentType}`
    .replace(/[\s\-]+/g, '')
    .replace(/[^A-Za-z0-9_]/g, '')

  const extension = format === 'jpg' ? 'jpeg' : format
  return `${combined || 'image'}.${extension}`
}

export async function processImageBackend(
  file: File,
  cropArea: Area | null,
  outputSettings: OutputSettings,
  namingSettings: NamingSettings
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
  formData.append('relationship', '')
  formData.append('document_type', namingSettings.documentType.trim())
  
  const baseName = file.name ? file.name.split('.').slice(0, -1).join('.') : 'image'
  formData.append('suffix', namingSettings.filename || baseName)

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

  const filename = buildImageFilename(file, namingSettings, outputSettings.format)

  return { blob, filename }
}
