import { useEffect, useState, type ReactNode } from 'react'
import { useStore } from '@/store'
import { useKeyboardShortcuts } from '@/hooks'
import { useAuth } from '@/features/auth/AuthContext'
import { syncEngine } from '@/services/sync/SyncEngine'
import { ActivityBar, type ActiveModule } from './ActivityBar'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import { ProjectsView, ProjectDetail } from '@/components/projects'
import { AppContextMenu } from './AppContextMenu'
import { AppModals } from './AppModals'

interface AppLayoutProps {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { loadNotes, loadFolders, loadProjects, initializeTheme, selectedProjectId } = useStore()
  const { user } = useAuth()
  const [activeModule, setActiveModule] = useState<ActiveModule>('notes')

  // Register global keyboard shortcuts
  useKeyboardShortcuts()

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  useEffect(() => {
    if (!user) return
    const ownerId = user.userId
    loadNotes(ownerId)
    loadFolders(ownerId)
    loadProjects(ownerId)
    // Pull from cloud after sign-in
    syncEngine.pullAll(ownerId).catch(console.error)
  }, [user, loadNotes, loadFolders, loadProjects])

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
