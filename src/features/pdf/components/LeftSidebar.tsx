import { useState } from 'react'
import {
  Minimize2,
  Scissors,
  RotateCw,
  GripHorizontal,
  Trash2,
  FileOutput,
  FilePlus2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { PdfTool } from './UnifiedWorkspace'

interface LeftSidebarProps {
  activeTool: PdfTool
  onToolSelect: (tool: PdfTool) => void
}

export function LeftSidebar({ activeTool, onToolSelect }: LeftSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const tools = [
    { id: 'compress', label: 'Compress PDF', icon: Minimize2 },
    { id: 'split', label: 'Split PDF', icon: Scissors },
    { id: 'rotate', label: 'Rotate Pages', icon: RotateCw },
    { id: 'rearrange', label: 'Rearrange Pages', icon: GripHorizontal },
    { id: 'delete', label: 'Delete Pages', icon: Trash2 },
    { id: 'extract', label: 'Extract Pages', icon: FileOutput },
    { id: 'insert_blank', label: 'Insert Blank', icon: FilePlus2 },
  ] as const

  return (
    <div
      className={`bg-[var(--surface-primary)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-300 relative z-20 shadow-sm ${
        isCollapsed ? 'w-16' : 'w-64'
      } h-full overflow-hidden`}
    >
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between sticky top-0 bg-[var(--surface-primary)] z-10">
        {!isCollapsed && (
          <h2 className="font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wider">
            PDF Tools
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] transition-colors ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id

          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id as PdfTool)}
              title={isCollapsed ? tool.label : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[var(--color-primary-500)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${
                  isActive
                    ? 'text-white'
                    : 'text-[var(--text-secondary)] group-hover:text-[var(--color-primary-500)]'
                } transition-colors`}
              />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium whitespace-nowrap">
                  {tool.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
