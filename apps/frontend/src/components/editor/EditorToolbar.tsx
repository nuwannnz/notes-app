import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Save,
  FileCode
} from 'lucide-react'
import { IconButton } from '@/components/ui'
import { useStore } from '@/store'
import { cn } from '@/utils'

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const { isSaving, hasUnsavedChanges, lastSavedAt } = useStore()

  if (!editor) return null

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-neutral-200 dark:border-neutral-700 bg-muted-light dark:bg-muted-dark">
      {/* History */}
      <div className="flex items-center gap-0.5">
        <IconButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
          size="sm"
        >
          <Undo className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
          size="sm"
        >
          <Redo className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />

      {/* Text formatting */}
      <div className="flex items-center gap-0.5">
        <IconButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Bold (Ctrl+B)"
          size="sm"
        >
          <Bold className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Italic (Ctrl+I)"
          size="sm"
        >
          <Italic className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(editor.isActive('strike') && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Strikethrough"
          size="sm"
        >
          <Strikethrough className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(editor.isActive('code') && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Inline code"
          size="sm"
        >
          <Code className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />

      {/* Headings */}
      <div className="flex items-center gap-0.5">
        <IconButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(editor.isActive('heading', { level: 1 }) && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Heading 1"
          size="sm"
        >
          <Heading1 className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editor.isActive('heading', { level: 2 }) && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Heading 2"
          size="sm"
        >
          <Heading2 className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(editor.isActive('heading', { level: 3 }) && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Heading 3"
          size="sm"
        >
          <Heading3 className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />

      {/* Lists and blocks */}
      <div className="flex items-center gap-0.5">
        <IconButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Bullet list"
          size="sm"
        >
          <List className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Numbered list"
          size="sm"
        >
          <ListOrdered className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn(editor.isActive('taskList') && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Task list (checkboxes)"
          size="sm"
        >
          <ListTodo className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(editor.isActive('codeBlock') && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Code block"
          size="sm"
        >
          <FileCode className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive('blockquote') && 'bg-neutral-200 dark:bg-neutral-700')}
          title="Quote"
          size="sm"
        >
          <Quote className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
          size="sm"
        >
          <Minus className="h-4 w-4" />
        </IconButton>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save status */}
      <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
        {isSaving ? (
          <span className="flex items-center gap-1">
            <Save className="h-3 w-3 animate-pulse" />
            Saving...
          </span>
        ) : hasUnsavedChanges ? (
          <span>Unsaved changes</span>
        ) : lastSavedAt ? (
          <span>Saved at {formatTime(lastSavedAt)}</span>
        ) : null}
      </div>
    </div>
  )
}
