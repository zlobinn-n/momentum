// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma-client'
import { generateToken, verifyPassword } from '@/utils/auth'

export async function POST(request: Request) {
    try {
        const { login, password } = await request.json()

        if (!login || !password) {
            return NextResponse.json(
                { error: 'login и пароль обязательны' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { login }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Неверный login или пароль' },
                { status: 401 }
            )
        }

        const isValidPassword = await verifyPassword(password, user.password)
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Неверный login или пароль' },
                { status: 401 }
            )
        }

        const token = generateToken({
            userId: user.id,
            login: user.login
        })

        return NextResponse.json({
            user: {
                id: user.id,
                login: user.login,
                name: user.name,
                createdAt: user.createdAt
            },
            token
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Ошибка при входе' },
            { status: 500 }
        )
    }
}