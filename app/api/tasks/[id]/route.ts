// app/api/tasks/[id]/route.ts
import { prisma } from '@/prisma/prisma-client'
import { verifyToken } from '@/utils/auth'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    const { title, start, end, color, done, emoji, date, weekly, weeklyDay } = await request.json()

    const existingTask = await prisma.task.findFirst({
      where: { id: id, userId: decoded.userId }
    })

    if (!existingTask) {
      return new Response('Task not found', { status: 404 })
    }

    const task = await prisma.task.update({
      where: { id: id },
      data: {
        ...(title !== undefined && { title }),
        ...(start !== undefined && { start }),
        ...(end !== undefined && { end }),
        ...(color !== undefined && { color }),
        ...(done !== undefined && { done }),
        ...(emoji !== undefined && { emoji }),
        ...(weekly !== undefined && { weekly }),
        ...(weeklyDay !== undefined && { weeklyDay }),
        ...(date !== undefined && {
          date: weekly ? null : new Date(date),
        }),

      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении задачи' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    const existingTask = await prisma.task.findFirst({
      where: { id: id, userId: decoded.userId }
    })

    if (!existingTask) {
      return new Response('Task not found', { status: 404 })
    }

    await prisma.task.delete({
      where: { id: id }
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении задачи' },
      { status: 500 }
    )
  }
}