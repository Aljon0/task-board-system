'use client'

import { Task, TaskStatus } from '@/types'
import TaskCard from './TaskCard'

type Props = {
  title: string
  status: TaskStatus
  tasks: Task[]
  boardId: string
}

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 border-gray-300',
  in_progress: 'bg-blue-50 border-blue-300',
  done: 'bg-green-50 border-green-300'
}

export default function TaskColumn({ title, status, tasks, boardId }: Props) {
  return (
    <div className={`rounded-lg border-2 ${statusColors[status]} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="bg-white px-2 py-1 rounded text-sm font-medium text-gray-600">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No tasks
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} boardId={boardId} />
          ))
        )}
      </div>
    </div>
  )
}