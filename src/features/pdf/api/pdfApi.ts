export async function compressPdf(file: File, level: string, filename: string): Promise<Blob> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('level', level)
  formData.append('filename', filename)

  const res = await fetch(${import.meta.env.VITE_API_URL || ''}/api/pdf/compress', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Compression failed')
  return res.blob()
}

export async function splitPdf(file: File, splitType: string, ranges: string, originalName: string): Promise<{ blob: Blob, filename: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('split_type', splitType)
  formData.append('ranges', ranges)
  formData.append('original_name', originalName)

  const res = await fetch(${import.meta.env.VITE_API_URL || ''}/api/pdf/split', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Split failed')
  const contentDisposition = res.headers.get('Content-Disposition')
  let filename = originalName
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/)
    if (match && match[1]) filename = match[1]
  }
  return { blob: await res.blob(), filename }
}

export async function rotatePdf(file: File, rotations: Record<number, number>, filename: string): Promise<Blob> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('rotations_json', JSON.stringify(rotations))
  formData.append('filename', filename)

  const res = await fetch(${import.meta.env.VITE_API_URL || ''}/api/pdf/rotate', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Rotation failed')
  return res.blob()
}

export async function rearrangePdf(file: File, order: number[], filename: string): Promise<Blob> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('order_json', JSON.stringify(order))
  formData.append('filename', filename)

  const res = await fetch(${import.meta.env.VITE_API_URL || ''}/api/pdf/rearrange', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Rearrange failed')
  return res.blob()
}

export async function deletePages(file: File, toDelete: number[], filename: string): Promise<Blob> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('delete_json', JSON.stringify(toDelete))
  formData.append('filename', filename)

  const res = await fetch(${import.meta.env.VITE_API_URL || ''}/api/pdf/delete-pages', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Delete failed')
  return res.blob()
}

export async function extractPages(file: File, ranges: string, originalName: string): Promise<{ blob: Blob, filename: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('ranges', ranges)
  formData.append('original_name', originalName)

  const res = await fetch(${import.meta.env.VITE_API_URL || ''}/api/pdf/extract-pages', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Extract failed')
  const contentDisposition = res.headers.get('Content-Disposition')
  let filename = originalName
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/)
    if (match && match[1]) filename = match[1]
  }
  return { blob: await res.blob(), filename }
}

export async function addBlankPage(file: File, position: number, size: string, filename: string): Promise<Blob> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('position', position.toString())
  formData.append('size', size)
  formData.append('filename', filename)

  const res = await fetch(${import.meta.env.VITE_API_URL || ''}/api/pdf/add-blank-page', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Add blank page failed')
  return res.blob()
}
