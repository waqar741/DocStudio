import type { MergeSettings, MergeNamingSettings } from '../components/MergeProcessor'

export async function mergeDocumentsBackend(
  files: File[],
  settings: MergeSettings,
  naming: MergeNamingSettings
): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData()

  // Append each file in order.
  files.forEach((file) => {
    formData.append('files', file)
  })

  // Append settings
  formData.append('page_size', settings.pageSize)
  formData.append('orientation', settings.orientation)
  formData.append('margin', settings.margin)
  formData.append('output_format', settings.outputFormat)
  formData.append('image_layout', settings.imageLayout)

  // Append naming
  formData.append('relationship', naming.relationship)
  formData.append('document_type', naming.documentType || 'Merged')
  formData.append('suffix', naming.suffix || '')

  const response = await fetch('/api/merge', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Backend Error: ${errorText}`)
  }

  const blob = await response.blob()

  // Extract filename from headers if possible
  let filename = 'merged_document.pdf'
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
