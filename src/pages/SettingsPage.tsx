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
  Search,
  Calendar,
  X,
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
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'image'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')

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

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = [...files]

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(file => file.type === filterType)
    }

    // Search by filename
    if (searchQuery) {
      result = result.filter(file =>
        file.filename.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.filename.localeCompare(b.filename)
        case 'size':
          return b.size - a.size
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [files, filterType, searchQuery, sortBy])

  const handleDownload = (file: RecentFile) => {
    DownloadService.download(file.data, file.filename)
  }

  const formatDate = (dateValue: string | number) => {
    const date = new Date(dateValue)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 overflow-y-auto h-full custom-scrollbar">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
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
        </div>

        {/* Privacy Banner - Improved */}
        <div className="rounded-xl border border-green-200 dark:border-green-800/30 bg-green-50/80 dark:bg-green-900/10 p-3 md:p-4 shadow-sm flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <ShieldCheck className="text-green-600 dark:text-green-400" size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Your Privacy is Protected
            </p>
            <p className="text-xs text-green-700 dark:text-green-400/80 mt-0.5">
              All processing is performed strictly on your local device. Your files are never uploaded to any server.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3 md:grid-cols-2">
        {/* App Preferences Card */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] dark:bg-[var(--surface-primary)] p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-6 flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10">
              <Sliders size={20} className="text-[var(--color-primary-500)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">App Preferences</h3>
              <p className="text-xs text-[var(--text-secondary)]">Visual and behavior settings</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Palette size={16} className="text-[var(--text-secondary)]" />
                Theme Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['system', 'light', 'dark'] as const).map((themeMode) => (
                  <button
                    key={themeMode}
                    onClick={() => setMode(themeMode)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${mode === themeMode
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10 text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--color-primary-300)] bg-[var(--surface-secondary)] dark:bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
                      }`}
                  >
                    {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tool Defaults Card */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] dark:bg-[var(--surface-primary)] p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-6 flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10">
              <Wrench size={20} className="text-[var(--color-primary-500)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Tool Defaults</h3>
              <p className="text-xs text-[var(--text-secondary)]">Default conversion settings</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <FileText size={16} className="text-[var(--text-secondary)]" />
                Default PDF Compression
              </label>
              <select
                value={defaultPdfCompression}
                onChange={(e) => setDefaultPdfCompression(e.target.value as any)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] dark:bg-[var(--surface-secondary)] p-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 text-[var(--text-primary)] dark:text-[var(--text-primary)]"
              >
                <option value="Less">Less Compression (High Quality)</option>
                <option value="Recommended">Recommended (Good Quality & Size)</option>
                <option value="Extreme">Extreme Compression (Smallest Size)</option>
              </select>
              <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-[var(--color-primary-500)]"></span>
                Pre-selected when compressing PDFs
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <ImageIcon size={16} className="text-[var(--text-secondary)]" />
                Default Image Format
              </label>
              <select
                value={defaultImageFormat}
                onChange={(e) => setDefaultImageFormat(e.target.value as any)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] dark:bg-[var(--surface-secondary)] p-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 text-[var(--text-primary)] dark:text-[var(--text-primary)]"
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="jpg">JPEG Image (.jpg)</option>
                <option value="png">PNG Image (.png)</option>
                <option value="webp">WEBP Image (.webp)</option>
              </select>
              <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-[var(--color-primary-500)]"></span>
                Default target format for image conversions
              </p>
            </div>
          </div>
        </div>

        {/* Storage Card */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] dark:bg-[var(--surface-primary)] p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="mb-6 flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10">
              <Database size={20} className="text-[var(--color-primary-500)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text-primary)]">Local Storage</h3>
              <p className="text-xs text-[var(--text-secondary)]">Browser cache management</p>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]">
              {formatBytes(totalSize)}
            </span>
          </div>

          <p className="mb-5 text-sm text-[var(--text-secondary)] leading-relaxed">
            Recently processed files are temporarily saved in your browser's local database for quick re-download access.
          </p>

          <div className="mb-5 bg-[var(--surface-secondary)] dark:bg-[var(--surface-secondary)] p-3 rounded-lg border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
              <Clock size={16} className="text-[var(--text-secondary)]" />
              Auto-delete after
            </label>
            <select
              value={retentionHours}
              onChange={(e) => setRetentionHours(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] dark:bg-[var(--surface-primary)] p-2 text-sm outline-none text-[var(--text-primary)] dark:text-[var(--text-primary)] font-medium"
            >
              <option value={1}>1 Hour</option>
              <option value={2}>2 Hours</option>
              <option value={12}>12 Hours</option>
              <option value={24}>24 Hours</option>
            </select>
          </div>

          <button
            onClick={() => setClearAllConfirmOpen(true)}
            disabled={files.length === 0}
            className="flex w-full mt-auto items-center justify-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 py-2.5 font-medium text-red-600 dark:text-red-400 transition-all hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Trash2 size={18} />
            Clear All History ({files.length} files)
          </button>
        </div>
      </div>

      {/* Recent Files Section */}
      <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] dark:bg-[var(--surface-primary)] shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="p-5 md:p-6 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 dark:bg-[var(--surface-secondary)]/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10">
                <HardDrive size={20} className="text-[var(--color-primary-500)]" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Recent Files</h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} found
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            {files.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search Input */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 py-2 w-full sm:w-48 rounded-lg border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] bg-[var(--surface-primary)] dark:bg-[var(--surface-primary)] text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--surface-secondary)] dark:hover:bg-[var(--surface-secondary)]"
                    >
                      <X size={14} className="text-[var(--text-secondary)]" />
                    </button>
                  )}
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-1 bg-[var(--surface-secondary)] dark:bg-[var(--surface-secondary)] p-1 rounded-lg">
                  {(['all', 'pdf', 'image'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === type
                          ? 'bg-[var(--surface-primary)] dark:bg-[var(--surface-primary)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] bg-[var(--surface-primary)] dark:bg-[var(--surface-primary)] text-xs font-medium text-[var(--text-primary)] dark:text-[var(--text-primary)] outline-none"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Files Grid */}
        <div className="p-5 md:p-6 min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-[var(--text-secondary)]">Loading files...</p>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-secondary)] dark:bg-[var(--surface-secondary)] mb-4">
                {searchQuery ? (
                  <Search size={32} className="text-[var(--text-secondary)] opacity-40" />
                ) : (
                  <HardDrive size={32} className="text-[var(--text-secondary)] opacity-40" />
                )}
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {searchQuery ? 'No matching files found' : 'No recent files'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {searchQuery ? 'Try a different search term' : 'Processed files will appear here'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group flex items-center justify-between rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-3 transition-all hover:border-[var(--color-primary-300)] dark:hover:border-[var(--color-primary-600)] hover:shadow-md bg-[var(--surface-primary)] dark:bg-[var(--surface-primary)]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
                      {file.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                    </div>
                    <div className="overflow-hidden">
                      <p
                        className="truncate text-sm font-medium text-[var(--text-primary)] dark:text-[var(--text-primary)]"
                        title={file.filename}
                      >
                        {file.filename}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
                        <span className="font-medium">{formatBytes(file.size)}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-[var(--text-secondary)]"></span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDate(file.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Preview file"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      className="rounded-lg p-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-500)]/10 transition-colors"
                      title="Download file"
                    >
                      <DownloadCloud size={16} />
                    </button>
                    <button
                      onClick={() => file.id && setDeleteFileConfirmId(file.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete file"
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

      {/* Dialogs */}
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
          <div className="h-[80vh] w-full flex flex-col bg-[var(--surface-primary)] dark:bg-[var(--surface-primary)]">
            <div className="p-4 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)] flex justify-between items-center bg-[var(--surface-secondary)] dark:bg-[var(--surface-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
                  {previewFile.type === 'pdf' ? <FileText size={16} /> : <ImageIcon size={16} />}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)] text-sm">{previewFile.filename}</h3>
                  <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">{formatBytes(previewFile.size)}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleDownload(previewFile)}>
                <DownloadCloud size={16} className="mr-2" /> Download
              </Button>
            </div>
            <div className="flex-1 w-full bg-[var(--surface-secondary)] dark:bg-[var(--surface-secondary)] min-h-0 relative p-4">
              {previewFile.type === 'pdf' ? (
                <iframe src={URL.createObjectURL(previewFile.data)} className="w-full h-full border rounded-lg border-[var(--border-subtle)] dark:border-[var(--border-subtle)] bg-white" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img src={URL.createObjectURL(previewFile.data)} className="max-w-full max-h-full object-contain drop-shadow-md" alt={previewFile.filename} />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}