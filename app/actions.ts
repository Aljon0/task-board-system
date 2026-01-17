'use server'

import { prisma } from '@/lib/prisma';
import { BoardWithTaskCount, BoardWithTasks, TaskStatus } from '@/types';
import { revalidatePath } from 'next/cache';

// Define consistent return types
type SuccessResult<T = unknown> = { success: true; data: T }
type ErrorResult = { success: false; error: string }
type ActionResult<T = unknown> = SuccessResult<T> | ErrorResult

export async function getBoards(): Promise<ActionResult<BoardWithTaskCount[]>> {
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

export async function getBoard(id: string): Promise<ActionResult<BoardWithTasks>> {
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

export async function createBoard(formData: FormData): Promise<ActionResult> {
  try {
    const name = formData.get('name')
    const description = formData.get('description')

    // Validate name exists and is a string
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return { success: false, error: 'Board name is required' }
    }

    // Validate name length
    if (name.trim().length > 255) {
      return { success: false, error: 'Board name is too long (max 255 characters)' }
    }

    const board = await prisma.board.create({
      data: {
        name: name.trim(),
        description: description && typeof description === 'string' ? description.trim() : null
      }
    })

    revalidatePath('/')
    
    // Return serializable data only
    return { 
      success: true, 
      data: {
        id: board.id,
        name: board.name,
        description: board.description,
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString()
      }
    }
  } catch (error) {
    console.error('Error creating board:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for common Prisma errors
      if (error.message.includes('SQLITE') || error.message.includes('database')) {
        return { success: false, error: 'Database error. Please try again or contact support.' }
      }
      if (error.message.includes('Unique constraint')) {
        return { success: false, error: 'A board with this name already exists' }
      }
      return { success: false, error: `Failed to create board: ${error.message}` }
    }
    
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function deleteBoard(id: string): Promise<ActionResult> {
  try {
    await prisma.board.delete({
      where: { id }
    })

    revalidatePath('/')
    return { success: true, data: null }
  } catch (error) {
    console.error('Error deleting board:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return { success: false, error: 'Board not found' }
      }
      if (error.message.includes('SQLITE') || error.message.includes('database')) {
        return { success: false, error: 'Database error. Please try again or contact support.' }
      }
      return { success: false, error: `Failed to delete board: ${error.message}` }
    }
    
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function createTask(boardId: string, formData: FormData): Promise<ActionResult> {
  try {
    const title = formData.get('title')
    const description = formData.get('description')
    const status = formData.get('status') as TaskStatus | null

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return { success: false, error: 'Task title is required' }
    }

    // Validate title length
    if (title.trim().length > 255) {
      return { success: false, error: 'Task title is too long (max 255 characters)' }
    }

    // Verify board exists
    const board = await prisma.board.findUnique({
      where: { id: boardId }
    })

    if (!board) {
      return { success: false, error: 'Board not found' }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description && typeof description === 'string' ? description.trim() : null,
        status: status || 'todo',
        boardId
      }
    })

    revalidatePath(`/board/${boardId}`)
    
    // Return serializable data
    return { 
      success: true, 
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        boardId: task.boardId,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      }
    }
  } catch (error) {
    console.error('Error creating task:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('SQLITE') || error.message.includes('database')) {
        return { success: false, error: 'Database error. Please try again or contact support.' }
      }
      if (error.message.includes('Foreign key constraint')) {
        return { success: false, error: 'Board not found' }
      }
      return { success: false, error: `Failed to create task: ${error.message}` }
    }
    
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function updateTask(
  taskId: string,
  boardId: string,
  data: { title?: string; status?: TaskStatus; description?: string }
): Promise<ActionResult> {
  try {
    // Validate title if provided
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        return { success: false, error: 'Task title cannot be empty' }
      }
      if (data.title.trim().length > 255) {
        return { success: false, error: 'Task title is too long (max 255 characters)' }
      }
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.description !== undefined && { description: data.description?.trim() || null })
      }
    })

    revalidatePath(`/board/${boardId}`)
    
    // Return serializable data
    return { 
      success: true, 
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        boardId: task.boardId,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      }
    }
  } catch (error) {
    console.error('Error updating task:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return { success: false, error: 'Task not found' }
      }
      if (error.message.includes('SQLITE') || error.message.includes('database')) {
        return { success: false, error: 'Database error. Please try again or contact support.' }
      }
      return { success: false, error: `Failed to update task: ${error.message}` }
    }
    
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function deleteTask(taskId: string, boardId: string): Promise<ActionResult> {
  try {
    await prisma.task.delete({
      where: { id: taskId }
    })

    revalidatePath(`/board/${boardId}`)
    return { success: true, data: null }
  } catch (error) {
    console.error('Error deleting task:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return { success: false, error: 'Task not found' }
      }
      if (error.message.includes('SQLITE') || error.message.includes('database')) {
        return { success: false, error: 'Database error. Please try again or contact support.' }
      }
      return { success: false, error: `Failed to delete task: ${error.message}` }
    }
    
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}