const DB_NAME = 'docstudio_cache'
const STORE_NAME = 'image_processing'
const DB_VERSION = 1
const CACHE_VERSION = 'v1'

const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours
const MAX_SIZE_BYTES = 100 * 1024 * 1024 // 100 MB

interface CacheEntry {
  id: string
  blob: Blob
  filename: string
  timestamp: number
  size: number
}

// 1. IndexedDB wrapper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

// 2. Hash generation
export async function generateCacheKey(
  file: File,
  params: any,
): Promise<string> {
  // Hash file content
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const fileHash = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  // Serialize parameters
  const paramsStr = JSON.stringify(params)

  // Combine all factors
  const combined = `${CACHE_VERSION}|${fileHash}|${paramsStr}`

  // Hash the combined string to keep the key short
  const encoder = new TextEncoder()
  const combinedBuffer = encoder.encode(combined)
  const finalHashBuffer = await crypto.subtle.digest('SHA-256', combinedBuffer)
  const finalHashArray = Array.from(new Uint8Array(finalHashBuffer))
  return finalHashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// 3. Get entry
export async function getCacheEntry(
  key: string,
): Promise<{ blob: Blob; filename: string } | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(key)

      request.onsuccess = () => {
        const entry = request.result as CacheEntry
        if (!entry) {
          resolve(null)
          return
        }

        // Check TTL
        if (Date.now() - entry.timestamp > MAX_AGE_MS) {
          store.delete(key)
          resolve(null)
          return
        }

        // Update LRU timestamp
        entry.timestamp = Date.now()
        store.put(entry)

        resolve({ blob: entry.blob, filename: entry.filename })
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to get cache entry:', error)
    return null
  }
}

// 4. Set entry
export async function setCacheEntry(
  key: string,
  blob: Blob,
  filename: string,
): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)

      const entry: CacheEntry = {
        id: key,
        blob,
        filename,
        timestamp: Date.now(),
        size: blob.size,
      }

      store.put(entry)

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })

    // Evict old entries in background without blocking the save operation
    evictStaleEntries()
  } catch (error) {
    console.error('Failed to set cache entry:', error)
  }
}

// 5. Eviction (LRU & TTL)
async function evictStaleEntries() {
  try {
    const db = await openDB()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('timestamp')
      const request = index.openCursor()

      let totalSize = 0
      // We only store metadata in the array to avoid loading massive blobs into memory
      const entries: { id: string; timestamp: number; size: number }[] = []

      request.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          entries.push({
            id: cursor.value.id,
            timestamp: cursor.value.timestamp,
            size: cursor.value.size,
          })
          totalSize += cursor.value.size
          cursor.continue()
        } else {
          // Finished collecting, process eviction
          entries.sort((a, b) => a.timestamp - b.timestamp) // oldest first

          const now = Date.now()
          for (const entry of entries) {
            const isExpired = now - entry.timestamp > MAX_AGE_MS
            const isOversized = totalSize > MAX_SIZE_BYTES

            if (isExpired || isOversized) {
              store.delete(entry.id)
              totalSize -= entry.size
            }
          }
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to evict cache entries:', error)
  }
}

export async function clearImageCache(): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.clear()
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (error) {
    console.error('Failed to clear cache:', error)
  }
}
