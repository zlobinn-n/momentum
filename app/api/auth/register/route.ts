// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { hashPassword, generateToken, AuthError } from '../../../../utils/auth'
import { prisma } from '@/prisma/prisma-client'

export async function POST(request: Request) {
  try {
    const { login, password, name } = await request.json()

    if (!login || !password) {
      return NextResponse.json(
        { error: 'login и пароль обязательны' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { login }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким login уже существует' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        name
      }
    })

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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
}