'use client'

import { deleteTask, updateTask } from '@/app/actions'
import { Task, TaskStatus } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  task: Task
  boardId: string
}

export default function TaskCard({ task, boardId }: Props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string>('')

  async function handleStatusChange(newStatus: TaskStatus) {
    setIsUpdating(true)
    setError('')
    try {
      const result = await updateTask(task.id, boardId, { status: newStatus })
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || 'Failed to update status')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error updating status:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleTitleSave() {
    if (title.trim() === task.title) {
      setIsEditing(false)
      return
    }

    if (title.trim().length === 0) {
      setTitle(task.title)
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    setError('')
    try {
      const result = await updateTask(task.id, boardId, { title: title.trim() })
      if (result.success) {
        router.refresh()
      } else {
        setTitle(task.title)
        setError(result.error || 'Failed to update title')
      }
    } catch (err) {
      setTitle(task.title)
      setError('An unexpected error occurred')
      console.error('Error updating title:', err)
    } finally {
      setIsUpdating(false)
      setIsEditing(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete task "${task.title}"?`)) return

    setIsDeleting(true)
    setError('')
    try {
      const result = await deleteTask(task.id, boardId)
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || 'Failed to delete task')
        setIsDeleting(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error deleting task:', err)
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      {/* Title */}
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTitleSave()
            if (e.key === 'Escape') {
              setTitle(task.title)
              setIsEditing(false)
            }
          }}
          autoFocus
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        />
      ) : (
        <h4
          onClick={() => setIsEditing(true)}
          className="font-medium text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
        >
          {task.title}
        </h4>
      )}

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      {/* Status Selector */}
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Status</label>
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
          disabled={isUpdating}
          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 mb-2">
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 disabled:text-gray-400"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}