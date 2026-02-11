import { Request, Response } from 'express';
import { prisma } from '../../database/prisma/PrismaClient';
import bcrypt from 'bcryptjs';

export class UserController {
  // Listar todos os usuários
  async list(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true,
          // Não retorna password
        },
        orderBy: {
          name: 'asc',
        },
      });

      return res.json(users);
    } catch (error: any) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao listar usuários',
      });
    }
  }

  // Buscar usuário por ID
  async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuário não encontrado',
        });
      }

      return res.json(user);
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar usuário',
      });
    }
  }

  // Criar usuário
  async create(req: Request, res: Response) {
    try {
      const { name, email, password, role, active } = req.body;

      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email já cadastrado',
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'USER',
          active: active ?? true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      return res.status(201).json(user);
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao criar usuário',
      });
    }
  }

  // Atualizar usuário
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, password, role, active } = req.body;

      const data: any = {
        name,
        email,
        role,
        active,
      };

      // Se forneceu nova senha, faz hash
      if (password) {
        data.password = await bcrypt.hash(password, 10);
      }

      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          updatedAt: true,
        },
      });

      return res.json(user);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar usuário',
      });
    }
  }

  // Deletar usuário
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao deletar usuário',
      });
    }
  }
}
