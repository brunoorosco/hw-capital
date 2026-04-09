import { Request, Response } from 'express'
import { PrismaClient } from '../../../infrastructure/database/prisma/PrismaClient'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { AppError } from '../middlewares/errorHandler'
import { container } from 'tsyringe'
import { LoginGoogleUsecase } from '@domain/use-cases/auth/google'

const prisma = PrismaClient.getInstance()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'USER']).optional(),
})

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new AppError('Credenciais inválidas', 401)
    }

    if (!user.active) {
      throw new AppError('Usuário inativo', 401)
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas', 401)
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    )

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  }

  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body)

    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (userExists) {
      throw new AppError('Email já cadastrado', 400)
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        role: data.role || 'USER',
      },
    })

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    )

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  }

  async me(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    })

    return res.json(user)
  }

  async google(req: Request, res: Response) {
    try {
      const { token } = z
        .object({ token: z.string().min(1, 'Token é obrigatório') })
        .parse(req.body)

      if (!token) {
        throw new AppError('Token do Google é obrigatório', 400)
      }

      let loginGoogleUsecase: LoginGoogleUsecase
      try {
        loginGoogleUsecase = container.resolve(LoginGoogleUsecase)
      } catch (containerError) {
        console.error('Container resolution error:', containerError)
        throw new AppError(
          'Erro ao carregar dependências. Tente novamente',
          500
        )
      }

      const result = await loginGoogleUsecase.auth({ token })

      const jwtToken = jwt.sign(
        {
          userId: result.user.id,
          email: result.user.email,
          role: 'USER',
          provider: 'google',
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        },
      )

      return res.json({
        user: result.user,
        token: jwtToken,
      })
    } catch (error) {
      console.error('Google auth error:', error)

      if (error instanceof z.ZodError) {
        throw new AppError(`Erro de validação: ${error.errors[0]?.message}`, 400)
      }

      if (error instanceof AppError) {
        throw error
      }

      if (error instanceof Error) {
        throw new AppError(error.message || 'Falha na autenticação com Google', 401)
      }

      throw new AppError('Falha na autenticação com Google', 401)
    }
  }
}
