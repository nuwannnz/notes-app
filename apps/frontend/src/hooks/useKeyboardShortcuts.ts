import { useEffect } from 'react'
import { useStore } from '@/store'
import { useAuth } from '@/features/auth/AuthContext'

export function useKeyboardShortcuts() {
  const {
    createNote,
    toggleSidebar,
    selectedNoteId,
    deleteNote
  } = useStore()
  const { user } = useAuth()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!user) return

      // Ctrl/Cmd + N: New note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        createNote(user.userId, { title: 'Untitled' })
      }

      // Ctrl/Cmd + B: Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }

      // Ctrl/Cmd + Backspace: Delete note (when not in editor)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
        const activeElement = document.activeElement
        const isInEditor = activeElement?.closest('.ProseMirror') ||
                          activeElement?.tagName === 'INPUT' ||
                          activeElement?.tagName === 'TEXTAREA'

        if (!isInEditor && selectedNoteId) {
          e.preventDefault()
          deleteNote(selectedNoteId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [createNote, toggleSidebar, selectedNoteId, deleteNote, user])
}
