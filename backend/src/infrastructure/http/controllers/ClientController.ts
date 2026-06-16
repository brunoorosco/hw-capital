import { Request, Response } from 'express';
import { PrismaClient } from '../../database/prisma/PrismaClient';
import { z } from 'zod';
import { AppError } from '../middlewares/errorHandler';

const prisma = PrismaClient.getInstance();

const createClientSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string(),
  cnpj: z.string(),
  address: z.string().optional(),
  plan: z.string(),
  monthlyValue: z.number().positive(),
  notes: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

export class ClientController {
  private userScope(req: Request): any {
    if (req.user?.role === 'ADMIN') return {};
    return { responsibleId: req.user!.id };
  }

  async list(req: Request, res: Response) {
    const { search, status } = req.query;

    const where: any = { ...this.userScope(req) };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { cnpj: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(clients);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const where: any = { id, ...this.userScope(req) };

    const client = await prisma.client.findFirst({
      where,
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reconciliations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        cashFlows: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return res.json(client);
  }

  async create(req: Request, res: Response) {
    const data = createClientSchema.parse(req.body);

    const cnpjExists = await prisma.client.findUnique({
      where: { cnpj: data.cnpj },
    });

    if (cnpjExists) {
      throw new AppError('CNPJ já cadastrado', 400);
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        status: 'active',
        responsibleId: req.user!.id,
      },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json(client);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = updateClientSchema.parse(req.body);

    const where: any = { id, ...this.userScope(req) };

    const clientExists = await prisma.client.findFirst({ where });

    if (!clientExists) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...data,
        responsibleId: undefined,
      },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json(client);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const where: any = { id, ...this.userScope(req) };

    const clientExists = await prisma.client.findFirst({ where });

    if (!clientExists) {
      throw new AppError('Cliente não encontrado', 404);
    }

    await prisma.client.delete({
      where: { id },
    });

    return res.status(204).send();
  }

  async deactivate(req: Request, res: Response) {
    const { id } = req.params;

    const where: any = { id, ...this.userScope(req) };

    const client = await prisma.client.findFirst({ where });

    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const updated = await prisma.client.update({
      where: { id },
      data: { status: 'inactive' },
    });

    return res.json(updated);
  }
}
