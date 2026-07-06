export async function convertDocumentsBackend(
  files: File[],
  targetFormat: string,
): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('files', file)
  })

  formData.append('target_format', targetFormat)

  const baseUrl = import.meta.env.VITE_API_URL || ''
  const response = await fetch(`${baseUrl}/api/convert`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Backend Error: ${errorText}`)
  }

  const blob = await response.blob()

  let filename = 'converted_file'
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
