import { useEffect } from 'react'
import { useStore } from '@/store'

const OWNER_ID = 'local'

export function useKeyboardShortcuts() {
  const {
    createNote,
    toggleSidebar,
    selectedNoteId,
    deleteNote
  } = useStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        createNote(OWNER_ID, { title: 'Untitled' })
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
  }, [createNote, toggleSidebar, selectedNoteId, deleteNote])
}
