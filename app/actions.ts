'use server'

import { prisma } from '@/lib/prisma';
import { BoardWithTaskCount, TaskStatus } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getBoards(): Promise<
  | { success: true; data: BoardWithTaskCount[] }
  | { success: false; error: string }
> {
  try {
    const boards = await prisma.board.findMany({
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: boards }
  } catch (error) {
    console.error('Error fetching boards:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: `Failed to fetch boards: ${errorMessage}` }
  }
}

export async function getBoard(id: string) {
  try {
    // Validate id before querying
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return { success: false, error: 'Invalid board ID' }
    }

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!board) {
      return { success: false, error: 'Board not found' }
    }
    
    return { success: true, data: board }
  } catch (error) {
    console.error('Error fetching board:', error)
    return { success: false, error: 'Failed to fetch board' }
  }
}

export async function createBoard(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null

    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Board name is required' }
    }

    const board = await prisma.board.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    revalidatePath('/')
    return { success: true, data: board }
  } catch (error) {
    console.error('Error creating board:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: `Failed to create board: ${errorMessage}` }
  }
}

export async function deleteBoard(id: string) {
  try {
    await prisma.board.delete({
      where: { id }
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting board:', error)
    return { success: false, error: 'Failed to delete board' }
  }
}

export async function createTask(boardId: string, formData: FormData) {
  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const status = (formData.get('status') as TaskStatus) || 'todo'

    if (!title || title.trim().length === 0) {
      return { success: false, error: 'Task title is required' }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status,
        boardId
      }
    })

    revalidatePath(`/board/${boardId}`)
    return { success: true, data: task }
  } catch (error) {
    console.error('Error creating task:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

export async function updateTask(
  taskId: string,
  boardId: string,
  data: { title?: string; status?: TaskStatus; description?: string }
) {
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.description !== undefined && { description: data.description?.trim() || null })
      }
    })

    revalidatePath(`/board/${boardId}`)
    return { success: true, data: task }
  } catch (error) {
    console.error('Error updating task:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

export async function deleteTask(taskId: string, boardId: string) {
  try {
    await prisma.task.delete({
      where: { id: taskId }
    })

    revalidatePath(`/board/${boardId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting task:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}