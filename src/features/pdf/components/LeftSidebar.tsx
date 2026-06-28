import { 
  Minimize2, Scissors, RotateCw, GripHorizontal, 
  Trash2, FileOutput, FilePlus2 
} from 'lucide-react'

export type PdfTool = 
  | 'compress' | 'split' | 'rotate' | 'rearrange' 
  | 'delete' | 'extract' | 'insert_blank' | null

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
    { id: 'insert_blank', label: 'Insert Blank Page', icon: FilePlus2 },
  ] as const

  return (
    <div className="w-[220px] min-w-[220px] bg-[var(--surface-primary)] border-r border-[var(--border-secondary)] flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-[var(--border-secondary)]">
        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">PDF Tools</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTool === tool.id 
                ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-100)]' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <tool.icon className={`w-4 h-4 ${activeTool === tool.id ? 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]' : 'text-[var(--text-tertiary)]'}`} />
            {tool.label}
          </button>
        ))}
      </div>
    </div>
  )
}
