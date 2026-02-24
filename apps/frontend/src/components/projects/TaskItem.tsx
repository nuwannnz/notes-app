import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import type { Task } from '@/core/entities'
import { useStore } from '@/store'
import { IconButton, Input } from '@/components/ui'
import { cn } from '@/utils'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, updateTask, deleteTask } = useStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description)

  const handleSaveTitle = async () => {
    if (editTitle.trim()) {
      await updateTask(task.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleSaveDescription = async () => {
    await updateTask(task.id, { description: editDescription.trim() })
  }

  return (
    <div className={cn(
      'group flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors',
      task.isCompleted && 'opacity-60'
    )}>
      {/* Checkbox */}
      <button
        onClick={() => toggleTask(task.id)}
        className={cn(
          'mt-0.5 shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
          task.isCompleted
            ? 'bg-primary-500 border-primary-500 text-white'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-500'
        )}
      >
        {task.isCompleted && <Check className="h-3 w-3" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
              autoFocus
              className="h-7 text-sm py-0 px-2"
            />
            <Input
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              onBlur={handleSaveDescription}
              onKeyDown={e => e.key === 'Enter' && handleSaveDescription()}
              placeholder="Add description..."
              className="h-7 text-xs py-0 px-2"
            />
          </div>
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => {
              setEditTitle(task.title)
              setEditDescription(task.description)
              setIsEditing(true)
            }}
          >
            <p className={cn(
              'text-sm',
              task.isCompleted && 'line-through'
            )}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {task.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      <IconButton
        onClick={() => deleteTask(task.id)}
        title="Delete task"
        size="sm"
        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </IconButton>
    </div>
  )
}
