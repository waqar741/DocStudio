import { useState, useMemo } from 'react'
import {
  Settings,
  Database,
  Trash2,
  Clock,
  HardDrive,
  FileText,
  ImageIcon,
  Eye,
  Sliders,
  ShieldCheck,
  Palette,
  DownloadCloud,
  Wrench,
} from 'lucide-react'
import { ConfirmationDialog, Modal, Button } from '@/components/ui'
import { useRecentFiles } from '@/hooks/useRecentFiles'
import type { RecentFile } from '@/services/db'
import { DownloadService } from '@/services/DownloadService'
import { useSettingsStore } from '@/store/settingsStore'
import { useThemeStore } from '@/store/themeStore'

export function SettingsPage() {
  const [retentionHours, setRetentionHours] = useState(2)
  const { files, isLoading, removeFile, clearAll } = useRecentFiles(retentionHours)
  
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false)
  const [deleteFileConfirmId, setDeleteFileConfirmId] = useState<number | null>(null)
  const [previewFile, setPreviewFile] = useState<RecentFile | null>(null)

  const { mode, setMode } = useThemeStore()
  const {
    defaultPdfCompression,
    defaultImageFormat,
    setDefaultPdfCompression,
    setDefaultImageFormat
  } = useSettingsStore()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalSize = useMemo(() => {
    return files.reduce((acc, file) => acc + file.size, 0)
  }, [files])

  const handleDownload = (file: RecentFile) => {
    DownloadService.download(file.data, file.filename)
  }

  return (
    <div className="mx-auto max-w-7xl p-6 overflow-y-auto h-full custom-scrollbar">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Settings & Preferences
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage application preferences, tool defaults, and local storage
          </p>
        </div>
      </div>

      {/* Privacy Banner */}
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800/30 p-4 shadow-sm flex items-center gap-3">
        <ShieldCheck className="text-green-600 shrink-0" size={20} />
        <div>
          <p className="text-sm text-green-800 dark:text-green-400">
            <strong>Privacy Guarantee:</strong> All processing is performed strictly on your local device. Your files are never uploaded.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
        {/* App Preferences */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <Sliders size={20} className="text-[var(--color-primary-500)]" />
            App Preferences
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Palette size={16} />
                Theme Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
              >
                <option value="system">System Default</option>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tool Defaults */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <Wrench size={20} className="text-[var(--color-primary-500)]" />
            Tool Defaults
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <FileText size={16} />
                Default PDF Compression
              </label>
              <select
                value={defaultPdfCompression}
                onChange={(e) => setDefaultPdfCompression(e.target.value as any)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
              >
                <option value="Less">Less Compression (High Quality)</option>
                <option value="Recommended">Recommended (Good Quality & Size)</option>
                <option value="Extreme">Extreme Compression (Smallest Size)</option>
              </select>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">This will be selected by default when compressing PDFs.</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <ImageIcon size={16} />
                Default Image Format
              </label>
              <select
                value={defaultImageFormat}
                onChange={(e) => setDefaultImageFormat(e.target.value as any)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="jpg">JPEG Image (.jpg)</option>
                <option value="png">PNG Image (.png)</option>
                <option value="webp">WEBP Image (.webp)</option>
              </select>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">Default target format for image conversions.</p>
            </div>
          </div>
        </div>

        {/* Storage Card */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
              <Database size={20} className="text-[var(--color-primary-500)]" />
              Local Storage
            </div>
            <span className="rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-medium text-[var(--color-primary-700)]">
              {formatBytes(totalSize)} Used
            </span>
          </div>

          <p className="mb-6 text-sm text-[var(--text-secondary)]">
            Recently processed files are temporarily saved in your browser's local database. 
            This allows you to re-download them if you accidentally closed the page.
          </p>

          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between bg-[var(--surface-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Clock size={16} />
                Retention
              </label>
              <select
                value={retentionHours}
                onChange={(e) => setRetentionHours(Number(e.target.value))}
                className="rounded-lg border border-[var(--border-subtle)] bg-transparent p-1 text-sm outline-none text-[var(--text-primary)] font-bold"
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setClearAllConfirmOpen(true)}
            disabled={files.length === 0}
            className="flex w-full mt-auto items-center justify-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 size={18} />
            Clear All History
          </button>
        </div>
      </div>

      {/* Recent Files List - Spans Full Width */}
      <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm flex flex-col min-h-[400px]">
        <div className="mb-4 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <HardDrive size={20} className="text-[var(--color-primary-500)]" />
          Recent Files ({files.length})
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
              Loading...
            </div>
          ) : files.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[var(--text-secondary)] py-12">
              <HardDrive size={48} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">No recent files</p>
              <p className="text-xs">Processed files will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3 transition-colors hover:bg-[var(--surface-secondary)]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
                      {file.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                    </div>
                    <div className="overflow-hidden">
                      <p
                        className="truncate text-sm font-medium text-[var(--text-primary)]"
                        title={file.filename}
                      >
                        {file.filename}
                      </p>
                      <div className="flex gap-2 text-[10px] text-[var(--text-secondary)]">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 ml-2">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      className="rounded-lg p-2 text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] transition-colors"
                      title="Download"
                    >
                      <HardDrive size={16} />
                    </button>
                    <button
                      onClick={() => file.id && setDeleteFileConfirmId(file.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={clearAllConfirmOpen}
        onClose={() => setClearAllConfirmOpen(false)}
        onConfirm={() => {
          clearAll()
          setClearAllConfirmOpen(false)
        }}
        title="Clear All History?"
        description="Are you sure you want to permanently delete all processed files from local storage? This cannot be undone."
        confirmText="Clear All"
        isDestructive
      />

      <ConfirmationDialog
        isOpen={!!deleteFileConfirmId}
        onClose={() => setDeleteFileConfirmId(null)}
        onConfirm={() => {
          if (deleteFileConfirmId) removeFile(deleteFileConfirmId)
          setDeleteFileConfirmId(null)
        }}
        title="Delete File?"
        description="Are you sure you want to delete this file from local storage? This cannot be undone."
        confirmText="Delete"
        isDestructive
      />

      <Modal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} maxWidth="4xl">
        {previewFile && (
          <div className="h-[80vh] w-full flex flex-col bg-[var(--surface-primary)]">
            <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--surface-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
                  {previewFile.type === 'pdf' ? <FileText size={16} /> : <ImageIcon size={16} />}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">{previewFile.filename}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{formatBytes(previewFile.size)}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleDownload(previewFile)}>
                <DownloadCloud size={16} className="mr-2" /> Download
              </Button>
            </div>
            <div className="flex-1 w-full bg-[var(--surface-secondary)] min-h-0 relative p-4">
              {previewFile.type === 'pdf' ? (
                <iframe src={URL.createObjectURL(previewFile.data)} className="w-full h-full border rounded-lg border-[var(--border-subtle)] bg-white" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img src={URL.createObjectURL(previewFile.data)} className="max-w-full max-h-full object-contain drop-shadow-md" />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
