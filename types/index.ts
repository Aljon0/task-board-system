import { Board, Task } from '@prisma/client'

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export type BoardWithTasks = Board & {
  tasks: Task[]
}

export type BoardWithTaskCount = Board & {
  _count: {
    tasks: number
  }
}

export type { Board, Task }
