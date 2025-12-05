// app/api/auth/me/route.ts
import { prisma } from '@/prisma/prisma-client'
import { verifyToken } from '@/utils/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Токен не предоставлен' },
                { status: 401 }
            )
        }

        const token = authHeader.substring(7)
        const decoded = verifyToken(token)

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                login: true,
                name: true,
                createdAt: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Пользователь не найден' },
                { status: 404 }
            )
        }

        return NextResponse.json({ user })

    } catch (error) {
        console.error('Auth error:', error)
        return NextResponse.json(
            { error: 'Неверный токен' },
            { status: 401 }
        )
    }
}