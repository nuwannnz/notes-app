import { FileText, FolderKanban } from 'lucide-react'
import { cn } from '@/utils'

export type ActiveModule = 'notes' | 'projects'

interface ActivityBarProps {
  activeModule: ActiveModule
  onModuleChange: (module: ActiveModule) => void
}

const modules = [
  { id: 'notes' as const, icon: FileText, label: 'Notes' },
  { id: 'projects' as const, icon: FolderKanban, label: 'Projects' },
]

export function ActivityBar({ activeModule, onModuleChange }: ActivityBarProps) {
  return (
    <div className="flex flex-col items-center w-12 h-full bg-neutral-100 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700">
      <div className="flex flex-col items-center gap-1 pt-2">
        {modules.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onModuleChange(id)}
            title={label}
            className={cn(
              'relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
              activeModule === id
                ? 'bg-white dark:bg-neutral-800 text-primary-500 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}
          >
            <Icon className="h-5 w-5" />
            {activeModule === id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-500 rounded-r" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
