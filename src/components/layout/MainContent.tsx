import { useSelectedNote } from '@/store'
import { Editor } from '@/components/editor/Editor'
import { FileText } from 'lucide-react'

export function MainContent() {
  const selectedNote = useSelectedNote()

  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-surface-dark">
        <div className="text-center text-neutral-400 dark:text-neutral-500">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No note selected</p>
          <p className="text-sm mt-1">Select a note from the sidebar or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-surface-dark">
      <Editor note={selectedNote} />
    </div>
  )
}
