import {
  Minimize2,
  Scissors,
  RotateCw,
  GripHorizontal,
  Trash2,
  FileOutput,
  FilePlus2,
  ChevronDown,
} from 'lucide-react'

export type PdfTool =
  | 'compress'
  | 'split'
  | 'rotate'
  | 'rearrange'
  | 'delete'
  | 'extract'
  | 'insert_blank'
  | null

interface LeftSidebarProps {
  activeTool: PdfTool
  onToolSelect: (tool: PdfTool) => void
}

export function LeftSidebar({ activeTool, onToolSelect }: LeftSidebarProps) {
  const tools = [
    { id: 'compress', label: 'Compress PDF', icon: Minimize2 },
    { id: 'split', label: 'Split PDF', icon: Scissors },
    { id: 'rotate', label: 'Rotate Pages', icon: RotateCw },
    { id: 'rearrange', label: 'Rearrange Pages', icon: GripHorizontal },
    { id: 'delete', label: 'Delete Pages', icon: Trash2 },
    { id: 'extract', label: 'Extract Pages', icon: FileOutput },
    { id: 'insert_blank', label: 'Insert Blank', icon: FilePlus2 },
  ] as const

  const activeToolData = tools.find(t => t.id === activeTool) || tools[0]
  const ActiveIcon = activeToolData.icon

  return (
    <>
      {/* Mobile Tool Selector (Dropdown style) */}
      <div className="md:hidden w-full bg-[var(--surface-primary)] border-b border-[var(--border-subtle)] p-4 relative">
        <div className="relative">
          <select
            value={activeTool || 'compress'}
            onChange={(e) => onToolSelect(e.target.value as PdfTool)}
            className="w-full appearance-none bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl px-4 py-3 pl-11 text-sm font-semibold outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]"
          >
            {tools.map((tool) => (
              <option key={tool.id} value={tool.id}>
                {tool.label}
              </option>
            ))}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-primary-500)]">
            <ActiveIcon size={18} strokeWidth={2.5} />
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar Container */}
      <div className="hidden md:flex inset-y-0 left-0 z-10 w-[260px] bg-[var(--surface-primary)] border-r border-[var(--border-subtle)] flex-col h-full shrink-0">
        <div className="h-16 px-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
            PDF Tools
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1.5">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTool === tool.id
                  ? 'bg-[var(--color-primary-500)] text-white shadow-md shadow-blue-500/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tool.icon
                size={18}
                className={activeTool === tool.id ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}
                strokeWidth={2.5}
              />
              {tool.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
