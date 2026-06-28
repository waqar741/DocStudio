export class DownloadService {
  /**
   * Executes a robust, synchronous download of a Blob.
   * Tracks telemetry in development mode.
   */
  static async download(blob: Blob, filename: string): Promise<void> {
    if (!blob || !filename) {
      console.error('[DownloadService] Missing blob or filename')
      return
    }

    // Attempt to use the modern File System Access API if available
    // This bypasses iframe sandbox limitations on the 'download' attribute
    if ('showSaveFilePicker' in window) {
      try {
        const opts = {
          suggestedName: filename,
        }
        const handle = await (window as any).showSaveFilePicker(opts)
        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()
        return // Successfully saved
      } catch (err: any) {
        // If user cancelled, just abort. Otherwise, fallback to the <a> tag method
        if (err.name === 'AbortError') return
        console.warn('[DownloadService] File System API failed, falling back to <a> tag', err)
      }
    }

    // Fallback: standard <a> tag approach
    const objectUrl = URL.createObjectURL(blob)

    // Synchronous native DOM injection to ensure Chrome considers it a trusted event
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = objectUrl
    a.setAttribute('download', filename) // using setAttribute is slightly more robust

    // Append, Click, Remove in exact same tick
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Revoke async to ensure download starts before memory is cleared
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl)
    }, 1000)
  }
}
