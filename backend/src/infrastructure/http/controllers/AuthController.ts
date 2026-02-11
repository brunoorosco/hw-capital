import { Request, Response } from 'express';
import { PrismaClient } from '../../../infrastructure/database/prisma/PrismaClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AppError } from '../middlewares/errorHandler';

const prisma = PrismaClient.getInstance();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'USER']).optional(),
});

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    if (!user.active) {
      throw new AppError('Usuário inativo', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas', 401);
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
      }
    );

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  }

  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);

    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new AppError('Email já cadastrado', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        role: data.role || 'USER',
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
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
    });

    return res.json(user);
  }
}
