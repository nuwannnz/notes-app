import { useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useStore } from '@/store'
import { debounce } from '@/utils'
import { EditorToolbar } from './EditorToolbar'
import type { Note } from '@/core/entities'

interface EditorProps {
  note: Note
}

const AUTOSAVE_DELAY = 1000 // 1 second

export function Editor({ note }: EditorProps) {
  const {
    setEditor,
    setSaving,
    setLastSavedAt,
    setHasUnsavedChanges,
    updateNote
  } = useStore()

  const titleRef = useRef<HTMLInputElement>(null)
  const initialContentRef = useRef(note.content)

  // Debounced save function
  const saveContent = useCallback(
    debounce(async (content: string) => {
      setSaving(true)
      try {
        await updateNote(note.id, { content })
        setLastSavedAt(Date.now())
      } finally {
        setSaving(false)
      }
    }, AUTOSAVE_DELAY),
    [note.id, updateNote, setSaving, setLastSavedAt]
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false
        }
      }),
      Placeholder.configure({
        placeholder: 'Start writing, or press "/" for commands...',
        emptyEditorClass: 'is-editor-empty'
      })
    ],
    content: note.content ? JSON.parse(note.content) : '',
    editorProps: {
      attributes: {
        class: 'editor-content outline-none min-h-[300px] px-4 py-2'
      }
    },
    onUpdate: ({ editor }) => {
      const content = JSON.stringify(editor.getJSON())
      if (content !== initialContentRef.current) {
        setHasUnsavedChanges(true)
        saveContent(content)
      }
    }
  })

  // Update store with editor instance
  useEffect(() => {
    setEditor(editor)
    return () => setEditor(null)
  }, [editor, setEditor])

  // Update editor content when note changes
  useEffect(() => {
    if (editor && note.content !== initialContentRef.current) {
      initialContentRef.current = note.content
      const content = note.content ? JSON.parse(note.content) : ''
      editor.commands.setContent(content)
    }
  }, [editor, note.id, note.content])

  // Handle title change
  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    await updateNote(note.id, { title })
  }

  // Handle title key down (Enter to focus editor)
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      editor?.commands.focus('start')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Title */}
      <div className="px-4 pt-4">
        <input
          ref={titleRef}
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
