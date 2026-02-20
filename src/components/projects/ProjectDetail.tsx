import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { useStore, useSelectedProject, useProjectProgress } from '@/store'
import { IconButton, Input } from '@/components/ui'
import { TaskItem } from './TaskItem'
import { PROJECT_COLOR_CLASSES } from './ProjectsView'
import { COLOR_OPTIONS } from './CreateProjectModal'
import { cn } from '@/utils'
import type { ProjectColor } from '@/core/entities'

export function ProjectDetail() {
  const selectedProject = useSelectedProject()
  const { tasks, loadTasks, createTask, updateProject, deleteProject, selectProject, isLoadingTasks } = useStore()
  const progress = useProjectProgress()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject.id)
    }
  }, [selectedProject?.id, loadTasks])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setIsColorPickerOpen(false)
      }
    }
    if (isColorPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isColorPickerOpen])

  const handleColorChange = useCallback(async (color: ProjectColor) => {
    if (selectedProject) {
      await updateProject(selectedProject.id, { color })
    }
    setIsColorPickerOpen(false)
  }, [selectedProject, updateProject])

  const handleSaveName = useCallback(async () => {
    if (selectedProject && editName.trim()) {
      await updateProject(selectedProject.id, { name: editName.trim() })
    }
    setIsEditingName(false)
  }, [selectedProject, editName, updateProject])

  const handleSaveDescription = useCallback(async () => {
    if (selectedProject) {
      await updateProject(selectedProject.id, { description: editDescription.trim() })
    }
    setIsEditingDescription(false)
  }, [selectedProject, editDescription, updateProject])

  const handleAddTask = async () => {
    if (!selectedProject || !newTaskTitle.trim()) return
    await createTask({
      projectId: selectedProject.id,
      title: newTaskTitle.trim()
    })
    setNewTaskTitle('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
  }

  const handleDelete = async () => {
    if (selectedProject) {
      await deleteProject(selectedProject.id)
      selectProject(null)
    }
  }

  if (!selectedProject) {
    return null
  }

  const colors = PROJECT_COLOR_CLASSES[selectedProject.color] ?? PROJECT_COLOR_CLASSES.blue
  const completedTasks = tasks.filter(t => t.isCompleted)
  const pendingTasks = tasks.filter(t => !t.isCompleted)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-surface-dark">
      {/* Project Header */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <IconButton onClick={() => selectProject(null)} title="Back to projects" className="mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </IconButton>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="relative" ref={colorPickerRef}>
                  <button
                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    title="Change color"
                    className={cn(
                      'w-4 h-4 rounded-full shrink-0 transition-transform hover:scale-125 ring-offset-1',
                      colors.accent,
                      isColorPickerOpen && 'ring-2 ring-neutral-400'
                    )}
                  />
                  {isColorPickerOpen && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-20 flex gap-1.5">
                      {COLOR_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleColorChange(opt.value)}
                          title={opt.label}
                          className={cn(
                            'w-6 h-6 rounded-full transition-transform hover:scale-110',
                            opt.swatch,
                            selectedProject.color === opt.value && 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-neutral-100 dark:ring-offset-neutral-800'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {isEditingName ? (
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                    className="text-2xl font-bold h-auto py-1 px-2"
                  />
                ) : (
                  <h1
                    className="text-2xl font-bold cursor-pointer hover:text-primary-500 transition-colors"
                    onClick={() => {
                      setEditName(selectedProject.name)
                      setIsEditingName(true)
                    }}
                  >
                    {selectedProject.name}
                  </h1>
                )}
              </div>

              {isEditingDescription ? (
                <Input
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  onKeyDown={e => e.key === 'Enter' && handleSaveDescription()}
                  autoFocus
                  placeholder="Add a description..."
                  className="mt-2 text-sm h-auto py-1 px-2"
                />
              ) : (
                <p
                  className={cn(
                    'mt-2 text-sm cursor-pointer transition-colors',
                    selectedProject.description
                      ? 'text-neutral-600 dark:text-neutral-400 hover:text-primary-500'
                      : 'text-neutral-400 dark:text-neutral-500 italic hover:text-primary-500'
                  )}
                  onClick={() => {
                    setEditDescription(selectedProject.description)
                    setIsEditingDescription(true)
                  }}
                >
                  {selectedProject.description || 'Click to add a description...'}
                </p>
              )}
            </div>
          </div>

          <IconButton onClick={handleDelete} title="Delete project" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>

        {/* Progress Bar */}
        {progress.total > 0 && (
          <div className="mt-4 ml-10">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
              <span>{progress.completed} of {progress.total} tasks completed</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', colors.accent)}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Task Input */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-neutral-400 shrink-0" />
          <Input
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="h-8 text-sm border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingTasks ? (
          <div className="flex items-center justify-center py-8 text-neutral-400">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-neutral-400 dark:text-neutral-500">
            <p className="text-sm">No tasks yet. Add your first task above.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {/* Pending Tasks */}
            {pendingTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <>
                <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900/50">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Completed ({completedTasks.length})
                  </span>
                </div>
                {completedTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
