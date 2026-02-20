import { useEffect, type ReactNode } from 'react'
import { useStore } from '@/store'
import { useKeyboardShortcuts } from '@/hooks'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import { AppContextMenu } from './AppContextMenu'
import { AppModals } from './AppModals'

const OWNER_ID = 'local' // Local user for offline-first

interface AppLayoutProps {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { loadNotes, loadFolders, initializeTheme } = useStore()

  // Register global keyboard shortcuts
  useKeyboardShortcuts()

  useEffect(() => {
    // Initialize theme from local storage
    initializeTheme()

    // Load data
    loadNotes(OWNER_ID)
    loadFolders(OWNER_ID)
  }, [loadNotes, loadFolders, initializeTheme])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {children ?? <MainContent />}
      <AppContextMenu />
      <AppModals />
    </div>
  )
}
