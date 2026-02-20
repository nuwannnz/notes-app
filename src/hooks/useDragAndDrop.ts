import { useState, useCallback, type DragEvent } from 'react'

export type DragItemType = 'note' | 'folder'

export interface DragItem {
  type: DragItemType
  id: string
}

export interface DropTarget {
  type: 'folder' | 'root'
  id: string | null
}

export function useDragAndDrop() {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  const handleDragStart = useCallback((e: DragEvent, item: DragItem) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/json', JSON.stringify(item))
    setDraggedItem(item)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDropTarget(null)
  }, [])

  const handleDragOver = useCallback((e: DragEvent, target: DropTarget) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(target)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropTarget(null)
  }, [])

  const handleDrop = useCallback((e: DragEvent, _target: DropTarget): DragItem | null => {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (!data) return null

    try {
      const item: DragItem = JSON.parse(data)
      setDraggedItem(null)
      setDropTarget(null)
      return item
    } catch {
      return null
    }
  }, [])

  return {
    draggedItem,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}
