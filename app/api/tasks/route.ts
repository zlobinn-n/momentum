// app/api/tasks/route.ts
import { NextResponse } from 'next/server'
import { verifyToken } from '@/utils/auth'
import { prisma } from '@/prisma/prisma-client'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    const tasks = await prisma.task.findMany({
      where: { userId: decoded.userId },
      orderBy: [{ date: 'asc' }, { start: 'asc' }]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Get tasks error:', error)
    return new Response('Unauthorized', { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    const { title, start, end, color, done, emoji, date, weekly, weeklyDay } = await request.json()

    const task = await prisma.task.create({
      data: {
        title,
        start,
        end,
        color,
        done: done || false,
        emoji: emoji || null,
        date: weekly ? null : new Date(date), 
        userId: decoded.userId,
        weekly: weekly ?? false,
        weeklyDay: weeklyDay ?? null,
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании задачи' },
      { status: 500 }
    )
  }
}