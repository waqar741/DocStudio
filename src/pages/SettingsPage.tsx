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
} from 'lucide-react'
import { useRecentFiles } from '@/hooks/useRecentFiles'
import type { RecentFile } from '@/services/db'
import { DownloadService } from '@/services/DownloadService'

export function SettingsPage() {
  const [retentionHours, setRetentionHours] = useState(2)
  const { files, isLoading, removeFile, clearAll } =
    useRecentFiles(retentionHours)

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
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage application preferences and local storage
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Storage Card */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
              <Database size={20} className="text-[var(--color-primary-500)]" />
              Local Storage
            </div>
            <span className="rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-medium text-[var(--color-primary-700)]">
              {formatBytes(totalSize)} Used
            </span>
          </div>

          <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Recently processed files are temporarily saved in your browser's local database. 
            This allows you to re-download them if you accidentally closed the page.
          </p>

          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                <Clock size={16} />
                Retention Period
              </label>
              <select
                value={retentionHours}
                onChange={(e) => setRetentionHours(Number(e.target.value))}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1.5 text-sm outline-none transition-colors focus:border-[var(--color-primary-500)]"
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
              </select>
            </div>
          </div>

          <button
            onClick={clearAll}
            disabled={files.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 size={18} />
            Clear All History
          </button>
        </div>

        {/* Recent Files List */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm flex flex-col h-[500px]">
          <div className="mb-4 flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
            <HardDrive size={20} className="text-[var(--color-primary-500)]" />
            Recent Files ({files.length})
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
                Loading...
              </div>
            ) : files.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-[var(--text-secondary)]">
                <HardDrive size={48} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">No recent files</p>
                <p className="text-xs">Processed files will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3 transition-colors hover:bg-[var(--surface-secondary)]"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
                        {file.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                      </div>
                      <div className="overflow-hidden">
                        <p
                          className="truncate text-sm font-medium"
                          style={{ color: 'var(--text-primary)' }}
                          title={file.filename}
                        >
                          {file.filename}
                        </p>
                        <div className="flex gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span>{formatBytes(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 ml-2">
                      <button
                        onClick={() => window.open(URL.createObjectURL(file.data), '_blank')}
                        className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 transition-colors"
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
                        onClick={() => file.id && removeFile(file.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition-colors"
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
      </div>
    </div>
  )
}
