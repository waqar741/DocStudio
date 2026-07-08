import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

export interface RecentFile {
  id?: number
  type: 'image' | 'pdf'
  filename: string
  data: Blob
  size: number
  createdAt: number
}

interface DocStudioDB extends DBSchema {
  recent_files: {
    key: number
    value: RecentFile
    indexes: { 'by-date': number }
  }
}

const DB_NAME = 'DocStudioDB'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<DocStudioDB>> | null = null

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<DocStudioDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('recent_files', {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('by-date', 'createdAt')
      },
    })
  }
  return dbPromise
}

export const saveRecentFile = async (
  file: Omit<RecentFile, 'id' | 'createdAt'>,
) => {
  const db = await initDB()
  const tx = db.transaction('recent_files', 'readwrite')
  const store = tx.objectStore('recent_files')
  const id = await store.add({
    ...file,
    createdAt: Date.now(),
  })
  await tx.done
  return id
}

export const getRecentFiles = async () => {
  const db = await initDB()
  const tx = db.transaction('recent_files', 'readonly')
  const store = tx.objectStore('recent_files')
  const index = store.index('by-date')
  const files = await index.getAll()
  files.sort((a, b) => b.createdAt - a.createdAt)
  return files
}

export const deleteRecentFile = async (id: number) => {
  const db = await initDB()
  const tx = db.transaction('recent_files', 'readwrite')
  await tx.objectStore('recent_files').delete(id)
  await tx.done
}

export const clearRecentFiles = async () => {
  const db = await initDB()
  const tx = db.transaction('recent_files', 'readwrite')
  await tx.objectStore('recent_files').clear()
  await tx.done
}

export const cleanupExpiredFiles = async (retentionHours: number = 2) => {
  const db = await initDB()
  const tx = db.transaction('recent_files', 'readwrite')
  const store = tx.objectStore('recent_files')
  const index = store.index('by-date')
  const files = await index.getAll()

  const expiryTime = Date.now() - retentionHours * 60 * 60 * 1000

  for (const file of files) {
    if (file.createdAt < expiryTime && file.id) {
      await store.delete(file.id)
    }
  }
  await tx.done
}
