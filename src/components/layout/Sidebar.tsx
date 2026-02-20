import { useCallback, useRef, useEffect } from 'react'
import { PanelLeftClose, PanelLeft, Plus, Search, Settings, Moon, Sun } from 'lucide-react'
import { useStore } from '@/store'
import { IconButton, Input } from '@/components/ui'
import { TreeView } from '@/components/tree/TreeView'
import { cn } from '@/utils'

const OWNER_ID = 'local' // Local user for offline-first

export function Sidebar() {
  const {
    sidebarWidth,
    isSidebarCollapsed,
    isSidebarResizing,
    setSidebarWidth,
    toggleSidebar,
    setSidebarResizing,
    searchQuery,
    setSearchQuery,
    createNote,
    createFolder,
    themeMode,
    setThemeMode,
    isDark,
    openModal
  } = useStore()

  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isSidebarResizing) {
        setSidebarWidth(e.clientX)
      }
    },
    [isSidebarResizing, setSidebarWidth]
  )

  const handleMouseUp = useCallback(() => {
    setSidebarResizing(false)
  }, [setSidebarResizing])

  useEffect(() => {
    if (isSidebarResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isSidebarResizing, handleMouseMove, handleMouseUp])

  const handleResizeStart = () => {
    setSidebarResizing(true)
  }

  const handleCreateNote = async () => {
    await createNote(OWNER_ID, { title: 'Untitled' })
  }

  const handleCreateFolder = async () => {
    await createFolder(OWNER_ID, { name: 'New Folder' })
  }

  const toggleTheme = () => {
    const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(themeMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setThemeMode(modes[nextIndex])
  }

  if (isSidebarCollapsed) {
    return (
      <div className="flex flex-col items-center py-2 px-1 bg-sidebar-light dark:bg-sidebar-dark border-r border-neutral-200 dark:border-neutral-700">
        <IconButton onClick={toggleSidebar} title="Expand sidebar">
          <PanelLeft className="h-5 w-5" />
        </IconButton>
      </div>
    )
  }

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'relative flex flex-col h-full bg-sidebar-light dark:bg-sidebar-dark',
        'border-r border-neutral-200 dark:border-neutral-700',
        isSidebarResizing && 'select-none'
      )}
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-neutral-200 dark:border-neutral-700">
        <span className="font-semibold text-sm px-2">Notes</span>
        <div className="flex items-center gap-1">
          <IconButton onClick={handleCreateNote} title="New note" size="sm">
            <Plus className="h-4 w-4" />
          </IconButton>
          <IconButton onClick={toggleSidebar} title="Collapse sidebar" size="sm">
            <PanelLeftClose className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto px-2">
        <TreeView />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-2 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-1">
          <IconButton onClick={handleCreateFolder} title="New folder" size="sm">
            <Plus className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="flex items-center gap-1">
          <IconButton onClick={toggleTheme} title={`Theme: ${themeMode}`} size="sm">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </IconButton>
          <IconButton onClick={() => openModal('settings')} title="Settings" size="sm">
            <Settings className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {/* Resize handle */}
      <div
        ref={resizeRef}
        onMouseDown={handleResizeStart}
        className={cn(
          'absolute top-0 right-0 w-1 h-full cursor-col-resize',
          'hover:bg-primary-500/50 active:bg-primary-500',
          'transition-colors duration-150',
          isSidebarResizing && 'bg-primary-500'
        )}
      />
    </div>
  )
}
