import { useEffect, useState, type ReactNode } from 'react'
import { useStore } from '@/store'
import { useKeyboardShortcuts } from '@/hooks'
import { ActivityBar, type ActiveModule } from './ActivityBar'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import { ProjectsView, ProjectDetail } from '@/components/projects'
import { AppContextMenu } from './AppContextMenu'
import { AppModals } from './AppModals'

const OWNER_ID = 'local' // Local user for offline-first

interface AppLayoutProps {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { loadNotes, loadFolders, loadProjects, initializeTheme, selectedProjectId } = useStore()
  const [activeModule, setActiveModule] = useState<ActiveModule>('notes')

  // Register global keyboard shortcuts
  useKeyboardShortcuts()

  useEffect(() => {
    // Initialize theme from local storage
    initializeTheme()

    // Load data
    loadNotes(OWNER_ID)
    loadFolders(OWNER_ID)
    loadProjects(OWNER_ID)
  }, [loadNotes, loadFolders, loadProjects, initializeTheme])

  return (
    <div className="flex h-screen overflow-hidden">
      <ActivityBar activeModule={activeModule} onModuleChange={setActiveModule} />
      {activeModule === 'notes' ? (
        <>
          <Sidebar />
          {children ?? <MainContent />}
        </>
      ) : (
        selectedProjectId ? <ProjectDetail /> : <ProjectsView />
      )}
      <AppContextMenu />
      <AppModals />
    </div>
  )
}
