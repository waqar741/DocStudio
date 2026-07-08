import { useState, useEffect, useCallback } from 'react'
import {
  getRecentFiles,
  saveRecentFile,
  deleteRecentFile,
  clearRecentFiles,
  cleanupExpiredFiles,
} from '../services/db'
import type { RecentFile } from '../services/db'

export function useRecentFiles(retentionHours: number = 2) {
  const [files, setFiles] = useState<RecentFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      await cleanupExpiredFiles(retentionHours)
      const data = await getRecentFiles()
      setFiles(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load recent files'))
    } finally {
      setIsLoading(false)
    }
  }, [retentionHours])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const addFile = async (file: Omit<RecentFile, 'id' | 'createdAt'>) => {
    try {
      await saveRecentFile(file)
      await loadFiles()
    } catch (err) {
      console.error('Failed to save file', err)
      throw err
    }
  }

  const removeFile = async (id: number) => {
    try {
      await deleteRecentFile(id)
      await loadFiles()
    } catch (err) {
      console.error('Failed to remove file', err)
      throw err
    }
  }

  const clearAll = async () => {
    try {
      await clearRecentFiles()
      await loadFiles()
    } catch (err) {
      console.error('Failed to clear files', err)
      throw err
    }
  }

  return {
    files,
    isLoading,
    error,
    addFile,
    removeFile,
    clearAll,
    refresh: loadFiles,
  }
}
