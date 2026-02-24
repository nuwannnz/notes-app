import { useState } from 'react'
import { Plus, FolderKanban } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/utils'
import type { Project, ProjectColor } from '@/core/entities'
import { CreateProjectModal } from './CreateProjectModal'

const PROJECT_COLOR_CLASSES: Record<ProjectColor, { bg: string; border: string; text: string; accent: string }> = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-200 dark:border-blue-800',   text: 'text-blue-700 dark:text-blue-300',   accent: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', accent: 'bg-purple-500' },
  rose:   { bg: 'bg-rose-50 dark:bg-rose-950/30',   border: 'border-rose-200 dark:border-rose-800',   text: 'text-rose-700 dark:text-rose-300',   accent: 'bg-rose-500' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', accent: 'bg-orange-500' },
  green:  { bg: 'bg-green-50 dark:bg-green-950/30',  border: 'border-green-200 dark:border-green-800',  text: 'text-green-700 dark:text-green-300',  accent: 'bg-green-500' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-950/30',   border: 'border-teal-200 dark:border-teal-800',   text: 'text-teal-700 dark:text-teal-300',   accent: 'bg-teal-500' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-950/30',  border: 'border-amber-200 dark:border-amber-800',  text: 'text-amber-700 dark:text-amber-300',  accent: 'bg-amber-500' },
  slate:  { bg: 'bg-slate-50 dark:bg-slate-950/30',  border: 'border-slate-200 dark:border-slate-800',  text: 'text-slate-700 dark:text-slate-300',  accent: 'bg-slate-500' },
}

export { PROJECT_COLOR_CLASSES }

interface ProjectCardProps {
  project: Project
  onClick: (id: string) => void
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
  const colors = PROJECT_COLOR_CLASSES[project.color] ?? PROJECT_COLOR_CLASSES.blue

  return (
    <button
      onClick={() => onClick(project.id)}
      className={cn(
        'flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        'text-left w-full',
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-3 h-3 rounded-full', colors.accent)} />
        <FolderKanban className={cn('h-4 w-4', colors.text)} />
      </div>
      <h3 className={cn('font-semibold text-sm', colors.text)}>{project.name}</h3>
      {project.description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
          {project.description}
        </p>
      )}
    </button>
  )
}

export function ProjectsView() {
  const { projects, selectProject, isLoadingProjects } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenProject = (id: string) => {
    selectProject(id)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-surface-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-200 dark:border-neutral-700">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            Loading projects...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={handleOpenProject}
              />
            ))}

            {/* Add Project Card */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={cn(
                'flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed',
                'border-neutral-300 dark:border-neutral-600',
                'text-neutral-400 dark:text-neutral-500',
                'hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20',
                'transition-all duration-200 min-h-[100px]'
              )}
            >
              <Plus className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">New Project</span>
            </button>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
