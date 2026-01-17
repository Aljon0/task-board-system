'use client'

import { deleteBoard } from '@/app/actions'
import { BoardWithTaskCount } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  boards: BoardWithTaskCount[]
}

export default function BoardList({ boards }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" and all its tasks?`)) return

    setDeletingId(id)
    setError('')
    try {
      const result = await deleteBoard(id)
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || 'Failed to delete board')
        setDeletingId(null)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error deleting board:', err)
      setDeletingId(null)
    }
  }

  if (boards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500">No boards yet. Create your first board above!</p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board) => (
        <div
          key={board.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <Link href={`/board/${board.id}`} className="block p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {board.name}
            </h3>
            {board.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {board.description}
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{board._count.tasks} tasks</span>
              <span>{new Date(board.createdAt).toLocaleDateString()}</span>
            </div>
          </Link>
          
          <div className="border-t px-6 py-3">
            <button
              onClick={(e) => {
                e.preventDefault()
                handleDelete(board.id, board.name)
              }}
              disabled={deletingId === board.id}
              className="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
            >
              {deletingId === board.id ? 'Deleting...' : 'Delete Board'}
            </button>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}