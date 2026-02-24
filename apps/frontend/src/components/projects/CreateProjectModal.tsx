import { useState } from 'react'
import { useStore } from '@/store'
import { useAuth } from '@/features/auth/AuthContext'
import { Modal, Input, Button } from '@/components/ui'
import type { ProjectColor } from '@/core/entities'
import { cn } from '@/utils'

export const COLOR_OPTIONS: { value: ProjectColor; label: string; swatch: string }[] = [
  { value: 'blue',   label: 'Blue',   swatch: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', swatch: 'bg-purple-500' },
  { value: 'rose',   label: 'Rose',   swatch: 'bg-rose-500' },
  { value: 'orange', label: 'Orange', swatch: 'bg-orange-500' },
  { value: 'green',  label: 'Green',  swatch: 'bg-green-500' },
  { value: 'teal',   label: 'Teal',   swatch: 'bg-teal-500' },
  { value: 'amber',  label: 'Amber',  swatch: 'bg-amber-500' },
  { value: 'slate',  label: 'Slate',  swatch: 'bg-slate-500' },
]

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { createProject, selectProject } = useStore()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [color, setColor] = useState<ProjectColor>('blue')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !user) return

    const project = await createProject(user.userId, {
      name: name.trim(),
      color
    })
    selectProject(project.id)

    // Reset & close
    setName('')
    setColor('blue')
    onClose()
  }

  const handleClose = () => {
    setName('')
    setColor('blue')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Name</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Project name"
            autoFocus
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                title={opt.label}
                onClick={() => setColor(opt.value)}
                className={cn(
                  'w-8 h-8 rounded-full transition-all duration-150',
                  opt.swatch,
                  color === opt.value
                    ? 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-neutral-100 dark:ring-offset-neutral-800 scale-110'
                    : 'hover:scale-110 opacity-70 hover:opacity-100'
                )}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!name.trim()}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
